import BigNumber from 'bignumber.js';

import { addInstruction } from '~/api/procedures/addInstruction';
import {
  addInstructionTransformer,
  Context,
  createVenue,
  Instruction,
  modifyInstructionAffirmation,
  PolymeshError,
  Venue,
} from '~/internal';
import { instructionPartiesQuery } from '~/middleware/queries/settlements';
import { Query } from '~/middleware/types';
import {
  AddInstructionWithVenueIdParams,
  CreateVenueParams,
  ErrorCode,
  HistoricInstruction,
  InstructionAffirmationOperation,
  InstructionIdParams,
  InstructionPartiesFilters,
  ProcedureMethod,
} from '~/types';
import { Ensured } from '~/types/utils';
import { middlewareInstructionToHistoricInstruction } from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Settlement related functionality
 */
export class Settlements {
  private readonly context: Context;

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
          { id: args.id, operation: InstructionAffirmationOperation.Affirm },
        ],
      },
      context
    );
  }

  /**
   * Retrieve a Venue by its ID
   *
   * @param args.id - identifier number of the Venue
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
   * @param args.id - identifier number of the Instruction
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
   * Create a Venue under the ownership of the signing Identity
   */
  public createVenue: ProcedureMethod<CreateVenueParams, Venue>;

  /**
   * Create an Instruction to exchange Assets
   */
  public addInstruction: ProcedureMethod<
    AddInstructionWithVenueIdParams,
    Instruction[],
    Instruction
  >;

  /**
   * Affirm an Instruction (authorize)
   */
  public affirmInstruction: ProcedureMethod<InstructionIdParams, Instruction>;

  /**
   * Retrieve all Instructions that have been associated with this Identity's DID
   *
   * @note uses the middleware V2
   * @note supports pagination
   *
   */
  public async getHistoricalInstructions(
    filter: InstructionPartiesFilters
  ): Promise<HistoricInstruction[]> {
    const { context } = this;

    const query = await instructionPartiesQuery(filter, context);

    const {
      data: {
        instructionParties: { nodes: instructionsResult },
      },
    } = await context.queryMiddleware<Ensured<Query, 'instructionParties'>>(query);

    return instructionsResult.map(({ instruction }) =>
      middlewareInstructionToHistoricInstruction(instruction!, context)
    );
  }
}
