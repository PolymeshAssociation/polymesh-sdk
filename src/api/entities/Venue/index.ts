import BigNumber from 'bignumber.js';

import { Entity, Identity } from '~/api/entities';
import { Context } from '~/base';
import {
  identityIdToString,
  meshVenueTypeToVenueType,
  numberToU64,
  venueDetailsToString,
} from '~/utils';

import { VenueDetails } from './types';

export interface UniqueIdentifiers {
  id: BigNumber;
}

/**
 * Represents a Venue through which settlements are handled
 */
export class Venue extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber;
  }

  /**
   * Identifier number of the venue
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
   * Retrieve information specific to this venue
   */
  public async details(): Promise<VenueDetails> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      id,
      context,
    } = this;

    const { creator, details, venue_type: type } = await settlement.venueInfo(
      numberToU64(id, context)
    );

    return {
      owner: new Identity({ did: identityIdToString(creator) }, context),
      description: venueDetailsToString(details),
      type: meshVenueTypeToVenueType(type),
    };
  }
}
