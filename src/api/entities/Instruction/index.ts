import {
  PolymeshPrimitivesSettlementInstructionStatus,
  PolymeshPrimitivesSettlementLeg,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import P from 'bluebird';

import { executeManualInstruction } from '~/api/procedures/executeManualInstruction';
import {
  Asset,
  Context,
  Entity,
  Identity,
  modifyInstructionAffirmation,
  PolymeshError,
  rescheduleInstruction,
  Venue,
} from '~/internal';
import { InstructionStatusEnum } from '~/middleware/enumsV2';
import { eventByIndexedArgs } from '~/middleware/queries';
import { instructionsQuery } from '~/middleware/queriesV2';
import { EventIdEnum, ModuleIdEnum, Query } from '~/middleware/types';
import { Query as QueryV2 } from '~/middleware/typesV2';
import {
  AffirmOrWithdrawInstructionParams,
  DefaultPortfolio,
  ErrorCode,
  EventIdentifier,
  ExecuteManualInstructionParams,
  InstructionAffirmationOperation,
  NoArgsProcedureMethod,
  NumberedPortfolio,
  OptionalArgsProcedureMethod,
  PaginationOptions,
  RejectInstructionParams,
  ResultSet,
  SubCallback,
  UnsubCallback,
} from '~/types';
import { InstructionStatus as InternalInstructionStatus } from '~/types/internal';
import { Ensured, EnsuredV2 } from '~/types/utils';
import {
  balanceToBigNumber,
  bigNumberToU64,
  identityIdToString,
  instructionMemoToString,
  meshAffirmationStatusToAffirmationStatus,
  meshInstructionStatusToInstructionStatus,
  meshPortfolioIdToPortfolio,
  meshSettlementTypeToEndCondition,
  middlewareEventToEventIdentifier,
  middlewareV2EventDetailsToEventIdentifier,
  momentToDate,
  tickerToString,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod, optionize, requestMulti, requestPaginated } from '~/utils/internal';

import {
  InstructionAffirmation,
  InstructionDetails,
  InstructionStatus,
  InstructionStatusResult,
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
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber;
  }

  /**
   * Unique identifier number of the instruction
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
        getProcedureAndArgs: args => [
          modifyInstructionAffirmation,
          { id, operation: InstructionAffirmationOperation.Reject, ...args },
        ],
        optionalArgs: true,
      },
      context
    );

    this.affirm = createProcedureMethod(
      {
        getProcedureAndArgs: args => [
          modifyInstructionAffirmation,
          { id, operation: InstructionAffirmationOperation.Affirm, ...args },
        ],
        optionalArgs: true,
      },
      context
    );

    this.withdraw = createProcedureMethod(
      {
        getProcedureAndArgs: args => [
          modifyInstructionAffirmation,
          { id, operation: InstructionAffirmationOperation.Withdraw, ...args },
        ],
        optionalArgs: true,
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

    this.executeManually = createProcedureMethod(
      {
        getProcedureAndArgs: args => [executeManualInstruction, { id, ...args }],
        optionalArgs: true,
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
        isV5,
      },
      id,
      context,
    } = this;

    if (isV5) {
      const [{ status }, exists] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        settlement.instructionDetails(bigNumberToU64(id, context)) as any,
        this.exists(),
      ]);

      const statusResult = meshInstructionStatusToInstructionStatus(status);

      return statusResult === InternalInstructionStatus.Unknown && exists;
    } else {
      const [status, exists] = await Promise.all([
        settlement.instructionStatuses(bigNumberToU64(id, context)),
        this.exists(),
      ]);

      const statusResult = meshInstructionStatusToInstructionStatus(status);

      return (
        (statusResult === InternalInstructionStatus.Unknown ||
          statusResult === InternalInstructionStatus.Executed) &&
        exists
      );
    }
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

    const status = await settlement.instructionStatuses(bigNumberToU64(id, context));

    const statusResult = meshInstructionStatusToInstructionStatus(status);

    return statusResult === InternalInstructionStatus.Pending;
  }

  /**
   * Retrieve current status of the Instruction. This can be subscribed to know if instruction fails
   *
   * @note can be subscribed to
   * @note current status as `Executed` means that the Instruction has been executed/rejected and pruned from
   *   the chain.
   */
  public async onStatusChange(callback: SubCallback<InstructionStatus>): Promise<UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
        isV5,
      },
      id,
      context,
    } = this;

    if (isV5) {
      const assembleResult = (
        rawStatus: PolymeshPrimitivesSettlementInstructionStatus
      ): InstructionStatus => {
        const status = meshInstructionStatusToInstructionStatus(rawStatus);

        if (status === InternalInstructionStatus.Pending) {
          return InstructionStatus.Pending;
        } else if (status === InternalInstructionStatus.Failed) {
          return InstructionStatus.Failed;
        } else {
          // TODO this can be `Success` or `Rejected` after v6 is rolled out
          return InstructionStatus.Executed;
        }
      };

      return settlement.instructionDetails(bigNumberToU64(id, context), details => {
        // v6 moves status to dedicate storage. `any` is needed here
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return callback(assembleResult((details as any).status));
      });
    } else {
      const assembleResult = (
        rawStatus: PolymeshPrimitivesSettlementInstructionStatus
      ): InstructionStatus => {
        const internalStatus = meshInstructionStatusToInstructionStatus(rawStatus);
        const status = this.internalToExternalStatus(internalStatus);

        if (!status) {
          throw new Error('Unknown instruction status');
        }

        return status;
      };

      return settlement.instructionStatuses(bigNumberToU64(id, context), status => {
        return callback(assembleResult(status));
      });
    }
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
        isV5,
      },
      id,
      context,
    } = this;

    const rawId = bigNumberToU64(id, context);

    if (isV5) {
      const [details, memo] = await requestMulti<
        [typeof settlement.instructionDetails, typeof settlement.instructionMemos]
      >(context, [
        [settlement.instructionDetails, rawId],
        [settlement.instructionMemos, rawId],
      ]);

      const {
        status: rawStatus,
        createdAt,
        tradeDate,
        valueDate,
        settlementType: type,
        venueId,
        // status is moved to dedicated storage in v6. `any` is needed here
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } = details as any;

      const status = meshInstructionStatusToInstructionStatus(rawStatus);

      if (status === InternalInstructionStatus.Unknown) {
        throw new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: executedMessage,
        });
      }

      return {
        status:
          status === InternalInstructionStatus.Pending
            ? InstructionStatus.Pending
            : InstructionStatus.Failed,
        createdAt: momentToDate(createdAt.unwrap()),
        tradeDate: tradeDate.isSome ? momentToDate(tradeDate.unwrap()) : null,
        valueDate: valueDate.isSome ? momentToDate(valueDate.unwrap()) : null,
        venue: new Venue({ id: u64ToBigNumber(venueId) }, context),
        memo: memo.isSome ? instructionMemoToString(memo.unwrap()) : null,
        ...meshSettlementTypeToEndCondition(type),
      };
    }
    const [{ createdAt, tradeDate, valueDate, settlementType: type, venueId }, rawStatus, memo] =
      await requestMulti<
        [
          typeof settlement.instructionDetails,
          typeof settlement.instructionStatuses,
          typeof settlement.instructionMemos
        ]
      >(context, [
        [settlement.instructionDetails, rawId],
        [settlement.instructionStatuses, rawId],
        [settlement.instructionMemos, rawId],
      ]);

    const internalStatus = meshInstructionStatusToInstructionStatus(rawStatus);

    const status = this.internalToExternalStatus(internalStatus);
    if (!status) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: executedMessage,
      });
    }

    return {
      status,
      createdAt: momentToDate(createdAt.unwrap()),
      tradeDate: tradeDate.isSome ? momentToDate(tradeDate.unwrap()) : null,
      valueDate: valueDate.isSome ? momentToDate(valueDate.unwrap()) : null,
      venue: new Venue({ id: u64ToBigNumber(venueId) }, context),
      memo: memo.isSome ? instructionMemoToString(memo.unwrap()) : null,
      ...meshSettlementTypeToEndCondition(type),
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
      arg: bigNumberToU64(id, context),
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
        isV5,
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
      arg: bigNumberToU64(id, context),
      paginationOpts,
    });

    const data = legs.map(([, leg]) => {
      if (isV5) {
        // v6 changes Leg API. `any` is needed here
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { from, to, amount, asset } = leg as any;

        const ticker = tickerToString(asset);
        const fromPortfolio = meshPortfolioIdToPortfolio(from, context);
        const toPortfolio = meshPortfolioIdToPortfolio(to, context);

        return {
          from: fromPortfolio,
          to: toPortfolio,
          amount: balanceToBigNumber(amount),
          asset: new Asset({ ticker }, context),
        };
      } else if (leg.isSome) {
        const legValue: PolymeshPrimitivesSettlementLeg = leg.unwrap();
        if (legValue.isFungible) {
          const { sender, receiver, amount, ticker: rawTicker } = legValue.asFungible;

          const ticker = tickerToString(rawTicker);
          const fromPortfolio = meshPortfolioIdToPortfolio(sender, context);
          const toPortfolio = meshPortfolioIdToPortfolio(receiver, context);

          return {
            from: fromPortfolio,
            to: toPortfolio,
            amount: balanceToBigNumber(amount),
            asset: new Asset({ ticker }, context),
          };
        } else if (legValue.isNonFungible) {
          throw new Error('TODO ERROR: NFT legs are not supported yet');
        } else {
          // assume it is offchain
          throw new Error('TODO ERROR: Offchain legs are not supported yet');
        }
      } else {
        throw new Error(
          'Instruction has already been executed/rejected and it was purged from chain'
        );
      }
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

    if (this.context.isMiddlewareV2Enabled()) {
      return this.getStatusV2();
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
   * Retrieve current status of this Instruction
   *
   * @note uses the middlewareV2
   */
  public async getStatusV2(): Promise<InstructionStatusResult> {
    const isPending = await this.isPending();

    if (isPending) {
      return {
        status: InstructionStatus.Pending,
      };
    }

    const [executedEventIdentifier, failedEventIdentifier] = await Promise.all([
      this.getInstructionEventFromMiddlewareV2(InstructionStatusEnum.Executed),
      this.getInstructionEventFromMiddlewareV2(InstructionStatusEnum.Failed),
    ]);

    if (executedEventIdentifier) {
      return {
        status: InstructionStatus.Executed,
        eventIdentifier: executedEventIdentifier,
      };
    }

    if (failedEventIdentifier) {
      return {
        status: InstructionStatus.Failed,
        eventIdentifier: failedEventIdentifier,
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
   * @note reject on `SettleManual` behaves just like unauthorize
   */

  public reject: OptionalArgsProcedureMethod<RejectInstructionParams, Instruction>;

  /**
   * Affirm this instruction (authorize)
   */
  public affirm: OptionalArgsProcedureMethod<AffirmOrWithdrawInstructionParams, Instruction>;

  /**
   * Withdraw affirmation from this instruction (unauthorize)
   */
  public withdraw: OptionalArgsProcedureMethod<AffirmOrWithdrawInstructionParams, Instruction>;

  /**
   * Reschedules a failed Instruction to be tried again
   *
   * @throws if the Instruction status is not `InstructionStatus.Failed`
   *
   * @deprecated - chain v6 will allow executeManually to work instead
   */
  public reschedule: NoArgsProcedureMethod<Instruction>;

  /**
   * Executes an Instruction either of type `SettleManual` or a `Failed` instruction
   */
  public executeManually: OptionalArgsProcedureMethod<ExecuteManualInstructionParams, Instruction>;

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
   * @hidden
   * Retrieve Instruction status event from middleware V2
   */
  private async getInstructionEventFromMiddlewareV2(
    status: InstructionStatusEnum
  ): Promise<EventIdentifier | null> {
    const { id, context } = this;

    const {
      data: {
        instructions: {
          nodes: [details],
        },
      },
    } = await context.queryMiddlewareV2<EnsuredV2<QueryV2, 'instructions'>>(
      instructionsQuery(
        {
          status,
          id: id.toString(),
        },
        new BigNumber(1),
        new BigNumber(0)
      )
    );

    return optionize(middlewareV2EventDetailsToEventIdentifier)(
      details?.updatedBlock,
      details?.eventIdx
    );
  }

  /**
   * Return the Instruction's ID
   */
  public toHuman(): string {
    return this.id.toString();
  }

  /**
   * Retrieve all the involved portfolios in this Instruction where the given identity is a custodian of
   */
  public async getInvolvedPortfolios(args: {
    did: string;
  }): Promise<(DefaultPortfolio | NumberedPortfolio)[]> {
    const { did } = args;

    const { data: legs } = await this.getLegs();

    const assemblePortfolios = async (
      involvedPortfolios: (DefaultPortfolio | NumberedPortfolio)[],
      from: DefaultPortfolio | NumberedPortfolio,
      to: DefaultPortfolio | NumberedPortfolio
    ): Promise<(DefaultPortfolio | NumberedPortfolio)[]> => {
      const [fromExists, toExists] = await Promise.all([from.exists(), to.exists()]);

      const checkCustody = async (
        legPortfolio: DefaultPortfolio | NumberedPortfolio,
        exists: boolean
      ): Promise<void> => {
        if (exists) {
          const isCustodied = await legPortfolio.isCustodiedBy({ identity: did });
          if (isCustodied) {
            involvedPortfolios.push(legPortfolio);
          }
        } else if (legPortfolio.owner.did === did) {
          involvedPortfolios.push(legPortfolio);
        }
      };

      await Promise.all([checkCustody(from, fromExists), checkCustody(to, toExists)]);

      return involvedPortfolios;
    };

    const portfolios = await P.reduce<Leg, (DefaultPortfolio | NumberedPortfolio)[]>(
      legs,
      async (result, { from, to }) => assemblePortfolios(result, from, to),
      []
    );

    return portfolios;
  }

  /**
   * @hidden
   */
  private internalToExternalStatus(status: InternalInstructionStatus): InstructionStatus | null {
    switch (status) {
      case InternalInstructionStatus.Pending:
        return InstructionStatus.Pending;
      case InternalInstructionStatus.Failed:
        return InstructionStatus.Failed;
      case InternalInstructionStatus.Executed:
        return InstructionStatus.Executed;
    }

    return null;
  }
}
