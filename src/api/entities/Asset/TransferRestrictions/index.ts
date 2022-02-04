import { Asset, Context, Namespace } from '~/internal';

import { Count } from './Count';
import { Percentage } from './Percentage';

/**
 * Handles all Asset Transfer Restrictions related functionality
 */
export class TransferRestrictions extends Namespace<Asset> {
  public count: Count;
  public percentage: Percentage;

  /**
   * @hidden
   */
  constructor(parent: Asset, context: Context) {
    super(parent, context);

    this.count = new Count(parent, context);
    this.percentage = new Percentage(parent, context);
  }
}
