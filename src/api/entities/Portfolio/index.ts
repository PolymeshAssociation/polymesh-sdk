import BigNumber from 'bignumber.js';
import { values } from 'lodash';
import { Ticker } from 'polymesh-types/types';

import { Entity, Identity, SecurityToken } from '~/api/entities';
import { moveFunds, MoveFundsParams } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import {
  balanceToBigNumber,
  getDid,
  identityIdToString,
  portfolioIdToMeshPortfolioId,
  tickerToString,
} from '~/utils';

import { PortfolioBalance } from './types';

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
      _id,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
      context,
    } = this;

    const rawPortfolioId = portfolioIdToMeshPortfolioId({ did, number: _id }, context);
    const [totalBalanceEntries, lockedBalanceEntries] = await Promise.all([
      portfolio.portfolioAssetBalances.entries(rawPortfolioId),
      portfolio.portfolioLockedAssets.entries(rawPortfolioId),
    ]);

    const assetBalances: Record<string, PortfolioBalance> = {};

    totalBalanceEntries.forEach(([key, balance]) => {
      const ticker = tickerToString(key.args[1] as Ticker);
      const total = balanceToBigNumber(balance);

      assetBalances[ticker] = {
        token: new SecurityToken({ ticker }, context),
        total,
        locked: new BigNumber(0),
      };
    });

    lockedBalanceEntries.forEach(([key, balance]) => {
      const ticker = tickerToString(key.args[1] as Ticker);
      const locked = balanceToBigNumber(balance);

      assetBalances[ticker].locked = locked;
    });

    const mask: PortfolioBalance[] | undefined = args?.tokens.map(ticker => {
      const token = typeof ticker === 'string' ? new SecurityToken({ ticker }, context) : ticker;

      return {
        total: new BigNumber(0),
        locked: new BigNumber(0),
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
   * Moves funds from this Portfolio to another one owned by the same Identity
   *
   * @param args.to - portfolio (or portfolio ID) that will receive the funds. Optional, if no value is passed, the funds will be moved to the default Portfolio of this Portfolio's owner
   * @param args.movements - list of tokens (and their corresponding amounts) that will be moved
   */
  public async moveFunds(args: MoveFundsParams): Promise<TransactionQueue<void>> {
    return moveFunds.prepare({ ...args, from: this }, this.context);
  }

  /**
   * Retrieve the custodian Identity of this Portfolio
   *
   * @note if no custodian is set, the owner Identity is returned
   */
  public async getCustodian(): Promise<Identity> {
    const {
      owner,
      owner: { did },
      _id,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
      context,
    } = this;

    const rawPortfolioId = portfolioIdToMeshPortfolioId({ did, number: _id }, context);
    const portfolioCustodian = await portfolio.portfolioCustodian(rawPortfolioId);

    try {
      const rawIdentityId = portfolioCustodian.unwrap();
      return new Identity({ did: identityIdToString(rawIdentityId) }, context);
    } catch (_) {
      return owner;
    }
  }
}
