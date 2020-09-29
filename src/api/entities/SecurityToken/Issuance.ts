import { Namespace, SecurityToken } from '~/api/entities';
import { issueTokens } from '~/api/procedures';
import { TransactionQueue } from '~/base';
import { IssuanceData } from '~/types';

/**
 * Handles all Security Token Issuance related functionality
 */
export class Issuance extends Namespace<SecurityToken> {
  /**
   * Issue a certain amount of tokens to one or multiple Identities. The receiving Identities must comply with any receiver rules set on the token
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
