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
import { portfolioMovementsQuery, settlementsQuery } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import { SettlementDirectionEnum } from '~/middleware/typesV1';
import {
  ErrorCode,
  MoveFundsParams,
  NoArgsProcedureMethod,
  ProcedureMethod,
  SetCustodianParams,
  SettlementResultEnum,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  addressToKey,
  balanceToBigNumber,
  identityIdToString,
  keyToAddress,
  middlewareV2PortfolioToPortfolio,
  portfolioIdToMeshPortfolioId,
  tickerToString,
} from '~/utils/conversion';
import { asAsset, createProcedureMethod, getIdentity, toHumanReadable } from '~/utils/internal';

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

      if (!locked.isZero()) {
        const tickerBalance = assetBalances[ticker];

        tickerBalance.locked = locked;
        tickerBalance.free = assetBalances[ticker].total.minus(locked);
      }
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
   * @note this will create an {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Request} which has to be accepted by the `targetIdentity`.
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
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
   *
   * @note uses the middlewareV2
   */
  public async getTransactionHistory(
    filters: {
      account?: string;
      ticker?: string;
    } = {}
  ): Promise<HistoricSettlement[]> {
    const {
      context,
      owner: { did: identityId },
      _id: portfolioId,
    } = this;

    const { account, ticker } = filters;

    const address = account ? addressToKey(account, context) : undefined;

    const settlementsPromise = context.queryMiddleware<Ensured<Query, 'legs'>>(
      settlementsQuery({
        identityId,
        portfolioId,
        address,
        ticker,
      })
    );

    const portfolioMovementsPromise = context.queryMiddleware<Ensured<Query, 'portfolioMovements'>>(
      portfolioMovementsQuery({
        identityId,
        portfolioId,
        address,
        ticker,
      })
    );

    const [settlementsResult, portfolioMovementsResult, exists] = await Promise.all([
      settlementsPromise,
      portfolioMovementsPromise,
      this.exists(),
    ]);

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: notExistsMessage,
      });
    }

    const data: HistoricSettlement[] = [];

    const portfolioFilter = `${identityId}/${new BigNumber(portfolioId || 0).toString()}`;

    const getDirection = (fromId: string, toId: string): SettlementDirectionEnum => {
      if (fromId === portfolioFilter) {
        return SettlementDirectionEnum.Outgoing;
      }
      if (toId === portfolioFilter) {
        return SettlementDirectionEnum.Incoming;
      }
      return SettlementDirectionEnum.None;
    };

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    settlementsResult.data.legs.nodes.forEach(({ settlement }) => {
      const {
        createdBlock,
        result: settlementResult,
        legs: { nodes: legs },
      } = settlement!;

      const { blockId, hash } = createdBlock!;

      data.push({
        blockNumber: new BigNumber(blockId),
        blockHash: hash,
        status: settlementResult as unknown as SettlementResultEnum,
        accounts: legs[0].addresses.map(
          (accountAddress: string) =>
            new Account({ address: keyToAddress(accountAddress, context) }, context)
        ),
        legs: legs.map(({ from, to, fromId, toId, assetId, amount }) => ({
          asset: new Asset({ ticker: assetId }, context),
          amount: new BigNumber(amount).shiftedBy(-6),
          direction: getDirection(fromId, toId),
          from: middlewareV2PortfolioToPortfolio(from!, context),
          to: middlewareV2PortfolioToPortfolio(to!, context),
        })),
      });
    });

    portfolioMovementsResult.data.portfolioMovements.nodes.forEach(
      ({ createdBlock, from, to, fromId, toId, assetId, amount, address: accountAddress }) => {
        const { blockId, hash } = createdBlock!;
        data.push({
          blockNumber: new BigNumber(blockId),
          blockHash: hash,
          status: SettlementResultEnum.Executed,
          accounts: [new Account({ address: keyToAddress(accountAddress, context) }, context)],
          legs: [
            {
              asset: new Asset({ ticker: assetId }, context),
              amount: new BigNumber(amount).shiftedBy(-6),
              direction: getDirection(fromId, toId),
              from: middlewareV2PortfolioToPortfolio(from!, context),
              to: middlewareV2PortfolioToPortfolio(to!, context),
            },
          ],
        });
      }
    );
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    return data;
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
