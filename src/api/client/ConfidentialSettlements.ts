import BigNumber from 'bignumber.js';

import { ConfidentialTransaction, ConfidentialVenue, Context, PolymeshError } from '~/internal';
import { ErrorCode } from '~/types';

/**
 * Handles all functionalities for venues and transactions of confidential Assets
 */
export class ConfidentialSettlements {
  private context: Context;

  /**
   * @hidden
   */
  constructor(context: Context) {
    this.context = context;
  }

  /**
   * Retrieve a confidential Venue by its ID
   *
   * @param args.id - identifier number of the confidential Venue
   */
  public async getVenue(args: { id: BigNumber }): Promise<ConfidentialVenue> {
    const { context } = this;

    const venue = new ConfidentialVenue(args, context);

    const venueExists = await venue.exists();
    if (!venueExists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The confidential Venue does not exists',
      });
    }

    return venue;
  }

  /**
   * Retrieve a settlement Transaction by its ID
   *
   * @param args.id - identifier number of the ConfidentialTransaction
   */
  public async getTransaction(args: { id: BigNumber }): Promise<ConfidentialTransaction> {
    const { context } = this;

    const transaction = new ConfidentialTransaction(args, context);

    const exists = await transaction.exists();
    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Transaction does not exists',
      });
    }

    return transaction;
  }
}
