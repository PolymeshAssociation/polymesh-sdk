import BigNumber from 'bignumber.js';

import { Context, Instruction, PolymeshError, Venue } from '~/internal';
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
  public async getVenue(args: { id: BigNumber }): Promise<Venue> {
    const { context } = this;

    const venue = new Venue(args, context);

    const venueExists = await venue.exists();
    if (!venueExists) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: "The Venue doesn't exist",
      });
    }

    return venue;
  }

  /**
   * Retrieve an Instruction by its id
   *
   * @param id - Identifier number of the instruction
   */
  public async getInstruction(id: BigNumber): Promise<Instruction> {
    const { context } = this;

    const instructionId = new BigNumber(id);
    const instruction = new Instruction({ id: instructionId }, context);

    const instructionExists = await instruction.exists();
    if (!instructionExists) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: "The Instruction doesn't exist",
      });
    }

    return instruction;
  }
}
