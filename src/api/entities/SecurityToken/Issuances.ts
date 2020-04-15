import { setIssuancesData } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
import { IssuanceData } from '~/types';

import { SecurityToken } from '.';

/**
 * Handles all Security Token Issuance related functionality
 */
export class Issuances extends Namespace<SecurityToken> {
  /**
   * Issue a certain amount of tokens to a one or multiple DIDs. The investor must be an acredited client.
   *
   * @param args.issuances - array that specifies who to issue tokens to and which amounts
   */
  public issue(args: { issuances: IssuanceData[] }): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return setIssuancesData.prepare({ ticker, ...args }, context);
  }
}
