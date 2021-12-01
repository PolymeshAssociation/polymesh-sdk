import BigNumber from 'bignumber.js';

import {
  Context,
  Entity,
  Identity,
  modifyInstructionAffirmation,
  PolymeshError,
  rescheduleInstruction,
  SecurityToken,
  Venue,
} from '~/internal';
import { eventByIndexedArgs } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum, Query } from '~/middleware/types';
import {
  ErrorCode,
  EventIdentifier,
  NoArgsProcedureMethod,
  PaginationOptions,
  ResultSet,
} from '~/types';
import {
  InstructionAffirmationOperation,
  InstructionStatus as InternalInstructionStatus,
} from '~/types/internal';
import { Ensured } from '~/types/utils';
import {
  balanceToBigNumber,
  identityIdToString,
  meshAffirmationStatusToAffirmationStatus,
  meshInstructionStatusToInstructionStatus,
  meshPortfolioIdToPortfolio,
  middlewareEventToEventIdentifier,
  momentToDate,
  numberToU64,
  tickerToString,
  u32ToBigNumber,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod, optionize, requestPaginated } from '~/utils/internal';

import {
  InstructionAffirmation,
  InstructionDetails,
  InstructionStatus,
  InstructionStatusResult,
  InstructionType,
  Leg,
} from './types';

export interface UniqueIdentifiers {
  id: BigNumber;
}

const executedMessage =
  'Instruction has already been executed/rejected and it was purged from chain';

/**
 * Represents a settlement Instruction to be executed on a certain Venue
 */
export class Instruction extends Entity<UniqueIdentifiers, string> {
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

    this.reject = createProcedureMethod(
      {
        getProcedureAndArgs: () => [
          modifyInstructionAffirmation,
          { id, operation: InstructionAffirmationOperation.Reject },
        ],
        voidArgs: true,
      },
      context
    );

    this.affirm = createProcedureMethod(
      {
        getProcedureAndArgs: () => [
          modifyInstructionAffirmation,
          { id, operation: InstructionAffirmationOperation.Affirm },
        ],
        voidArgs: true,
      },
      context
    );

    this.withdraw = createProcedureMethod(
      {
        getProcedureAndArgs: () => [
          modifyInstructionAffirmation,
          { id, operation: InstructionAffirmationOperation.Withdraw },
        ],
        voidArgs: true,
      },
      context
    );

