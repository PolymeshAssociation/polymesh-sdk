import BigNumber from 'bignumber.js';
import P from 'bluebird';

import {
  addInstruction,
  AddInstructionParams,
  AddInstructionsParams,
  Context,
  Entity,
  Identity,
  Instruction,
  modifyVenue,
  ModifyVenueParams,
  PolymeshError,
} from '~/internal';
import { ErrorCode, InstructionStatus, ProcedureMethod } from '~/types';
import {
  identityIdToString,
  meshVenueTypeToVenueType,
  numberToU64,
  u64ToBigNumber,
  venueDetailsToString,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

import { VenueDetails } from './types';

export interface UniqueIdentifiers {
  id: BigNumber;
}

/**
 * @hidden
 */
export function addInstructionTransformer([instruction]: Instruction[]): Instruction {
  return instruction;
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

    this.addInstruction = createProcedureMethod(
      {
        getProcedureAndArgs: args => [addInstruction, { instructions: [args], venueId: id }],
        transformer: addInstructionTransformer,
      },
      context
    );

    this.addInstructions = createProcedureMethod(
      { getProcedureAndArgs: args => [addInstruction, { ...args, venueId: id }] },
      context
    );

    this.modify = createProcedureMethod(
      { getProcedureAndArgs: args => [modifyVenue, { ...args, venueId: id }] },
      context
    );
  }

  /**
   * Retrieve whether the Venue exists
   */
  public async exists(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      id,
      context,
    } = this;

    const venueInfo = await settlement.venueInfo(numberToU64(id, context));

    return !venueInfo.isEmpty;
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

    const exists = await this.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: "The Venue doesn't exist",
      });
    }

    const venueInfo = await settlement.venueInfo(numberToU64(id, context));

    const { creator, details, venue_type: type } = venueInfo.unwrap();

    return {
      owner: new Identity({ did: identityIdToString(creator) }, context),
      description: venueDetailsToString(details),
      type: meshVenueTypeToVenueType(type),
    };
  }

  /**
   * Retrieve all pending Instructions in this Venue
   */
  public async getPendingInstructions(): Promise<Instruction[]> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      id,
      context,
    } = this;

    const exists = await this.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: "The Venue doesn't exist",
      });
    }

    const venueInfo = await settlement.venueInfo(numberToU64(id, context));

    const { instructions: rawInstructions } = venueInfo.unwrap();

    const instructions = rawInstructions.map(
      instructionId => new Instruction({ id: u64ToBigNumber(instructionId) }, context)
    );

    return P.filter(instructions, async instruction => {
      const instructionExists = await instruction.exists();

      if (!instructionExists) {
        return false;
      }

      const { status } = await instruction.details();

      return status === InstructionStatus.Pending;
    });
  }

  /**
   * Creates a settlement Instruction in this Venue
   *
   * @note required role:
   *   - Venue Owner
   */
  public addInstruction: ProcedureMethod<AddInstructionParams, Instruction[], Instruction>;

  /**
   * Creates a batch of settlement Instructions in this Venue
   *
   * @note required role:
   *   - Venue Owner
   */
  public addInstructions: ProcedureMethod<AddInstructionsParams, Instruction[]>;

  /**
   * Modify description and type
   *
   * @note required role:
   *   - Venue Owner
   */
  public modify: ProcedureMethod<ModifyVenueParams, void>;
}
