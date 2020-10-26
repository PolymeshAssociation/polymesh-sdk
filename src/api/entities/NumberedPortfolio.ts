import BigNumber from 'bignumber.js';

import { Portfolio } from '~/api/entities';
import { deletePortfolio } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import { bytesToString, numberToU64 } from '~/utils';

export interface UniqueIdentifiers {
  did: string;
  id: BigNumber;
}

/**
 * Represents a numbered (non-default) Portfolio for an Identity
 */
export class NumberedPortfolio extends Portfolio {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { did, id } = identifier as UniqueIdentifiers;

    return typeof did === 'string' && id instanceof BigNumber;
  }

  /**
   * portfolio identifier number
   */
  public id: BigNumber;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id } = identifiers;

    this.id = id;
  }

  /**
   * Delete this Portfolio
   */
  public async delete(): Promise<TransactionQueue<void>> {
    const {
      id,
      owner: { did },
    } = this;
    return deletePortfolio.prepare({ did, id }, this.context);
  }

  /**
   * Return the Portfolio name
   */
  public async getName(): Promise<string> {
    const {
      owner: { did },
      id,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
      context,
    } = this;

    const rawPortfolioName = await portfolio.portfolios(did, numberToU64(id, context));
    return bytesToString(rawPortfolioName);
  }
}
