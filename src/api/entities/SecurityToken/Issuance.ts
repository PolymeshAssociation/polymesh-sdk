import { issueTokens } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
import { IssuanceData } from '~/types';

import { SecurityToken } from '.';

/**
 * Handles all Security Token Issuance related functionality
 */
export class Issuance extends Namespace<SecurityToken> {
  /**
   * Issue a certain amount of tokens to one or multiple identities. The receiving identities must comply with any receiver rules set on the token
   *
   * @param args.issuanceData - array that specifies who to issue tokens to and which amounts
   */
  public issue(args: { issuanceData: IssuanceData[] }): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return issueTokens.prepare({ ticker, ...args }, context);
  }
}
