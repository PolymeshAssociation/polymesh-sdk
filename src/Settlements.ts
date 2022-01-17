import BigNumber from 'bignumber.js';

import { addInstruction, AddInstructionParamsWithVenueId } from '~/api/procedures/addInstruction';
import {
  addInstructionTransformer,
  Context,
  createVenue,
  CreateVenueParams,
  Instruction,
  modifyInstructionAffirmation,
  PolymeshError,
  Venue,
} from '~/internal';
import { ErrorCode, ProcedureMethod } from '~/types';
import { InstructionAffirmationOperation } from '~/types/internal';
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

    this.addInstruction = createProcedureMethod(
      {
        getProcedureAndArgs: args => {
          const { venueId, ...instruction } = args;
          return [addInstruction, { instructions: [instruction], venueId }];
        },
        transformer: addInstructionTransformer,
      },
      context
    );

    this.affirmInstruction = createProcedureMethod(
      {
        getProcedureAndArgs: args => [
          modifyInstructionAffirmation,
          { id: args, operation: InstructionAffirmationOperation.Affirm },
        ],
      },
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

  /**
   * Create an Instruction to exchange Assets
   */
  public addInstruction: ProcedureMethod<
    AddInstructionParamsWithVenueId,
    Instruction[],
    Instruction
  >;

  /**
   * Affirm an instruction (authorize)
   */
  public affirmInstruction: ProcedureMethod<BigNumber, Instruction>;
}
