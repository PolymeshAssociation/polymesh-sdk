import BigNumber from 'bignumber.js';
import P from 'bluebird';

import {
  addInstruction,
  Asset,
  Context,
  Entity,
  Identity,
  Instruction,
  modifyVenue,
} from '~/internal';
import { InstructionStatusEnum } from '~/middleware/enumsV2';
import { instructionsQuery } from '~/middleware/queriesV2';
import { Query as QueryV2 } from '~/middleware/typesV2';
import {
  AddInstructionParams,
  AddInstructionsParams,
  GroupedInstructions,
  InstructionStatus,
  InstructionType,
  ModifyVenueParams,
  NumberedPortfolio,
  ProcedureMethod,
  ResultSet,
} from '~/types';
import { EnsuredV2 } from '~/types/utils';
import {
  bigNumberToU64,
  bytesToString,
  identityIdToString,
  meshVenueTypeToVenueType,
  middlewareV2PortfolioToPortfolio,
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
    } = await context.queryMiddlewareV2<EnsuredV2<QueryV2, 'instructions'>>(
      instructionsQuery(
        {
          venueId: id.toString(),
        },
        size,
        start
      )
    );

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const data = instructionsResult.map(
      ({
        id: instructionId,
        status,
        settlementType,
        endBlock,
        tradeDate,
        valueDate,
        legs: { nodes: legs },
        memo,
        createdBlock,
        venueId,
      }) => {
        const { blockId, hash, datetime } = createdBlock!;

        let typeDetails;

        if (settlementType === InstructionType.SettleOnBlock) {
          typeDetails = {
            type: InstructionType.SettleOnBlock,
            endBlock: new BigNumber(endBlock!),
          };
        } else {
          typeDetails = {
            type: InstructionType.SettleOnAffirmation,
          };
        }

        return {
          id: new BigNumber(instructionId),
          blockNumber: new BigNumber(blockId),
          blockHash: hash,
          status: status as InstructionStatusEnum,
          tradeDate,
          valueDate,
          ...typeDetails,
          memo: memo || null,
          venueId: new BigNumber(venueId),
          createdAt: new Date(datetime),
          legs: legs.map(({ from, to, assetId, amount }) => ({
            asset: new Asset({ ticker: assetId }, context),
            amount: new BigNumber(amount).shiftedBy(-6),
            from: middlewareV2PortfolioToPortfolio(from!, context),
            to: middlewareV2PortfolioToPortfolio(to!, context),
          })),
        };
      }
    );
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    const count = new BigNumber(totalCount);

    const next = calculateNextKey(count, size, start);

    return {
      data,
      next,
      count,
    };
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
