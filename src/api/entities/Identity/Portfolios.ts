import BigNumber from 'bignumber.js';

import { Identity, Namespace, NumberedPortfolio } from '~/api/entities';
import { createPortfolio, deletePortfolio } from '~/api/procedures';
import { TransactionQueue } from '~/base';

/**
 * Handles all Portfolio related functionality on the Identity side
 */
export class Portfolios extends Namespace<Identity> {
  /**
   * Create a new Portfolio for the Current Identity
   */
  public createPortfolio(args: { name: string }): Promise<TransactionQueue<NumberedPortfolio>> {
    return createPortfolio.prepare(args, this.context);
  }

  /**
   * Delete a Portfolio by ID
   */
  public deletePortfolio(args: { portfolioId: BigNumber }): Promise<TransactionQueue<void>> {
    const {
      parent: { did },
    } = this;
    return deletePortfolio.prepare({ id: args.portfolioId, did }, this.context);
  }
}
