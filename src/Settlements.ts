import BigNumber from 'bignumber.js';

import { Venue } from '~/api/entities/Venue';
import { Context, PolymeshError } from '~/internal';
import { ErrorCode } from '~/types';

/**
 * Handles all Settlement related functionality
 */
export class Settlements {
  private context: Context;

  /**
   * @hidden
   */
  constructor(context: Context) {
    this.context = context;
  }

  /**
   * Retrieve a Venue by its id
   *
   * @param id - Identifier number of the venue
   */
  public async getVenue(id: BigNumber): Promise<Venue> {
    const { context } = this;

    const venueId = new BigNumber(id);
    const venue = new Venue({ id: venueId }, context);

    const venueExists = await venue.exists();
    if (!venueExists) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: "The Venue doesn't exist",
      });
    }

    return venue;
  }
}
