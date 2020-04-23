import { setTokenRules, SetTokenRulesParams } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';

import { SecurityToken } from '../';

/**
 * Handles all Security Token Rules related functionality
 */
export class Rules extends Namespace<SecurityToken> {
  /**
   * Configure transfer rules for the Security Token. This operation will replace all existing rules with a new rule set
   *
   * This requires two transactions
   *
   * @param args.rules - array of array of conditions. For a transfer to be successful, it must comply with all the conditions of at least one of the arrays. In other words, higher level arrays are *OR* between them,
   * while conditions inside each array are *AND* between them
   *
   * @example Say A, B, C, D and E are rules and we arrange them as `[[A, B], [C, D], [E]]`.
   * For a transfer to succeed, it must either comply with A AND B, C AND D, OR E.
   */
  public set(args: SetTokenRulesParams): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return setTokenRules.prepare({ ticker, ...args }, context);
  }
}
