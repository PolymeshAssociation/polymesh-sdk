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
import { instructionEventsQuery } from '~/middleware/queries/settlements';
import { InstructionEventEnum, Query } from '~/middleware/types';
import {
  AffirmAsMediatorParams,
  AffirmInstructionParams,
  DefaultPortfolio,
  ErrorCode,
  EventIdentifier,
  ExecuteManualInstructionParams,
  InstructionAffirmationOperation,
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
  balanceToBigNumber,
  bigNumberToU64,
  identityIdToString,
  instructionMemoToString,
  mediatorAffirmationStatusToStatus,
  meshAffirmationStatusToAffirmationStatus,
  meshAssetToAssetId,
  meshInstructionStatusToInstructionStatus,
  meshNftToNftId,
  meshPortfolioIdToPortfolio,
  meshSettlementTypeToEndCondition,
  middlewareEventDetailsToEventIdentifier,
  momentToDate,
  tickerToString,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod, optionize, requestMulti, requestPaginated } from '~/utils/internal';

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
      createdAt: momentToDate(createdAt.unwrap()),
      tradeDate: tradeDate.isSome ? momentToDate(tradeDate.unwrap()) : null,
      valueDate: valueDate.isSome ? momentToDate(valueDate.unwrap()) : null,
      venue: venueId.isSome ? new Venue({ id: u64ToBigNumber(venueId.unwrap()) }, context) : null,
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

    const data = [...legs]
      .sort((a, b) => u64ToBigNumber(a[0].args[1]).minus(u64ToBigNumber(b[0].args[1])).toNumber())
      .map(([, leg]) => {
        if (leg.isSome) {
          const legValue: PolymeshPrimitivesSettlementLeg = leg.unwrap();
          if (legValue.isFungible) {
            const {
              sender,
              receiver,
              amount,
              ticker: rawTicker,
              assetId: rawAssetId,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } = legValue.asFungible as any; // NOSONAR

            const assetId = meshAssetToAssetId(rawTicker || rawAssetId, context);
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
            const { assetId, ids } = meshNftToNftId(nfts, context);

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

    const [executedEventIdentifier, failedEventIdentifier] = await Promise.all([
      this.getInstructionEventFromMiddleware(InstructionEventEnum.InstructionExecuted),
      this.getInstructionEventFromMiddleware(InstructionEventEnum.InstructionFailed),
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
    event: InstructionEventEnum.InstructionExecuted | InstructionEventEnum.InstructionFailed
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
