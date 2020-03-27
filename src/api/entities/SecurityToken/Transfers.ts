import { toggleFreezeTransfers } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
import { boolToBoolean } from '~/utils';

import { SecurityToken } from './';

/**
 * Handles all Security Token Transfer related functionality
 */
export class Transfers extends Namespace<SecurityToken> {
  /**
   * Freezes transfers and minting of the Security Token
   */
  public freeze(): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return toggleFreezeTransfers.prepare({ ticker, freeze: true }, context);
  }

  /**
   * Unfreeze transfers and minting of the Security Token
   */
  public unfreeze(): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return toggleFreezeTransfers.prepare({ ticker, freeze: false }, context);
  }

  /**
   * Returns whether the Security Token is frozen or not
   */
  public async areFrozen(): Promise<boolean> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
    } = this;

    const result = await asset.frozen(ticker);

    return boolToBoolean(result);
  }
}
