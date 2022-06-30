import { BlockNumber, Hash } from '@polkadot/types/interfaces/runtime';
import BigNumber from 'bignumber.js';
import { values } from 'lodash';

import {
  Account,
  Asset,
  AuthorizationRequest,
  Context,
  Entity,
  Identity,
  moveFunds,
  PolymeshError,
  quitCustody,
  setCustodian,
} from '~/internal';
import { settlements } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  ErrorCode,
  MoveFundsParams,
  NoArgsProcedureMethod,
  ProcedureMethod,
  ResultSet,
  SetCustodianParams,
} from '~/types';
import { Ensured, QueryReturnType } from '~/types/utils';
import {
  addressToKey,
  balanceToBigNumber,
  bigNumberToU32,
  hashToString,
  identityIdToString,
  keyToAddress,
  middlewarePortfolioToPortfolio,
  portfolioIdToMeshPortfolioId,
  tickerToString,
} from '~/utils/conversion';
import {
  asAsset,
  calculateNextKey,
  createProcedureMethod,
  getIdentity,
  toHumanReadable,
} from '~/utils/internal';

import { HistoricSettlement, PortfolioBalance } from './types';

export interface UniqueIdentifiers {
  did: string;
  id?: BigNumber;
}

export interface HumanReadable {
  did: string;
  id?: string;
}

const notExistsMessage = "The Portfolio doesn't exist or was removed by its owner";

/**
 * Represents a base Portfolio for a specific Identity in the Polymesh blockchain
 */
