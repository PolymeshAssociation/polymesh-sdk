import BigNumber from 'bignumber.js';

import { Portfolio } from '~/api/entities';
import { deletePortfolio, renamePortfolio, RenamePortfolioParams } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';

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
   * Delete portfolio
   */
  public async delete(): Promise<TransactionQueue<void>> {
    const {
      id,
      owner: { did },
    } = this;
    return deletePortfolio.prepare({ did, id }, this.context);
  }

  /**
   * Rename portfolio
   */
  public async modifyName(
    args: RenamePortfolioParams
  ): Promise<TransactionQueue<NumberedPortfolio>> {
    const {
      id,
      owner: { did },
    } = this;
    const { name } = args;
    return renamePortfolio.prepare({ did, id, name }, this.context);
  }
}
