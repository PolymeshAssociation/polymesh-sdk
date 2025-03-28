import {
  PolymeshPrimitivesSettlementInstructionStatus,
  PolymeshPrimitivesSettlementLeg,
} from '@polkadot/types/lookup';
import { hexAddPrefix, hexStripPrefix } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import P from 'bluebird';

import { executeManualInstruction } from '~/api/procedures/executeManualInstruction';
import {
  Account,
  Context,
  Entity,
  FungibleAsset,
  Identity,
  modifyInstructionAffirmation,
  Nft,
  NftCollection,
  PolymeshError,
  Venue,
} from '~/internal';
import {
  instructionAffirmationsQuery,
  instructionEventsQuery,
  instructionsQuery,
  legsQuery,
  offChainAffirmationsQuery,
} from '~/middleware/queries/settlements';
import {
  Instruction as MiddlewareInstruction,
  InstructionAffirmation as MiddlewareInstructionAffirmation,
  InstructionEventEnum,
  LegTypeEnum,
  Query,
} from '~/middleware/types';
import {
  AffirmAsMediatorParams,
  AffirmInstructionParams,
  DefaultPortfolio,
  ErrorCode,
  EventIdentifier,
  ExecuteManualInstructionParams,
  InstructionAffirmationOperation,
  MiddlewarePaginationOptions,
  NoArgsProcedureMethod,
  NumberedPortfolio,
  OffChainAffirmationReceipt,
  OptionalArgsProcedureMethod,
  PaginationOptions,
  RejectInstructionParams,
  ResultSet,
  SignerKeyRingType,
  SubCallback,
  UnsubCallback,
  WithdrawInstructionParams,
} from '~/types';
import { InstructionStatus as InternalInstructionStatus } from '~/types/internal';
import { Ensured } from '~/types/utils';
import { isOffChainLeg } from '~/utils';
import {
  assetIdToString,
  balanceToBigNumber,
  bigNumberToU64,
  identityIdToString,
  instructionMemoToString,
  mediatorAffirmationStatusToStatus,
  meshAffirmationStatusToAffirmationStatus,
  meshInstructionStatusToInstructionStatus,
  meshNftToNftId,
  meshPortfolioIdToPortfolio,
  meshSettlementTypeToEndCondition,
  middlewareAffirmStatusToAffirmationStatus,
  middlewareEventDetailsToEventIdentifier,
  middlewareInstructionStatusToInstructionStatus,
  middlewareInstructionToInstructionEndCondition,
  middlewareLegToLeg,
  momentToDate,
  tickerToString,
  u64ToBigNumber,
} from '~/utils/conversion';
import {
  calculateNextKey,
  createProcedureMethod,
  optionize,
  requestMulti,
  requestPaginated,
} from '~/utils/internal';

