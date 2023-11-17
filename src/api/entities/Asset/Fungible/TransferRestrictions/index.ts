import { Context, FungibleAsset, Namespace } from '~/internal';

import { ClaimCount } from './ClaimCount';
import { ClaimPercentage } from './ClaimPercentage';
import { Count } from './Count';
import { Percentage } from './Percentage';

/**
 * Handles all Asset Transfer Restrictions related functionality
 */
export class TransferRestrictions extends Namespace<FungibleAsset> {
  public count: Count;
  public percentage: Percentage;
  public claimCount: ClaimCount;
  public claimPercentage: ClaimPercentage;

  /**
   * @hidden
   */
  constructor(parent: FungibleAsset, context: Context) {
    super(parent, context);

    this.count = new Count(parent, context);
    this.percentage = new Percentage(parent, context);
    this.claimCount = new ClaimCount(parent, context);
    this.claimPercentage = new ClaimPercentage(parent, context);
  }
}
