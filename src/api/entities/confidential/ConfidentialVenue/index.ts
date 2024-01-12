import BigNumber from 'bignumber.js';

import { Context, Entity, Identity, PolymeshError } from '~/internal';
import { ErrorCode } from '~/types';
import { bigNumberToU64, identityIdToString, u64ToBigNumber } from '~/utils/conversion';

export interface UniqueIdentifiers {
  id: BigNumber;
}

/**
 * Represents a Venue through which confidential transactions are handled
 */
export class ConfidentialVenue extends Entity<UniqueIdentifiers, string> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber;
  }

  /**
   * identifier number of the confidential Venue
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
   * Determine whether this confidential Venue exists on chain
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

    const rawCounter = await confidentialAsset.venueCounter();

    const nextVenue = u64ToBigNumber(rawCounter);

    return id.lt(nextVenue);
  }

  /**
   * Retrieve the creator of this confidential Venue
   */
  public async creator(): Promise<Identity> {
    const {
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
      id,
      context,
    } = this;

    const rawId = bigNumberToU64(id, context);
    const creator = await confidentialAsset.venueCreator(rawId);

    if (creator.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Venue does not exists',
      });
    }

    return new Identity({ did: identityIdToString(creator.unwrap()) }, context);
  }

  /**
   * Return the confidential Venue's ID
   */
  public toHuman(): string {
    return this.id.toString();
  }
}