import {
  AffirmationStatus,
  InstructionAffirmation,
  InstructionDetails,
  InstructionStatus,
  InstructionStatusResult,
  Leg,
  MediatorAffirmation,
  OffChainAffirmation,
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

    this.rejectAsMediator = createProcedureMethod(
      {
        getProcedureAndArgs: () => [
          modifyInstructionAffirmation,
          { id, operation: InstructionAffirmationOperation.RejectAsMediator },
        ],
        voidArgs: true,
      },
      context
    );

    this.affirmAsMediator = createProcedureMethod(
      {
        getProcedureAndArgs: args => [
          modifyInstructionAffirmation,
          { id, operation: InstructionAffirmationOperation.AffirmAsMediator, ...args },
        ],
        optionalArgs: true,
      },
      context
    );

    this.withdrawAsMediator = createProcedureMethod(
      {
        getProcedureAndArgs: () => [
          modifyInstructionAffirmation,
          { id, operation: InstructionAffirmationOperation.WithdrawAsMediator },
        ],
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
      },
      id,
      context,
    } = this;

    const [status, exists] = await Promise.all([
      settlement.instructionStatuses(bigNumberToU64(id, context)),
      this.exists(),
    ]);

    const statusResult = meshInstructionStatusToInstructionStatus(status);

    return (
      (statusResult === InternalInstructionStatus.Unknown ||
        statusResult === InternalInstructionStatus.Success ||
        statusResult === InternalInstructionStatus.Rejected) &&
      exists
    );
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
   * @note can be subscribed to, if connected to node using a web socket
   * @note current status as `Executed` means that the Instruction has been executed/rejected and pruned from
   *   the chain.
   */
  public async onStatusChange(callback: SubCallback<InstructionStatus>): Promise<UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      id,
      context,
    } = this;

    context.assertSupportsSubscription();

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

    return id.gt(new BigNumber(0)) && id.lt(u64ToBigNumber(instructionCounter));
  }

  /**
   * This method verifies whether the instruction exists and returns if middleware is available.
   *
   * @throws if instruction does not exists
   */
  private async getMiddlewareInfoAndCheckIfInstructionExists(): Promise<boolean> {
    const { context } = this;

    const [isMiddlewareAvailable, exists] = await Promise.all([
      context.isMiddlewareAvailable(),
      this.exists(),
    ]);

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Instruction does not exists',
        data: {
          instructionId: this.id,
        },
      });
    }
    return isMiddlewareAvailable;
  }

  /**
   * Fetches the instruction details from middleware
   *
   * @throws if instruction data is not yet processed by the middleware
   */
  private async getInstructionFromMiddleware(): Promise<MiddlewareInstruction> {
    const { context, id } = this;

    const {
      data: {
        instructions: {
          nodes: [instruction],
        },
      },
    } = await context.queryMiddleware<Ensured<Query, 'instructions'>>(
      instructionsQuery(context.isSqIdPadded, {
        id: id.toString(),
      })
    );

    if (!instruction) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Instruction is not yet processed by the middleware',
      });
    }

    return instruction;
  }

  /**
   * Asserts that start value of pagination options based on middleware availability
   */
  private assertPaginationStart(
    isMiddlewareAvailable: boolean,
    paginationOpts?: PaginationOptions | MiddlewarePaginationOptions
  ): void {
    if (!paginationOpts) {
      return;
    }
    if (isMiddlewareAvailable) {
      if (typeof paginationOpts.start === 'string') {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: '`start` should be of type BigNumber to query the data from middleware',
        });
      }
    } else if (typeof paginationOpts.start !== 'string') {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: '`start` should be of type string to query the data from chain',
      });
    }
  }

  /**
   * @hidden
   *
   * Retrieve information specific to this Instruction from chain
   *
   * @throws if instruction is executed/rejected and was pruned from chain
   */
  public async detailsFromChain(): Promise<InstructionDetails> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      id,
      context,
    } = this;

    const rawId = bigNumberToU64(id, context);

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
      createdAt: createdAt.isSome ? momentToDate(createdAt.unwrap()) : null,
      tradeDate: tradeDate.isSome ? momentToDate(tradeDate.unwrap()) : null,
      valueDate: valueDate.isSome ? momentToDate(valueDate.unwrap()) : null,
      venue: venueId.isSome ? new Venue({ id: u64ToBigNumber(venueId.unwrap()) }, context) : null,
      memo: memo.isSome ? instructionMemoToString(memo.unwrap()) : null,
      ...meshSettlementTypeToEndCondition(type),
    };
  }

  /**
   * Retrieve information specific to this Instruction
   *
   * @note uses middleware (if available) to retrieve information, otherwise directly queries from the chain
   *
   * @throws if
   *  - instruction does not exists
   *  - instruction is not yet processed by the middleware (when querying from middleware)
   *  - instruction is executed/rejected and was pruned from chain (when querying from chain)
   */
  public async details(): Promise<InstructionDetails> {
    const { context } = this;

    const isMiddlewareAvailable = await this.getMiddlewareInfoAndCheckIfInstructionExists();

    if (isMiddlewareAvailable) {
      const instruction = await this.getInstructionFromMiddleware();

      const endCondition = middlewareInstructionToInstructionEndCondition(instruction);

      const { status, tradeDate, valueDate, venueId, memo, createdBlock } = instruction;

      return {
        status: middlewareInstructionStatusToInstructionStatus(status),
        createdAt: new Date(createdBlock!.datetime),
        tradeDate: tradeDate ? new Date(tradeDate) : null,
        valueDate: valueDate ? new Date(valueDate) : null,
        venue: venueId ? new Venue({ id: new BigNumber(venueId) }, context) : null,
        memo: memo ?? null,
        ...endCondition,
      };
    }

    return this.detailsFromChain();
  }

  /**
   * Retrieve every authorization generated by this Instruction (status and authorizing Identity)
   *
   * @note supports pagination.
   * @note uses middleware (if available) to retrieve information, otherwise directly queries from the chain
   *
   * @throws if
   *  - instruction does not exists
   *  - instruction is executed/rejected and was pruned from chain (when querying from chain)
   */
  public async getAffirmations(
    paginationOpts?: PaginationOptions | MiddlewarePaginationOptions
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

    const isMiddlewareAvailable = await this.getMiddlewareInfoAndCheckIfInstructionExists();

    this.assertPaginationStart(isMiddlewareAvailable, paginationOpts);

    if (isMiddlewareAvailable) {
      const start = paginationOpts?.start as BigNumber;
      const {
        data: {
          instructionAffirmations: { nodes: affirmations, totalCount },
        },
      } = await context.queryMiddleware<Ensured<Query, 'instructionAffirmations'>>(
        instructionAffirmationsQuery(
          context.isSqIdPadded,
          {
            instructionId: id.toString(),
          },
          paginationOpts?.size,
          start
        )
      );

      const count = new BigNumber(totalCount);

      const data = affirmations.map(affirmation => {
        const { identity, status } = affirmation!;
        return {
          identity: new Identity({ did: identity }, context),
          status: middlewareAffirmStatusToAffirmationStatus(status),
        };
      });

      const next = calculateNextKey(count, data.length, start);
      return {
        data,
        count,
        next,
      };
    }

    const isExecuted = await this.isExecuted();

    if (isExecuted) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: executedMessage,
      });
    }

    const { entries, lastKey: next } = await requestPaginated(settlement.affirmsReceived, {
      arg: bigNumberToU64(id, context),
      paginationOpts: paginationOpts as PaginationOptions,
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
   * @hidden
   *
   * Retrieve all legs of this Instruction from chain
   *
   * @note supports pagination
   *
   * @throws if the instruction is executed/rejected and was pruned from chain
   */
  public async getLegsFromChain(paginationOpts?: PaginationOptions): Promise<ResultSet<Leg>> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      context,
      id,
    } = this;

    const instruction = new Instruction({ id }, context);
    const isExecuted = await instruction.isExecuted();

    if (isExecuted) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Instruction has already been executed/rejected and it was purged from chain',
      });
    }

    const { entries: legs, lastKey: next } = await requestPaginated(settlement.instructionLegs, {
      arg: bigNumberToU64(id, context),
      paginationOpts: paginationOpts as PaginationOptions,
    });

    const data = [...legs]
      .sort((a, b) => u64ToBigNumber(a[0].args[1]).minus(u64ToBigNumber(b[0].args[1])).toNumber())
      .map(([, leg]) => {
        if (leg.isSome) {
          const legValue: PolymeshPrimitivesSettlementLeg = leg.unwrap();
          if (legValue.isFungible) {
            const { sender, receiver, amount, assetId: rawAssetId } = legValue.asFungible;

            const assetId = assetIdToString(rawAssetId);
            const fromPortfolio = meshPortfolioIdToPortfolio(sender, context);
            const toPortfolio = meshPortfolioIdToPortfolio(receiver, context);

            return {
              from: fromPortfolio,
              to: toPortfolio,
              amount: balanceToBigNumber(amount),
              asset: new FungibleAsset({ assetId }, context),
            };
          } else if (legValue.isNonFungible) {
            const { sender, receiver, nfts } = legValue.asNonFungible;

            const from = meshPortfolioIdToPortfolio(sender, context);
            const to = meshPortfolioIdToPortfolio(receiver, context);
            const { assetId, ids } = meshNftToNftId(nfts);

            return {
              from,
              to,
              nfts: ids.map(nftId => new Nft({ assetId, id: nftId }, context)),
              asset: new NftCollection({ assetId }, context),
            };
          } else {
            const {
              senderIdentity,
              receiverIdentity,
              amount,
              ticker: rawTicker,
            } = legValue.asOffChain;

            const ticker = tickerToString(rawTicker);
            const from = identityIdToString(senderIdentity);
            const to = identityIdToString(receiverIdentity);

            return {
              from: new Identity({ did: from }, context),
              to: new Identity({ did: to }, context),
              offChainAmount: balanceToBigNumber(amount),
              asset: ticker,
            };
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
   * Retrieve all legs of this Instruction
   *
   * @note supports pagination
   * @note uses middleware (if available) to retrieve information, otherwise directly queries from the chain
   *
   * @throws if
   *  - instruction does not exists
   *  - instruction is not yet processed by the middleware (when querying from middleware)
   *  - instruction is executed/rejected and was pruned from chain (when querying from chain)
   */
  public async getLegs(
    paginationOpts?: PaginationOptions | MiddlewarePaginationOptions
  ): Promise<ResultSet<Leg>> {
    const { id, context } = this;

    const isMiddlewareAvailable = await this.getMiddlewareInfoAndCheckIfInstructionExists();

    this.assertPaginationStart(isMiddlewareAvailable, paginationOpts);
    if (isMiddlewareAvailable) {
      const start = paginationOpts?.start as BigNumber;

      const {
        data: {
          legs: { nodes, totalCount },
        },
      } = await context.queryMiddleware<Ensured<Query, 'legs'>>(
        legsQuery(
          {
            instructionId: id.toString(),
          },
          paginationOpts?.size,
          start
        )
      );

      const data = nodes.map(leg => middlewareLegToLeg(leg, context));

      const count = new BigNumber(totalCount);

      const next = calculateNextKey(count, data.length, start);
      return {
        data,
        count,
        next,
      };
    }

    return this.getLegsFromChain(paginationOpts as PaginationOptions);
  }

  /**
   * Retrieve current status of this Instruction
   *
   * @note uses the middlewareV2
   */
  public async getStatus(): Promise<InstructionStatusResult> {
    const isPending = await this.isPending();

    if (isPending) {
      return {
        status: InstructionStatus.Pending,
      };
    }

    const [
      executedEventIdentifier,
      failedEventIdentifier,
      failedToExecuteIdentifier,
      rejectedEventIdentifier,
    ] = await Promise.all([
      this.getInstructionEventFromMiddleware(InstructionEventEnum.InstructionExecuted),
      this.getInstructionEventFromMiddleware(InstructionEventEnum.InstructionFailed),
      this.getInstructionEventFromMiddleware(InstructionEventEnum.FailedToExecuteInstruction), // this is the new event triggered for failed to execute instruction
      this.getInstructionEventFromMiddleware(InstructionEventEnum.InstructionRejected),
    ]);

    if (executedEventIdentifier) {
      return {
        status: InstructionStatus.Success,
        eventIdentifier: executedEventIdentifier,
      };
    }

    if (failedEventIdentifier) {
      return {
        status: InstructionStatus.Failed,
        eventIdentifier: failedEventIdentifier,
      };
    }

    if (failedToExecuteIdentifier) {
      return {
        status: InstructionStatus.Failed,
        eventIdentifier: failedToExecuteIdentifier,
      };
    }

    if (rejectedEventIdentifier) {
      return {
        status: InstructionStatus.Rejected,
        eventIdentifier: rejectedEventIdentifier,
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
  public affirm: OptionalArgsProcedureMethod<AffirmInstructionParams, Instruction>;

  /**
   * Withdraw affirmation from this instruction (unauthorize)
   */
  public withdraw: OptionalArgsProcedureMethod<WithdrawInstructionParams, Instruction>;

  /**
   * Reject this instruction as a mediator
   *
   * @note reject on `SettleOnAffirmation` will execute the settlement and it will fail immediately.
   * @note reject on `SettleOnBlock` behaves just like unauthorize
   * @note reject on `SettleManual` behaves just like unauthorize
   */
  public rejectAsMediator: NoArgsProcedureMethod<Instruction>;

  /**
   * Affirm this instruction as a mediator (authorize)
   */
  public affirmAsMediator: OptionalArgsProcedureMethod<AffirmAsMediatorParams, Instruction>;

  /**
   * Withdraw affirmation from this instruction as a mediator (unauthorize)
   */
  public withdrawAsMediator: NoArgsProcedureMethod<Instruction>;

  /**
   * Executes an Instruction either of type `SettleManual` or a `Failed` instruction
   */
  public executeManually: OptionalArgsProcedureMethod<ExecuteManualInstructionParams, Instruction>;

  /**
   * @hidden
   * Retrieve Instruction status event from middleware V2
   */
  private async getInstructionEventFromMiddleware(
    event:
      | InstructionEventEnum.InstructionExecuted
      | InstructionEventEnum.InstructionFailed
      | InstructionEventEnum.InstructionRejected
      | InstructionEventEnum.FailedToExecuteInstruction
  ): Promise<EventIdentifier | null> {
    const { id, context } = this;

    const {
      data: {
        instructionEvents: {
          nodes: [details],
        },
      },
    } = await context.queryMiddleware<Ensured<Query, 'instructionEvents'>>(
      instructionEventsQuery(
        context.isSqIdPadded,
        {
          event,
          instructionId: id.toString(),
        },
        new BigNumber(1),
        new BigNumber(0)
      )
    );

    return optionize(middlewareEventDetailsToEventIdentifier)(
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
      leg: Leg
    ): Promise<(DefaultPortfolio | NumberedPortfolio)[]> => {
      if (!isOffChainLeg(leg)) {
        const { from, to } = leg;
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
      }

      return involvedPortfolios;
    };

    const portfolios = await P.reduce<Leg, (DefaultPortfolio | NumberedPortfolio)[]>(
      legs,
      async (result, leg) => assemblePortfolios(result, leg),
      []
    );

    return portfolios;
  }

  /**
   * Returns the mediators for the Instruction, along with their affirmation status
   *
   * @note uses middleware (if available) to retrieve information, otherwise directly queries from the chain
   *
   * @throws if
   *  - instruction does not exists
   *  - instruction is not yet processed by the middleware (when querying from middleware)
   *  - instruction is executed/rejected and was pruned from chain (when querying from chain)
   */
  public async getMediators(): Promise<MediatorAffirmation[]> {
    const {
      id,
      context,
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
    } = this;

    const isMiddlewareAvailable = await this.getMiddlewareInfoAndCheckIfInstructionExists();

    if (isMiddlewareAvailable) {
      const [
        { mediators },
        {
          data: {
            instructionAffirmations: { nodes: mediatorAffirmations },
          },
        },
      ] = await Promise.all([
        this.getInstructionFromMiddleware(),
        context.queryMiddleware<Ensured<Query, 'instructionAffirmations'>>(
          instructionAffirmationsQuery(context.isSqIdPadded, {
            instructionId: id.toString(),
            isMediator: true,
          })
        ),
      ]);

      const getMediatorAffirmationStatus = (
        mediatorAffirmation?: MiddlewareInstructionAffirmation
      ): Omit<MediatorAffirmation, 'identity'> => {
        if (mediatorAffirmation) {
          const status = middlewareAffirmStatusToAffirmationStatus(mediatorAffirmation.status);
          return {
            status,
            expiry: mediatorAffirmation.expiry ? new Date(mediatorAffirmation.expiry) : undefined,
          };
        }
        return { status: AffirmationStatus.Pending };
      };

      return (mediators as string[]).map(mediator => {
        const affirmation = mediatorAffirmations.find(
          mediatorAffirmation => mediatorAffirmation.identity === mediator
        );
        return {
          identity: new Identity({ did: mediator }, context),
          ...getMediatorAffirmationStatus(affirmation),
        } as MediatorAffirmation;
      });
    }

    const rawId = bigNumberToU64(id, context);

    const rawAffirms = await settlement.instructionMediatorsAffirmations.entries(rawId);

    return rawAffirms.map(([key, affirmStatus]) => {
      const rawDid = key.args[1];
      const did = identityIdToString(rawDid);
      const identity = new Identity({ did }, context);

      const { status, expiry } = mediatorAffirmationStatusToStatus(affirmStatus);

      return { identity, status, expiry };
    });
  }

  /**
   * Returns affirmation statuses for offchain legs in this Instruction
   *
   * @note uses middleware (if available) to retrieve information, otherwise directly queries from the chain
   *
   * @throws if
   *  - instruction does not exists
   *  - instruction is not yet processed by the middleware (when querying from middleware)
   *  - instruction is executed/rejected and was pruned from chain (when querying from chain)
   */
  public async getOffChainAffirmations(): Promise<OffChainAffirmation[]> {
    const {
      id,
      context,
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
    } = this;

    const isMiddlewareAvailable = await this.getMiddlewareInfoAndCheckIfInstructionExists();

    if (isMiddlewareAvailable) {
      const {
        data: {
          instructionAffirmations: { nodes: offChainAffirmations },
        },
      } = await context.queryMiddleware<Ensured<Query, 'instructionAffirmations'>>(
        offChainAffirmationsQuery(context.isSqIdPadded, {
          instructionId: id.toString(),
        })
      );

      return offChainAffirmations.map(offChainAffirmation => {
        const { status, offChainReceipt } = offChainAffirmation;
        return {
          status: middlewareAffirmStatusToAffirmationStatus(status),
          legId: new BigNumber(offChainReceipt!.leg!.legIndex),
        };
      });
    }

    const rawId = bigNumberToU64(id, context);

    const rawAffirms = await settlement.offChainAffirmations.entries(rawId);

    return rawAffirms.map(
      ([
        {
          args: [, rawLegId],
        },
        affirmStatus,
      ]) => {
        const legId = u64ToBigNumber(rawLegId);
        const status = meshAffirmationStatusToAffirmationStatus(affirmStatus);

        return { legId, status };
      }
    );
  }

  /**
   * Returns affirmation status for a specific offchain leg in this Instruction
   *
   * @param args.legId index of the leg whose affirmation status is to be fetched
   *
   * @note uses middleware (if available) to retrieve information, otherwise directly queries from the chain
   *
   * @throws if
   *  - instruction does not exists
   *  - legId provided is not an off-chain leg
   *  - instruction is not yet processed by the middleware (when querying from middleware)
   *  - instruction is executed/rejected and was pruned from chain (when querying from chain)
   */
  public async getOffChainAffirmationForLeg(args: {
    legId: BigNumber;
  }): Promise<AffirmationStatus> {
    const {
      id,
      context,
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
    } = this;

    const { legId } = args;

    const isMiddlewareAvailable = await this.getMiddlewareInfoAndCheckIfInstructionExists();

    if (isMiddlewareAvailable) {
      const {
        data: {
          legs: {
            nodes: [leg],
          },
        },
      } = await context.queryMiddleware<Ensured<Query, 'legs'>>(
        legsQuery({
          instructionId: id.toString(),
          legIndex: legId.toNumber(),
          legType: LegTypeEnum.OffChain,
        })
      );

      if (!leg) {
        throw new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: 'The given leg ID is not an off-chain leg',
        });
      }

      return leg.offChainReceipts.nodes.length
        ? AffirmationStatus.Affirmed
        : AffirmationStatus.Pending;
    }

    const rawId = bigNumberToU64(id, context);

    const rawLegId = bigNumberToU64(legId, context);

    const rawAffirmStatus = await settlement.offChainAffirmations(rawId, rawLegId);

    return meshAffirmationStatusToAffirmationStatus(rawAffirmStatus);
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
      case InternalInstructionStatus.Success:
        return InstructionStatus.Success;
      case InternalInstructionStatus.Rejected:
        return InstructionStatus.Rejected;
    }

    return null;
  }

  /**
   * Generate an offchain affirmation receipt for a specific leg and UID
   *
   * @param args.legId index of the offchain leg in this instruction
   * @param args.uid UID of the receipt
   * @param args.metadata (optional) metadata to be associated with the receipt
   * @param args.signer (optional) Signer to be used to generate receipt signature. Defaults to signing Account associated with the SDK
   * @param args.signerKeyRingType (optional) keyring type of the signer. Defaults to 'Sr25519'
   */
  public async generateOffChainAffirmationReceipt(args: {
    legId: BigNumber;
    uid: BigNumber;
    metadata?: string;
    signer?: string | Account;
    signerKeyRingType?: SignerKeyRingType;
  }): Promise<OffChainAffirmationReceipt> {
    const {
      id,
      context,
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
    } = this;

    const { legId, uid, metadata, signer, signerKeyRingType = SignerKeyRingType.Sr25519 } = args;

    const rawId = bigNumberToU64(id, context);
    const rawLegId = bigNumberToU64(legId, context);

    const rawOptionalLeg = await settlement.instructionLegs(rawId, rawLegId);

    if (rawOptionalLeg.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Leg does not exist',
      });
    }

    const rawLeg = rawOptionalLeg.unwrap();

    if (!rawLeg.isOffChain) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Receipt payload can only be generated for offchain legs',
      });
    }

    const { senderIdentity, receiverIdentity, ticker, amount } = rawLeg.asOffChain;

    const rawUid = bigNumberToU64(uid, context);

    const payloadStrings = [
      rawUid.toHex(true),
      rawId.toHex(true),
      rawLegId.toHex(true),
      senderIdentity.toHex(),
      receiverIdentity.toHex(),
      ticker.toHex(),
      amount.toHex(true),
    ];

    const rawPayload = hexAddPrefix(payloadStrings.map(e => hexStripPrefix(e)).join(''));

    const signatureValue = await context.getSignature({ rawPayload, signer });

    return {
      uid,
      legId,
      signer: signer || context.getSigningAccount(),
      signature: {
        type: signerKeyRingType,
        value: signatureValue,
      },
      metadata,
    };
  }
}
