import BigNumber from 'bignumber.js';
import { values } from 'lodash';
import { Ticker } from 'polymesh-types/types';

import { Entity, Identity, SecurityToken } from '~/api/entities';
import { Context } from '~/base';
import { balanceToBigNumber, portfolioIdToMeshPortfolioId, tickerToString } from '~/utils';

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
   * Return whether the current Identity is the Portfolio owner
   */
  public async isOwned(): Promise<boolean> {
    const {
      owner: { did: ownerDid },
      context,
    } = this;

    const { did } = await context.getCurrentIdentity();

    return ownerDid === did;
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
}
