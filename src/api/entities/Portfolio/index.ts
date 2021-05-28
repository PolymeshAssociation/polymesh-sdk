import BigNumber from 'bignumber.js';
import { values } from 'lodash';

import {
  Account,
  Context,
  Entity,
  Identity,
  moveFunds,
  MoveFundsParams,
  SecurityToken,
  setCustodian,
  SetCustodianParams,
} from '~/internal';
import { settlements } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import { Ensured, ProcedureMethod, ResultSet } from '~/types';
import {
  addressToKey,
  balanceToBigNumber,
  identityIdToString,
  keyToAddress,
  middlewarePortfolioToPortfolio,
  portfolioIdToMeshPortfolioId,
  tickerToString,
} from '~/utils/conversion';
import { calculateNextKey, createProcedureMethod, getDid } from '~/utils/internal';

import { HistoricSettlement, PortfolioBalance } from './types';

export interface UniqueIdentifiers {
  did: string;
  id?: BigNumber;
}

/**
 * Represents a base Portfolio for a specific Identity in the Polymesh blockchain
 */
export class Portfolio extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { did, id } = identifier as UniqueIdentifiers;

    return typeof did === 'string' && (id === undefined || id instanceof BigNumber);
  }

  /**
   * identity of the Portfolio's owner
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
  }

  /**
   * Return whether an Identity is the Portfolio owner
   *
   * @param args.identity - defaults to the current Identity
   */
  public async isOwnedBy(args?: { identity: string | Identity }): Promise<boolean> {
    const {
      owner: { did: ownerDid },
      context,
    } = this;

    const did = await getDid(args?.identity, context);

    return ownerDid === did;
  }

  /**
   * Return whether an Identity is the Portfolio custodian
   *
   * @param args.identity - optional, defaults to the current Identity
   */
  public async isCustodiedBy(args?: { identity: string | Identity }): Promise<boolean> {
    const { context } = this;

    const [portfolioCustodian, targetDid] = await Promise.all([
      this.getCustodian(),
      getDid(args?.identity, context),
    ]);

    return portfolioCustodian.did === targetDid;
  }

  /**
   * Retrieve the balances of all assets in this Portfolio
   *
   * @param args.tokens - array of Security Tokens (or tickers) for which to fetch balances (optional, all balances are retrieved if not passed)
   */
  public async getTokenBalances(args?: {
    tokens: (string | SecurityToken)[];
  }): Promise<PortfolioBalance[]> {
    const {
      owner: { did },
      _id: number,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
      context,
    } = this;

    const rawPortfolioId = portfolioIdToMeshPortfolioId({ did, number }, context);
    const [totalBalanceEntries, lockedBalanceEntries] = await Promise.all([
      portfolio.portfolioAssetBalances.entries(rawPortfolioId),
      portfolio.portfolioLockedAssets.entries(rawPortfolioId),
    ]);

    const assetBalances: Record<string, PortfolioBalance> = {};

    totalBalanceEntries.forEach(([key, balance]) => {
      const ticker = tickerToString(key.args[1]);
      const total = balanceToBigNumber(balance);

      assetBalances[ticker] = {
        token: new SecurityToken({ ticker }, context),
        total,
        locked: new BigNumber(0),
        free: total,
      };
    });

    lockedBalanceEntries.forEach(([key, balance]) => {
      const ticker = tickerToString(key.args[1]);
      const locked = balanceToBigNumber(balance);

      assetBalances[ticker].locked = locked;
      assetBalances[ticker].free = assetBalances[ticker].total.minus(locked);
    });

    const mask: PortfolioBalance[] | undefined = args?.tokens.map(ticker => {
      const token = typeof ticker === 'string' ? new SecurityToken({ ticker }, context) : ticker;

      return {
        total: new BigNumber(0),
        locked: new BigNumber(0),
        free: new BigNumber(0),
        token,
      };
    });

    if (mask) {
      return mask.map(portfolioBalance => {
        const {
          token: { ticker },
        } = portfolioBalance;

        return assetBalances[ticker] ?? portfolioBalance;
      });
    }

    return values(assetBalances);
  }

  /**
   * Send an invitation to an Identity to assign it as custodian for this Portfolio
   *
   * @note this may create an AuthorizationRequest which has to be accepted by
   *   the corresponding Identity. An Account or Identity can
   *   fetch its pending Authorization Requests by calling `authorizations.getReceived`
   *
   * @note required role:
   *   - Portfolio Custodian
   */

  public setCustodian: ProcedureMethod<SetCustodianParams, void>;

  /**
   * Moves funds from this Portfolio to another one owned by the same Identity
   *
   * @param args.to - portfolio (or portfolio ID) that will receive the funds. Optional, if no value is passed, the funds will be moved to the default Portfolio of this Portfolio's owner
   * @param args.movements - list of tokens (and their corresponding amounts) that will be moved
   *
   * @note required role:
   *   - Portfolio Custodian
   */

  public moveFunds: ProcedureMethod<MoveFundsParams, void>;

  /**
   * Retrieve the custodian Identity of this Portfolio
   *
   * @note if no custodian is set, the owner Identity is returned
   */
  public async getCustodian(): Promise<Identity> {
    const {
      owner,
      owner: { did },
      _id: number,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
      context,
    } = this;

    const rawPortfolioId = portfolioIdToMeshPortfolioId({ did, number }, context);
    const portfolioCustodian = await portfolio.portfolioCustodian(rawPortfolioId);

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
   * @param filters.account - account involved in the settlement
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
      size?: number;
      start?: number;
    } = {}
  ): Promise<ResultSet<HistoricSettlement>> {
    const {
      context,
      owner: { did },
      _id: number,
    } = this;

    const { account, ticker, size, start } = filters;

    const result = await context.queryMiddleware<Ensured<Query, 'settlements'>>(
      settlements({
        identityId: did,
        portfolioNumber: number ? number.toString() : null,
        addressFilter: account ? addressToKey(account, context) : undefined,
        tickerFilter: ticker,
        count: size,
        skip: start,
      })
    );

    const {
      data: { settlements: settlementsResult },
    } = result;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { items, totalCount: count } = settlementsResult!;

    const data: HistoricSettlement[] = [];
    let next = null;

    if (items) {
      items.forEach(item => {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        const { block_id: blockId, result: status, addresses, legs: settlementLegs } = item!;

        data.push({
          blockNumber: new BigNumber(blockId),
          status,
          accounts: addresses!.map(
            address => new Account({ address: keyToAddress('0x' + address, context) }, context)
          ),
          legs: settlementLegs.map(leg => {
            return {
              token: new SecurityToken({ ticker: leg!.ticker }, context),
              amount: new BigNumber(leg!.amount).shiftedBy(-6),
              direction: leg!.direction,
              from: middlewarePortfolioToPortfolio(leg!.from, context),
              to: middlewarePortfolioToPortfolio(leg!.to, context),
            };
          }),
        });
        /* eslint-enabled @typescript-eslint/no-non-null-assertion */
      });

      next = calculateNextKey(count, size, start);
    }

    return {
      data,
      next,
      count,
    };
  }
}
