import { Namespace, SecurityToken } from '~/api/entities';
import { issueTokens } from '~/api/procedures';
import { TransactionQueue } from '~/base';
import { IssuanceAmount } from '~/types';

/**
 * Handles all Security Token Issuance related functionality
 */
export class Issuance extends Namespace<SecurityToken> {
  /**
   * Issue a certain amount of tokens to treasury account
   *
   * @param args.issuanceAmount - amount of tokens to be issued to treasury
   */
  public issue(args: { issuanceAmount: IssuanceAmount }): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return issueTokens.prepare({ ticker, ...args }, context);
  }
}
