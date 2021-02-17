import { Context, Namespace, SecurityToken } from '~/internal';

import { Count } from './Count';
import { Percentage } from './Percentage';

/**
 * Handles all Security Token Transfer Restrictions related functionality
 */
export class TransferRestrictions extends Namespace<SecurityToken> {
  public count: Count;
  public percentage: Percentage;

  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    this.count = new Count(parent, context);
    this.percentage = new Percentage(parent, context);
  }
}