export abstract class Portfolio extends Entity<UniqueIdentifiers, HumanReadable> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { did, id } = identifier as UniqueIdentifiers;

    return typeof did === 'string' && (id === undefined || id instanceof BigNumber);
  }

  /**
   * Identity of the Portfolio's owner
   */
  public owner: Identity;

  /**
   * internal Portfolio identifier (unused for default Portfolio)
   */
  protected _id?: BigNumber;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { did, id } = identifiers;

    this.owner = new Identity({ did }, context);
    this._id = id;

    this.setCustodian = createProcedureMethod(
      { getProcedureAndArgs: args => [setCustodian, { ...args, did, id }] },
      context
    );
    this.moveFunds = createProcedureMethod(
      { getProcedureAndArgs: args => [moveFunds, { ...args, from: this }] },
      context
    );
    this.quitCustody = createProcedureMethod(
      { getProcedureAndArgs: () => [quitCustody, { portfolio: this }], voidArgs: true },
      context
    );
  }

  /**
   * Return whether an Identity is the Portfolio owner
   *
   * @param args.identity - defaults to the signing Identity
   */
  public async isOwnedBy(args?: { identity: string | Identity }): Promise<boolean> {
    const { owner, context } = this;

    const identity = await getIdentity(args?.identity, context);

    return owner.isEqual(identity);
  }

  /**
   * Return whether an Identity is the Portfolio custodian
   *
   * @param args.identity - optional, defaults to the signing Identity
   */
  public async isCustodiedBy(args?: { identity: string | Identity }): Promise<boolean> {
    const { context } = this;

    const [portfolioCustodian, targetIdentity] = await Promise.all([
      this.getCustodian(),
      getIdentity(args?.identity, context),
    ]);

    return portfolioCustodian.isEqual(targetIdentity);
  }

  /**
   * Retrieve the balances of all Assets in this Portfolio
   *
   * @param args.assets - array of Assets (or tickers) for which to fetch balances (optional, all balances are retrieved if not passed)
   */
  public async getAssetBalances(args?: {
    assets: (string | Asset)[];
  }): Promise<PortfolioBalance[]> {
    const {
      owner: { did },
      _id: portfolioId,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
      context,
    } = this;

    const rawPortfolioId = portfolioIdToMeshPortfolioId({ did, number: portfolioId }, context);
    const [exists, totalBalanceEntries, lockedBalanceEntries] = await Promise.all([
      this.exists(),
      portfolio.portfolioAssetBalances.entries(rawPortfolioId),
      portfolio.portfolioLockedAssets.entries(rawPortfolioId),
    ]);

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: notExistsMessage,
      });
    }

    const assetBalances: Record<string, PortfolioBalance> = {};

    totalBalanceEntries.forEach(([key, balance]) => {
      const ticker = tickerToString(key.args[1]);
      const total = balanceToBigNumber(balance);

      assetBalances[ticker] = {
        asset: new Asset({ ticker }, context),
        total,
        locked: new BigNumber(0),
        free: total,
      };
    });

    lockedBalanceEntries.forEach(([key, balance]) => {
      const ticker = tickerToString(key.args[1]);
      const locked = balanceToBigNumber(balance);

      const tickerBalance = assetBalances[ticker];

      /*
       * this avoids the edge case where an asset holder creates an instruction with a leg
       *   that transfers 0 tokens, while not holding any tokens. This causes the portfolio to list
       *   a locked balance of 0, while not listing any unlocked balance. This will be addressed by a
       *   chain update, but until then this is necessary
       */
      if (!tickerBalance) {
        return;
      }

      tickerBalance.locked = locked;
      tickerBalance.free = assetBalances[ticker].total.minus(locked);
    });

    const mask: PortfolioBalance[] | undefined = args?.assets.map(asset => ({
      total: new BigNumber(0),
      locked: new BigNumber(0),
      free: new BigNumber(0),
      asset: asAsset(asset, context),
    }));

    if (mask) {
      return mask.map(portfolioBalance => {
        const {
          asset: { ticker },
        } = portfolioBalance;

        return assetBalances[ticker] ?? portfolioBalance;
      });
    }

    return values(assetBalances);
  }

  /**
   * Send an invitation to an Identity to assign it as custodian for this Portfolio
   *
   * @note this will create an {@link AuthorizationRequest | Authorization Request} which has to be accepted by the `targetIdentity`.
   *   An {@link Account} or {@link Identity} can fetch its pending Authorization Requests by calling {@link Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link Authorizations.getOne | authorizations.getOne}
   *
   * @note required role:
   *   - Portfolio Custodian
   */
  public setCustodian: ProcedureMethod<SetCustodianParams, AuthorizationRequest>;

  /**
   * Moves funds from this Portfolio to another one owned by the same Identity
   *
   * @note required role:
   *   - Portfolio Custodian
   */
  public moveFunds: ProcedureMethod<MoveFundsParams, void>;

  /**
   * Returns the custody of the portfolio to the portfolio owner unilaterally
   *
   * @note required role:
   *   - Portfolio Custodian
   */
  public quitCustody: NoArgsProcedureMethod<void>;

  /**
   * Retrieve the custodian Identity of this Portfolio
   *
   * @note if no custodian is set, the owner Identity is returned
   */
  public async getCustodian(): Promise<Identity> {
    const {
      owner,
      owner: { did },
      _id: portfolioId,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
      context,
    } = this;

    const rawPortfolioId = portfolioIdToMeshPortfolioId({ did, number: portfolioId }, context);
    const [portfolioCustodian, exists] = await Promise.all([
      portfolio.portfolioCustodian(rawPortfolioId),
      this.exists(),
    ]);

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: notExistsMessage,
      });
    }

    try {
      const rawIdentityId = portfolioCustodian.unwrap();
      return new Identity({ did: identityIdToString(rawIdentityId) }, context);
    } catch (_) {
      return owner;
    }
  }

  /**
   * Retrieve a list of transactions where this portfolio was involved. Can be filtered using parameters
   *
   * @param filters.account - Account involved in the settlement
   * @param filters.ticker - ticker involved in the transaction
   * @param filters.size - page size
   * @param filters.start - page offset
   *
   * @note supports pagination
   * @note uses the middleware
   */
  public async getTransactionHistory(
    filters: {
      account?: string;
      ticker?: string;
      size?: BigNumber;
      start?: BigNumber;
    } = {}
  ): Promise<ResultSet<HistoricSettlement>> {
    const {
      context: {
        polymeshApi: {
          query: { system },
        },
      },
      context,
      owner: { did },
      _id: portfolioId,
    } = this;

    const { account, ticker, size, start } = filters;

    const settlementsPromise = context.queryMiddleware<Ensured<Query, 'settlements'>>(
      settlements({
        identityId: did,
        portfolioNumber: portfolioId ? portfolioId.toString() : null,
        addressFilter: account ? addressToKey(account, context) : undefined,
        tickerFilter: ticker,
        count: size?.toNumber(),
        skip: start?.toNumber(),
      })
    );

    const [result, exists] = await Promise.all([settlementsPromise, this.exists()]);

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: notExistsMessage,
      });
    }

    const {
      data: { settlements: settlementsResult },
    } = result;

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const { items, totalCount } = settlementsResult!;

    const multiParams: BlockNumber[] = [];
    const data: Omit<HistoricSettlement, 'blockHash'>[] = [];

    items!.forEach(item => {
      const { block_id: blockId, result: status, addresses, legs: settlementLegs } = item!;

      const blockNumber = new BigNumber(blockId);
      multiParams.push(bigNumberToU32(blockNumber, context));
      data.push({
        blockNumber,
        status,
        accounts: addresses!.map(
          address => new Account({ address: keyToAddress('0x' + address, context) }, context)
        ),
        legs: settlementLegs.map(leg => {
          return {
            asset: new Asset({ ticker: leg!.ticker }, context),
            amount: new BigNumber(leg!.amount).shiftedBy(-6),
            direction: leg!.direction,
            from: middlewarePortfolioToPortfolio(leg!.from, context),
            to: middlewarePortfolioToPortfolio(leg!.to, context),
          };
        }),
      });
    });
    const count = new BigNumber(totalCount);
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    const next = calculateNextKey(count, size, start);

    let hashes: Hash[] = [];

    if (multiParams.length) {
      hashes = await system.blockHash.multi<QueryReturnType<typeof system.blockHash>>(multiParams);
    }

    return {
      data: data.map((settlement, index) => ({
        ...settlement,
        blockHash: hashToString(hashes[index]),
      })),
      next,
      count,
    };
  }

  /**
   * Return the Portfolio ID and owner DID
   */
  public toHuman(): HumanReadable {
    const {
      _id: id,
      owner: { did },
    } = this;

    const result = {
      did,
    };

    return id ? toHumanReadable({ ...result, id }) : result;
  }
}
