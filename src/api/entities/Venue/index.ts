import BigNumber from 'bignumber.js';
import P from 'bluebird';

import { addInstruction, Context, Entity, Identity, Instruction, modifyVenue } from '~/internal';
import {
  AddInstructionParams,
  AddInstructionsParams,
  GroupedInstructions,
  InstructionStatus,
  ModifyVenueParams,
  ProcedureMethod,
} from '~/types';
import {
  bigNumberToU64,
  bytesToString,
  identityIdToString,
  meshVenueTypeToVenueType,
  u64ToBigNumber,
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
export class Venue extends Entity<UniqueIdentifiers, string> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber;
  }

  /**
   * identifier number of the Venue
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
        getProcedureAndArgs: args => [addInstruction, { instructions: [args], venueId: this.id }],
        transformer: addInstructionTransformer,
      },
      context
    );

    this.addInstructions = createProcedureMethod(
      { getProcedureAndArgs: args => [addInstruction, { ...args, venueId: this.id }] },
      context
    );

    this.modify = createProcedureMethod(
      { getProcedureAndArgs: args => [modifyVenue, { ...args, venue: this }] },
      context
    );
  }

  /**
   * Determine whether this Venue exists on chain
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

    const venueInfo = await settlement.venueInfo(bigNumberToU64(id, context));

    return !venueInfo.isNone;
  }

  /**
   * Retrieve information specific to this Venue
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

    const venueId = bigNumberToU64(id, context);
    const [venueInfo, details] = await Promise.all([
      settlement.venueInfo(venueId),
      settlement.details(venueId),
    ]);

    const { creator, venueType: type } = venueInfo.unwrap();

    return {
      owner: new Identity({ did: identityIdToString(creator) }, context),
      description: bytesToString(details),
      type: meshVenueTypeToVenueType(type),
    };
  }

  /**
   * Retrieve all pending and failed Instructions in this Venue
   */
  public async getInstructions(): Promise<Pick<GroupedInstructions, 'pending' | 'failed'>> {
    const instructions = await this.fetchInstructions();

    const failed: Instruction[] = [];
    const pending: Instruction[] = [];

    const details = await P.map(instructions, instruction => instruction.details());

    details.forEach(({ status }, index) => {
      if (status === InstructionStatus.Pending) {
        pending.push(instructions[index]);
      }

      if (status === InstructionStatus.Failed) {
        failed.push(instructions[index]);
      }
    });

    return {
      failed,
      pending,
    };
  }

  /**
   * Retrieve all pending Instructions in this Venue
   *
   * @deprecated in favor of `getInstructions`
   */
  public async getPendingInstructions(): Promise<Instruction[]> {
    const instructions = await this.fetchInstructions();

    return P.filter(instructions, async instruction => {
      const { status } = await instruction.details();

      return status === InstructionStatus.Pending;
    });
  }

  /**
   * Fetch instructions from the chain
   */
  private async fetchInstructions(): Promise<Instruction[]> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      id,
      context,
    } = this;

    const instructionEntries = await settlement.venueInstructions.entries(
      bigNumberToU64(id, context)
    );

    return instructionEntries.map(
      ([
        {
          args: [, instructionId],
        },
      ]) => new Instruction({ id: u64ToBigNumber(instructionId) }, context)
    );
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

  /**
   * Return the Venue's ID
   */
  public toHuman(): string {
    return this.id.toString();
  }
}
