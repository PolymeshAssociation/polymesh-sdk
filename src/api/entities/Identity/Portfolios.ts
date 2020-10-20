import { Identity, Namespace, NumberedPortfolio } from '~/api/entities';
import { createPortfolio } from '~/api/procedures';
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
}
