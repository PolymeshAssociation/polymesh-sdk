import { Context, PolymeshError } from '@polymeshassociation/polymesh-sdk/internal';
import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import BigNumber from 'bignumber.js';

import { ConfidentialTransaction, ConfidentialVenue, createConfidentialVenue } from '~/internal';
import { ConfidentialNoArgsProcedureMethod } from '~/types';
import { createConfidentialProcedureMethod } from '~/utils/internal';

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

    this.createVenue = createConfidentialProcedureMethod(
      { getProcedureAndArgs: () => [createConfidentialVenue, undefined], voidArgs: true },
      context
    );
  }

  /**
   * Create a Confidential Venue under the ownership of the signing Identity
   */
  public createVenue: ConfidentialNoArgsProcedureMethod<ConfidentialVenue>;

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