    this.reschedule = createProcedureMethod(
      {
        getProcedureAndArgs: () => [rescheduleInstruction, { id }],
        voidArgs: true,
      },
      context
    );
  }

  /**
   * Retrieve whether the Instruction has already been executed and pruned from
   *   the chain.
   */
  public async isExecuted(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      id,
      context,
    } = this;

    const [{ status }, exists] = await Promise.all([
      settlement.instructionDetails(numberToU64(id, context)),
      this.exists(),
    ]);

    const statusResult = meshInstructionStatusToInstructionStatus(status);

    return statusResult === InternalInstructionStatus.Unknown && exists;
  }

  /**
   * Retrieve whether the Instruction is still pending on chain
   */
  public async isPending(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      id,
      context,
    } = this;

    const { status } = await settlement.instructionDetails(numberToU64(id, context));

    const statusResult = meshInstructionStatusToInstructionStatus(status);

    return statusResult === InternalInstructionStatus.Pending;
  }

  /**
   * Determine whether this Instruction exists on chain (or existed and was pruned)
   */
  public async exists(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      id,
    } = this;

    const instructionCounter = await settlement.instructionCounter();

    return id.lte(u64ToBigNumber(instructionCounter));
  }

  /**
   * Retrieve information specific to this Instruction
   */
  public async details(): Promise<InstructionDetails> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      id,
      context,
    } = this;

    const {
      status: rawStatus,
      created_at: createdAt,
      trade_date: tradeDate,
      value_date: valueDate,
      settlement_type: type,
      venue_id: venueId,
    } = await settlement.instructionDetails(numberToU64(id, context));

    const status = meshInstructionStatusToInstructionStatus(rawStatus);

    if (status === InternalInstructionStatus.Unknown) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: executedMessage,
      });
    }

    const details = {
      status:
        status === InternalInstructionStatus.Pending
          ? InstructionStatus.Pending
          : InstructionStatus.Failed,
      createdAt: momentToDate(createdAt.unwrap()),
      tradeDate: tradeDate.isSome ? momentToDate(tradeDate.unwrap()) : null,
      valueDate: valueDate.isSome ? momentToDate(valueDate.unwrap()) : null,
      venue: new Venue({ id: u64ToBigNumber(venueId) }, context),
    };

    if (type.isSettleOnAffirmation) {
      return {
        ...details,
        type: InstructionType.SettleOnAffirmation,
      };
    }

    return {
      ...details,
      type: InstructionType.SettleOnBlock,
      endBlock: u32ToBigNumber(type.asSettleOnBlock),
    };
  }

  /**
   * Retrieve every authorization generated by this Instruction (status and authorizing Identity)
   *
   * @note supports pagination
   */
  public async getAffirmations(
    paginationOpts?: PaginationOptions
  ): Promise<ResultSet<InstructionAffirmation>> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      id,
      context,
    } = this;

    const isExecuted = await this.isExecuted();

    if (isExecuted) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: executedMessage,
      });
    }

    const { entries, lastKey: next } = await requestPaginated(settlement.affirmsReceived, {
      arg: numberToU64(id, context),
      paginationOpts,
    });

    const data = entries.map(([{ args }, meshAffirmationStatus]) => {
      const [, { did }] = args;
      return {
        identity: new Identity({ did: identityIdToString(did) }, context),
        status: meshAffirmationStatusToAffirmationStatus(meshAffirmationStatus),
      };
    });

    return {
      data,
      next,
    };
  }

  /**
   * Retrieve all legs of this Instruction
   *
   * @note supports pagination
   */
  public async getLegs(paginationOpts?: PaginationOptions): Promise<ResultSet<Leg>> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      id,
      context,
    } = this;

    const isExecuted = await this.isExecuted();

    if (isExecuted) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: executedMessage,
      });
    }

    const { entries: legs, lastKey: next } = await requestPaginated(settlement.instructionLegs, {
      arg: numberToU64(id, context),
      paginationOpts,
    });

    const data = legs.map(([, leg]) => {
      const { from, to, amount, asset } = leg;

      const ticker = tickerToString(asset);
      const fromPortfolio = meshPortfolioIdToPortfolio(from, context);
      const toPortfolio = meshPortfolioIdToPortfolio(to, context);

      return {
        from: fromPortfolio,
        to: toPortfolio,
        amount: balanceToBigNumber(amount),
        token: new SecurityToken({ ticker }, context),
      };
    });

    return {
      data,
      next,
    };
  }

  /**
   * Retrieve current status of this Instruction
   *
   * @note uses the middleware
   */
  public async getStatus(): Promise<InstructionStatusResult> {
    const isPending = await this.isPending();

    if (isPending) {
      return {
        status: InstructionStatus.Pending,
      };
    }

    let eventIdentifier = await this.getInstructionEventFromMiddleware(
      EventIdEnum.InstructionExecuted
    );
    if (eventIdentifier) {
      return {
        status: InstructionStatus.Executed,
        eventIdentifier,
      };
    }

    eventIdentifier = await this.getInstructionEventFromMiddleware(EventIdEnum.InstructionFailed);
    if (eventIdentifier) {
      return {
        status: InstructionStatus.Failed,
        eventIdentifier,
      };
    }

    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: "It isn't possible to determine the current status of this Instruction",
    });
  }

  /**
   * Reject this instruction
   *
   * @note reject on `SettleOnAffirmation` will execute the settlement and it will fail immediately.
   * @note reject on `SettleOnBlock` behaves just like unauthorize
   */

  public reject: NoArgsProcedureMethod<Instruction>;

  /**
   * Affirm this instruction (authorize)
   */

  public affirm: NoArgsProcedureMethod<Instruction>;

  /**
   * Withdraw affirmation from this instruction (unauthorize)
   */
  public withdraw: NoArgsProcedureMethod<Instruction>;

  /**
   * Schedule a failed Instructi oto rwaa
   */
  public reschedule: NoArgsProcedureMethod<Instruction>;

  /**
   * @hidden
   * Retrieve Instruction status event from middleware
   */
  private async getInstructionEventFromMiddleware(
    eventId: EventIdEnum
  ): Promise<EventIdentifier | null> {
    const { id, context } = this;

    const {
      data: { eventByIndexedArgs: event },
    } = await context.queryMiddleware<Ensured<Query, 'eventByIndexedArgs'>>(
      eventByIndexedArgs({
        moduleId: ModuleIdEnum.Settlement,
        eventId: eventId,
        eventArg1: id.toString(),
      })
    );

    return optionize(middlewareEventToEventIdentifier)(event);
  }

  /**
   * Return the Instruction's ID
   */
  public toJson(): string {
    return this.id.toString();
  }
}
