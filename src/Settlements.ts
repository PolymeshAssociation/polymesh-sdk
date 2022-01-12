import BigNumber from 'bignumber.js';

import {
  Context,
  createVenue,
  CreateVenueParams,
  Instruction,
  PolymeshError,
  Venue,
} from '~/internal';
import { ErrorCode, ProcedureMethod } from '~/types';
import { createProcedureMethod } from '~/utils/internal';

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

    this.createVenue = createProcedureMethod(
      { getProcedureAndArgs: args => [createVenue, args] },
      context
    );
  }

  /**
   * Retrieve a Venue by its ID
   *
   * @param id - identifier number of the Venue
   */
  public async getVenue(args: { id: BigNumber }): Promise<Venue> {
    const { context } = this;

    const venue = new Venue(args, context);

    const venueExists = await venue.exists();
    if (!venueExists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: "The Venue doesn't exist",
      });
    }

    return venue;
  }

  /**
   * Retrieve an Instruction by its ID
   *
   * @param id - identifier number of the Instruction
   */
  public async getInstruction(args: { id: BigNumber }): Promise<Instruction> {
    const { context } = this;

    const instruction = new Instruction(args, context);

    const instructionExists = await instruction.exists();
    if (!instructionExists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: "The Instruction doesn't exist",
      });
    }

    return instruction;
  }

  /**
   * Create a Venue under the ownership of the Current Identity
   */
  public createVenue: ProcedureMethod<CreateVenueParams, Venue>;
}
