import BigNumber from 'bignumber.js';

import { Context, Entity } from '~/internal';
import { u64ToBigNumber } from '~/utils/conversion';

export interface UniqueIdentifiers {
  id: BigNumber;
}

/**
 * Represents a confidential Asset Transaction to be executed on a certain Venue
 */
export class ConfidentialTransaction extends Entity<UniqueIdentifiers, string> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber;
  }

  /**
   * Unique identifier number of the settlement transaction
   */
  public id: BigNumber;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id } = identifiers;

    this.id = id;
  }

  /**
   * Determine whether this settlement Transaction exists on chain (or existed and was pruned)
   */
  public async exists(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
      id,
    } = this;

    if (id.lte(new BigNumber(0))) {
      return false;
    }

    const transactionCounter = await confidentialAsset.transactionCounter();

    return id.lte(u64ToBigNumber(transactionCounter.unwrap()));
  }

  /**
   * Return the settlement Transaction's ID
   */
  public toHuman(): string {
    return this.id.toString();
  }
}
