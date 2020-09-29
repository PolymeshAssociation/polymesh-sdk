import BigNumber from 'bignumber.js';

import { Namespace, SecurityToken } from '~/api/entities';
import { issueTokens } from '~/api/procedures';
import { TransactionQueue } from '~/base';

/**
 * Handles all Security Token Issuance related functionality
 */
export class Issuance extends Namespace<SecurityToken> {
  /**
   * Issue a certain amount of tokens to the primary issuance agent
   *
   * @param args.amount - amount of tokens to be issued to primary issuance agent
   */
  public issue(args: { amount: BigNumber }): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return issueTokens.prepare({ ticker, ...args }, context);
  }
}
