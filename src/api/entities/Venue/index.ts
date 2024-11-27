import BigNumber from 'bignumber.js';
import P from 'bluebird';

import {
  Account,
  addInstruction,
  Context,
  Entity,
  Identity,
  Instruction,
  modifyVenue,
  updateVenueSigners,
} from '~/internal';
import { instructionsQuery } from '~/middleware/queries/settlements';
import { Query } from '~/middleware/types';
import {
  AddInstructionParams,
  AddInstructionsParams,
  GroupedInstructions,
  InstructionStatus,
  ModifyVenueParams,
  NumberedPortfolio,
  ProcedureMethod,
  ResultSet,
  UpdateVenueSignersParams,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  accountIdToString,
  bigNumberToU64,
  bytesToString,
  identityIdToString,
  meshVenueTypeToVenueType,
  middlewareInstructionToHistoricInstruction,
  u64ToBigNumber,
} from '~/utils/conversion';
import { calculateNextKey, createProcedureMethod } from '~/utils/internal';

import { HistoricInstruction, VenueDetails } from './types';

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
 * @hidden
 */
export function createPortfolioTransformer([portfolio]: NumberedPortfolio[]): NumberedPortfolio {
  return portfolio;
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

    this.addSigners = createProcedureMethod(
      {
        getProcedureAndArgs: args => [
          updateVenueSigners,
          { ...args, addSigners: true, venue: this },
        ],
      },
      context
    );

    this.removeSigners = createProcedureMethod(
      {
        getProcedureAndArgs: args => [
          updateVenueSigners,
          { ...args, addSigners: false, venue: this },
        ],
      },
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

    const { creator, venueType: type } = venueInfo.unwrapOrDefault();

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

    const details = await P.map(instructions, instruction => instruction.detailsFromChain());

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
   * Retrieve all Instructions that have been associated with this Venue instance
   *
   * @param opts.size - page size
   * @param opts.start - page offset
   *
   * @note uses the middleware V2
   * @note supports pagination
   */
  public async getHistoricalInstructions(
    opts: {
      size?: BigNumber;
      start?: BigNumber;
    } = {}
  ): Promise<ResultSet<HistoricInstruction>> {
    const { context, id } = this;

    const { size, start } = opts;

    const {
      data: {
        instructions: { nodes: instructionsResult, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'instructions'>>(
      instructionsQuery(
        {
          venueId: id.toString(),
        },
        size,
        start
      )
    );

    const data = instructionsResult.map(middlewareInstruction =>
      middlewareInstructionToHistoricInstruction(middlewareInstruction, context)
    );

    const count = new BigNumber(totalCount);

    const next = calculateNextKey(count, data.length, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Get all signers allowed by this Venue.
   * Only these signers are allowed to affirm off-chain instructions
   */
  public async getAllowedSigners(): Promise<Account[]> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      id,
      context,
    } = this;

    const signerEntries = await settlement.venueSigners.entries(bigNumberToU64(id, context));

    return signerEntries.map(
      ([
        {
          args: [, rawAccountId],
        },
      ]) => new Account({ address: accountIdToString(rawAccountId) }, context)
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
   * Adds a list of signers allowed to sign receipts for this Venue
   *
   * @note required role:
   *   - Venue Owner
   *
   * @throws if one or more specified signers are already added to the Venue
   */
  public addSigners: ProcedureMethod<UpdateVenueSignersParams, void>;

  /**
   * Adds a list of signers allowed to sign receipts for this Venue
   *
   * @note required role:
   *   - Venue Owner
   *
   * @throws if one or more specified signers are already added to the Venue
   */
  public removeSigners: ProcedureMethod<UpdateVenueSignersParams, void>;

  /**
   * Return the Venue's ID
   */
  public toHuman(): string {
    return this.id.toString();
  }
}
