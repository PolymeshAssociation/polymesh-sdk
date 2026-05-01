/* eslint-disable max-lines-per-function */
import { BTreeSet, Option, u64, Vec } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetAssetHolder,
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesSettlementAffirmationCount,
  PolymeshPrimitivesSettlementAffirmationStatus,
  PolymeshPrimitivesSettlementAssetCount,
  PolymeshPrimitivesSettlementReceiptDetails,
} from '@polkadot/types/lookup';
import {
  AffirmationCount,
  ExecuteInstructionInfo,
  PolymeshMoment,
} from '@polymeshassociation/polymesh-types/polkadot/polymesh';
import BigNumber from 'bignumber.js';

import { assertInstructionValid } from '~/api/procedures/utils';
import { Account, Context, Identity, Instruction, PolymeshError, Procedure } from '~/internal';
import {
  AffirmationStatus,
  AffirmInstructionParams,
  AssetHolder,
  AssetHolderId,
  AssetHolderLike,
  DefaultPortfolio,
  ErrorCode,
  InstructionAffirmationOperation,
  ModifyInstructionAffirmationParams,
  NumberedPortfolio,
  OffChainAffirmationReceipt,
  TxTag,
  TxTags,
} from '~/types';
import {
  ExtrinsicParams,
  PolymeshTx,
  ProcedureAuthorization,
  TransactionSpec,
} from '~/types/internal';
import { tuple } from '~/types/utils';
import { isOffChainLeg } from '~/utils';
import {
  assetCountToRaw,
  assetHolderIdsToBtreeSet,
  assetHolderIdToMeshAssetHolder,
  assetHolderLikeToAssetHolderId,
  bigNumberToU64,
  boolToBoolean,
  dateToMoment,
  mediatorAffirmationStatusToStatus,
  meshAffirmationStatusToAffirmationStatus,
  receiptDetailsToMeshReceiptDetails,
  stringToAccountId,
  stringToIdentityId,
} from '~/utils/conversion';
import { asAccount, optionize } from '~/utils/internal';

/**
 * @hidden
 */
const getAssetCount = (
  context: Context,
  instructionInfo: ExecuteInstructionInfo
): PolymeshPrimitivesSettlementAssetCount => {
  const {
    fungibleTokens: fungible,
    nonFungibleTokens: nonFungible,
    offChainAssets: offChain,
  } = instructionInfo;

  return assetCountToRaw({ fungible, nonFungible, offChain }, context);
};

export interface Storage {
  allowedAssetHolders: AssetHolder[];
  assetHolderParams: AssetHolderLike[];
  senderLegCount: BigNumber;
  totalLegCount: BigNumber;
  signer: Identity;
  offChainLegIndices: number[];
  instructionInfo: ExecuteInstructionInfo;
}

/**
 * @hidden
 */
const assertAssetHoldersAreValid = (
  assetHolderLikeParams: AssetHolderLike[],
  assetHolders: AssetHolder[],
  operation: InstructionAffirmationOperation
): void => {
  if (
    operation === InstructionAffirmationOperation.AffirmAsMediator ||
    operation === InstructionAffirmationOperation.RejectAsMediator ||
    operation === InstructionAffirmationOperation.WithdrawAsMediator
  ) {
    // since no asset holders are involved in these operations, consider them as valid
    return;
  }

  if (assetHolderLikeParams.length && assetHolderLikeParams.length !== assetHolders.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Some of the asset holders are not a involved in this instruction',
    });
  }

  if (!assetHolders.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The signer is not involved in this Instruction',
    });
  }
};

const assertReceipts = async (
  receipts: OffChainAffirmationReceipt[],
  offChainIndices: number[],
  instructionId: BigNumber,
  context: Context
): Promise<Vec<PolymeshPrimitivesSettlementReceiptDetails>> => {
  const {
    polymeshApi: {
      query: { settlement },
    },
  } = context;

  const instruction = new Instruction({ id: instructionId }, context);

  const { venue } = await instruction.detailsFromChain();
  const allowedSigners = await venue?.getAllowedSigners();

  const invalidReceipts: OffChainAffirmationReceipt[] = [];
  const invalidSignerReceipts: OffChainAffirmationReceipt[] = [];
  const uniqueLegs: number[] = [];
  const uniqueUid: number[] = [];

  const offchainAffirmationPromises: Promise<PolymeshPrimitivesSettlementAffirmationStatus>[] = [];

  receipts.forEach(receipt => {
    const { legId, uid, signer } = receipt;

    if (
      !offChainIndices.includes(legId.toNumber()) ||
      uniqueLegs.includes(legId.toNumber()) ||
      uniqueUid.includes(uid.toNumber())
    ) {
      invalidReceipts.push(receipt);
    }

    const { address: signerAddress } = asAccount(signer, context);

    const isAllowedSigner = allowedSigners
      ? allowedSigners.some(({ address }) => signerAddress === address)
      : false;

    if (!isAllowedSigner) {
      invalidSignerReceipts.push(receipt);
    }

    uniqueLegs.push(legId.toNumber());
    uniqueUid.push(uid.toNumber());

    offchainAffirmationPromises.push(
      settlement.offChainAffirmations(
        bigNumberToU64(instructionId, context),
        bigNumberToU64(legId, context)
      )
    );
  });

  if (invalidReceipts.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message:
        'Incorrect receipt details. Note, each leg in the receipt should be mapped to unique uid',
      data: {
        invalidReceipts: JSON.stringify(invalidReceipts),
      },
    });
  }

  if (invalidSignerReceipts.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Some signers are not allowed to sign the receipt for this Instruction',
      data: {
        invalidSignerReceipts,
      },
    });
  }

  const offChainAffirmationStatuses = await Promise.all(offchainAffirmationPromises);

  const alreadyAffirmedLegs: BigNumber[] = [];
  offChainAffirmationStatuses.forEach((status, index) => {
    const receipt = receipts[index];

    if (meshAffirmationStatusToAffirmationStatus(status) !== AffirmationStatus.Pending && receipt) {
      alreadyAffirmedLegs.push(receipt.legId);
    }
  });

  if (alreadyAffirmedLegs.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Some of the legs have already been affirmed',
      data: {
        alreadyAffirmedLegs,
      },
    });
  }

  const receiptsUsedPromises = receipts.map(({ signer, uid }) => {
    const { address } = asAccount(signer, context);
    return settlement.receiptsUsed(
      stringToAccountId(address, context),
      bigNumberToU64(uid, context)
    );
  });

  const receiptsUsed = await Promise.all(receiptsUsedPromises);

  receiptsUsed.forEach((rawBool, index) => {
    const receipt = receipts[index];

    if (boolToBoolean(rawBool) && receipt) {
      invalidReceipts.push(receipt);
    }
  });

  if (invalidReceipts.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Some of the receipts have already been used by the receipts signers',
      data: {
        invalidReceipts,
      },
    });
  }

  return receiptDetailsToMeshReceiptDetails(receipts, instructionId, context);
};

/**
 * @hidden
 */
function validateMediatorStatusForAffirmation(
  mediatorStatus: AffirmationStatus,
  signer: Identity,
  id: BigNumber
): void {
  if (mediatorStatus === AffirmationStatus.Unknown) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The signer is not a mediator',
      data: { signer: signer.did, instructionId: id.toString() },
    });
  }
}

/**
 * @hidden
 */
function validateMediatorStatusForWithdrawl(
  mediatorStatus: AffirmationStatus,
  signer: Identity,
  id: BigNumber
): void {
  if (mediatorStatus !== AffirmationStatus.Affirmed) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The signer is not a mediator that has already affirmed the instruction',
      data: { signer: signer.did, instructionId: id.toString() },
    });
  }
}

/**
 *
 */
function affirmAsMediator(
  mediatorStatus: AffirmationStatus,
  signer: Identity,
  context: Context,
  instruction: Instruction,
  expiry?: Date
): TransactionSpec<Instruction, ExtrinsicParams<'settlementTx', 'affirmInstructionAsMediator'>> {
  validateMediatorStatusForAffirmation(mediatorStatus, signer, instruction.id);
  const now = new Date();
  if (expiry && expiry < now) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The expiry must be in the future',
      data: { expiry, now },
    });
  }

  const rawInstructionId = bigNumberToU64(instruction.id, context);

  const rawExpiry = optionize(dateToMoment)(expiry, context);

  return {
    transaction: context.polymeshApi.tx.settlement.affirmInstructionAsMediator,
    resolver: instruction,
    args: [rawInstructionId, rawExpiry],
  };
}

/**
 * @hidden
 */
function rejectAsMediator(
  mediatorStatus: AffirmationStatus,
  signer: Identity,
  context: Context,
  instruction: Instruction,
  instructionInfo: ExecuteInstructionInfo
): TransactionSpec<Instruction, ExtrinsicParams<'settlementTx', 'rejectInstructionAsMediator'>> {
  if (mediatorStatus === AffirmationStatus.Unknown) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The signer is not a mediator for the instruction',
      data: { did: signer.did, instructionId: instruction.id.toString() },
    });
  }

  const rawAssetCount = getAssetCount(context, instructionInfo);

  const rawInstructionId = bigNumberToU64(instruction.id, context);
  return {
    transaction: context.polymeshApi.tx.settlement.rejectInstructionAsMediator,
    resolver: instruction,
    args: [rawInstructionId, rawAssetCount],
  };
}

/**
 * @hidden
 */
function reject(
  context: Context,
  instructionInfo: ExecuteInstructionInfo,
  instruction: Instruction,
  totalLegCount: BigNumber,
  rawAllowedAssetHolders: PolymeshPrimitivesAssetAssetHolder[]
): TransactionSpec<Instruction, ExtrinsicParams<'settlementTx', 'rejectInstructionWithCount'>> {
  const rawInstructionId = bigNumberToU64(instruction.id, context);
  const rawAssetCount = getAssetCount(context, instructionInfo);

  return {
    transaction: context.polymeshApi.tx.settlement.rejectInstructionWithCount,
    resolver: instruction,
    feeMultiplier: totalLegCount,
    // since only one asset holder is allowed while rejecting, it is safe to assume 0th index
    args: [rawInstructionId, rawAllowedAssetHolders[0], rawAssetCount],
  };
}

type ModifyInstructionType =
  | PolymeshTx<
      [
        u64,
        (
          | BTreeSet<PolymeshPrimitivesIdentityIdPortfolioId>
          | BTreeSet<PolymeshPrimitivesAssetAssetHolder>
        ),
        PolymeshPrimitivesSettlementAssetCount
      ]
    >
  | PolymeshTx<
      [
        u64,
        (
          | BTreeSet<PolymeshPrimitivesIdentityIdPortfolioId>
          | BTreeSet<PolymeshPrimitivesAssetAssetHolder>
        ),
        PolymeshPrimitivesSettlementAffirmationCount
      ]
    >
  | PolymeshTx<[u64, Option<PolymeshMoment>]>
  | PolymeshTx<[u64]>
  | PolymeshTx<
      [
        u64,
        Vec<PolymeshPrimitivesSettlementReceiptDetails>,
        (
          | BTreeSet<PolymeshPrimitivesIdentityIdPortfolioId>
          | BTreeSet<PolymeshPrimitivesAssetAssetHolder>
        ),
        Option<PolymeshPrimitivesSettlementAffirmationCount>
      ]
    >
  | null;

/**
 * @hidden
 */
async function validateInstructionNotLocked(instruction: Instruction): Promise<void> {
  const { lockedAt, unlocksAt } = await instruction.getLockedInfo();

  if (unlocksAt && unlocksAt >= new Date()) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The instruction is locked for execution',
      data: {
        instructionId: instruction.id.toString(),
        lockedAt,
        unlocksAt,
      },
    });
  }
}

/**
 * @hidden
 */
export async function prepareModifyInstructionAffirmation(
  this: Procedure<ModifyInstructionAffirmationParams, Instruction, Storage>,
  args: ModifyInstructionAffirmationParams
): Promise<
  | TransactionSpec<Instruction, ExtrinsicParams<'settlementTx', 'affirmInstructionWithCount'>>
  | TransactionSpec<Instruction, ExtrinsicParams<'settlementTx', 'affirmWithReceiptsWithCount'>>
  | TransactionSpec<Instruction, ExtrinsicParams<'settlementTx', 'withdrawAffirmationWithCount'>>
  | TransactionSpec<Instruction, ExtrinsicParams<'settlementTx', 'rejectInstructionWithCount'>>
  | TransactionSpec<Instruction, ExtrinsicParams<'settlementTx', 'affirmInstructionAsMediator'>>
  | TransactionSpec<Instruction, ExtrinsicParams<'settlementTx', 'withdrawAffirmationAsMediator'>>
  | TransactionSpec<Instruction, ExtrinsicParams<'settlementTx', 'rejectInstructionAsMediator'>>
> {
  const {
    context: {
      polymeshApi: {
        tx: { settlement: settlementTx },
        query: { settlement },
        call,
      },
    },
    context,
    storage: {
      allowedAssetHolders,
      assetHolderParams,
      senderLegCount,
      totalLegCount,
      signer,
      instructionInfo,
      offChainLegIndices,
    },
  } = this;

  const { operation, id, ...rest } = args;

  const instruction = new Instruction({ id }, context);

  await assertInstructionValid(instruction, context);

  if (!('receipts' in args)) {
    assertAssetHoldersAreValid(assetHolderParams, allowedAssetHolders, operation);
  }

  const rawInstructionId = bigNumberToU64(id, context);

  const rawAllowedAssetHolders = await Promise.all(
    allowedAssetHolders.map(
      async assetHolder =>
        await assetHolderIdToMeshAssetHolder(assetHolderLikeToAssetHolderId(assetHolder), context)
    )
  );

  const rawDid = stringToIdentityId(signer.did, context);

  const multiArgs = rawAllowedAssetHolders.map(rawAssetHolder =>
    tuple(rawAssetHolder, rawInstructionId)
  );

  const [rawAffirmationStatuses, rawMediatorAffirmation] = await Promise.all([
    settlement.userAffirmations.multi(multiArgs),
    settlement.instructionMediatorsAffirmations(rawInstructionId, rawDid),
  ]);

  const affirmationStatuses = rawAffirmationStatuses.map(meshAffirmationStatusToAffirmationStatus);
  const { status: mediatorStatus } = mediatorAffirmationStatusToStatus(rawMediatorAffirmation);

  const excludeCriteria: AffirmationStatus[] = [];
  let errorMessage: string;
  let transaction: ModifyInstructionType = null;

  let rawReceiptDetails: Vec<PolymeshPrimitivesSettlementReceiptDetails> | null = null;
  switch (operation) {
    case InstructionAffirmationOperation.AffirmAsMediator: {
      return affirmAsMediator(mediatorStatus, signer, context, instruction, args.expiry);
    }

    case InstructionAffirmationOperation.WithdrawAsMediator: {
      if (!context.isV7) {
        throw new PolymeshError({
          code: ErrorCode.NotSupported,
          message: 'Withdrawal of affirmed instructions has been discontinued from v8 chain',
        });
      }

      validateMediatorStatusForWithdrawl(mediatorStatus, signer, id);

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transaction: (settlementTx as any).withdrawAffirmationAsMediator,
        resolver: instruction,
        args: [rawInstructionId],
      };
    }

    case InstructionAffirmationOperation.RejectAsMediator: {
      return rejectAsMediator(mediatorStatus, signer, context, instruction, instructionInfo);
    }

    case InstructionAffirmationOperation.Reject: {
      await validateInstructionNotLocked(instruction);

      return reject(context, instructionInfo, instruction, totalLegCount, rawAllowedAssetHolders);
    }

    case InstructionAffirmationOperation.Affirm: {
      excludeCriteria.push(AffirmationStatus.Affirmed);
      errorMessage = 'The Instruction is already affirmed';
      const { receipts } = rest as AffirmInstructionParams;
      if (receipts?.length) {
        transaction = settlementTx.affirmWithReceiptsWithCount as ModifyInstructionType;
        rawReceiptDetails = await assertReceipts(receipts, offChainLegIndices, id, context);
      } else {
        transaction = settlementTx.affirmInstructionWithCount as ModifyInstructionType;
      }
      break;
    }

    case InstructionAffirmationOperation.Withdraw: {
      if (!context.isV7) {
        throw new PolymeshError({
          code: ErrorCode.UnmetPrerequisite,
          message: 'Withdrawal of affirmed instructions has been discontinued from v8 chain',
        });
      }
      await validateInstructionNotLocked(instruction);

      excludeCriteria.push(AffirmationStatus.Pending);
      errorMessage = 'The instruction is not affirmed';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transaction = (settlementTx as any).withdrawAffirmationWithCount as ModifyInstructionType;

      break;
    }
  }

  const validAssetHolders = rawAllowedAssetHolders.filter(
    (_, index) => !excludeCriteria.includes(affirmationStatuses[index]!)
  );

  if (!validAssetHolders.length && !rawReceiptDetails) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: errorMessage,
    });
  }

  const rawAffirmCount = await call.settlementApi.getAffirmationCount<AffirmationCount>(
    rawInstructionId,
    rawAllowedAssetHolders
  );

  const portfolioIds = assetHolderIdsToBtreeSet(validAssetHolders, context);

  if (transaction === settlementTx.affirmWithReceiptsWithCount) {
    return {
      transaction,
      resolver: instruction,
      args: [rawInstructionId, rawReceiptDetails, portfolioIds, rawAffirmCount],
    };
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: transaction as any,
    resolver: instruction,
    feeMultiplier: senderLegCount,
    args: [rawInstructionId, portfolioIds, rawAffirmCount],
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<ModifyInstructionAffirmationParams, Instruction, Storage>,
  args: ModifyInstructionAffirmationParams
): ProcedureAuthorization {
  const {
    storage: { allowedAssetHolders: assetHolders },
  } = this;

  let transactions: TxTag[];

  const { operation } = args;
  switch (operation) {
    case InstructionAffirmationOperation.Affirm: {
      const { receipts } = args;
      if (receipts?.length) {
        transactions = [TxTags.settlement.AffirmWithReceiptsWithCount];
      } else {
        transactions = [TxTags.settlement.AffirmInstructionWithCount];
      }

      break;
    }
    case InstructionAffirmationOperation.Withdraw: {
      transactions = [TxTags.settlement.WithdrawAffirmationWithCount];

      break;
    }
    case InstructionAffirmationOperation.Reject: {
      transactions = [TxTags.settlement.RejectInstructionWithCount];

      break;
    }
    case InstructionAffirmationOperation.AffirmAsMediator: {
      transactions = [TxTags.settlement.AffirmInstructionAsMediator];

      break;
    }
    case InstructionAffirmationOperation.WithdrawAsMediator: {
      transactions = [TxTags.settlement.WithdrawAffirmationAsMediator];

      break;
    }
    case InstructionAffirmationOperation.RejectAsMediator: {
      transactions = [TxTags.settlement.RejectInstructionAsMediator];

      break;
    }
  }

  return {
    permissions: {
      portfolios: assetHolders.filter(p => !(p instanceof Account)) as (
        | DefaultPortfolio
        | NumberedPortfolio
      )[],
      transactions,
      assets: [],
    },
  };
}

/**
 * @hidden
 */
function extractAssetHolderParams(params: ModifyInstructionAffirmationParams): AssetHolderLike[] {
  const { operation } = params;
  let assetHolderParams: AssetHolderLike[] = [];
  if (operation === InstructionAffirmationOperation.Reject) {
    const { portfolio } = params;
    if (portfolio) {
      assetHolderParams.push(portfolio);
    }
  } else if (
    operation === InstructionAffirmationOperation.Affirm ||
    operation === InstructionAffirmationOperation.Withdraw
  ) {
    const { portfolios } = params;
    if (portfolios) {
      assetHolderParams = [...assetHolderParams, ...portfolios];
    }
  }
  return assetHolderParams;
}

/**
 * @hidden
 */
export const isParam = (
  legAssetHolder: AssetHolder,
  assetHolderIdParams: AssetHolderId[]
): boolean => {
  if (!assetHolderIdParams.length) {
    return true;
  }

  const areAssetHolderIdsEqual = (holder1: AssetHolderId, holder2: AssetHolderId): boolean => {
    if (typeof holder1 === 'string' && typeof holder2 === 'string') {
      return holder1 === holder2;
    }
    if (typeof holder1 !== 'string' && typeof holder2 !== 'string') {
      return (
        holder1.did === holder2.did &&
        (holder1.number ?? new BigNumber(0)).eq(holder2.number ?? new BigNumber(0))
      );
    }
    return false;
  };

  const legAssetHolderId = assetHolderLikeToAssetHolderId(legAssetHolder);

  return assetHolderIdParams.some(assetHolderId =>
    areAssetHolderIdsEqual(legAssetHolderId, assetHolderId)
  );
};

/**
 * @hidden
 */
const assembleAssetHolders = async (
  result: [AssetHolder[], BigNumber],
  from: AssetHolder,
  to: AssetHolder,
  signingDid: string,
  assetHolderIdParams: AssetHolderId[]
): Promise<[AssetHolder[], BigNumber]> => {
  const [fromExists, toExists] = await Promise.all([from.exists(), to.exists()]);

  const checkCustody = async (
    legAssetHolder: AssetHolder,
    exists: boolean,
    sender: boolean
  ): Promise<[AssetHolder[], BigNumber]> => {
    let localAllowedAssetHolders: AssetHolder[] = [];
    let localSenderLegCount = new BigNumber(0);

    if (legAssetHolder instanceof Account) {
      const identity = await legAssetHolder.getIdentity();
      if (identity?.did === signingDid) {
        localAllowedAssetHolders = [legAssetHolder];
        if (sender) {
          localSenderLegCount = new BigNumber(1);
        }
      }
    } else if (exists) {
      const isCustodied = await legAssetHolder.isCustodiedBy({ identity: signingDid });
      if (isCustodied) {
        localAllowedAssetHolders = [legAssetHolder];
        if (sender) {
          localSenderLegCount = new BigNumber(1);
        }
      }
    } else if (legAssetHolder.owner.did === signingDid) {
      localAllowedAssetHolders = [legAssetHolder];
    }

    return [localAllowedAssetHolders, localSenderLegCount];
  };

  const promises = [];
  if (isParam(from, assetHolderIdParams)) {
    promises.push(checkCustody(from, fromExists, true));
  }

  if (isParam(to, assetHolderIdParams)) {
    promises.push(checkCustody(to, toExists, false));
  }

  const results = await Promise.all(promises);

  const [finalAssetHolders, finalSenderLegCount] = results.reduce(
    ([accAssetHolders, accCount], [currAssetHolders, currCount]) => [
      [...accAssetHolders, ...currAssetHolders],
      accCount.plus(currCount),
    ],
    result
  );

  return tuple(finalAssetHolders, finalSenderLegCount);
};

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<ModifyInstructionAffirmationParams, Instruction, Storage>,
  params: ModifyInstructionAffirmationParams
): Promise<Storage> {
  const {
    context,
    context: {
      polymeshApi: {
        call: { settlementApi },
      },
    },
  } = this;
  const { id } = params;
  const rawId = bigNumberToU64(id, context);

  const assetHolderParams = extractAssetHolderParams(params);

  const assetHolderIdParams = assetHolderParams.map(assetHolderLikeToAssetHolderId);

  const instruction = new Instruction({ id }, context);

  const [{ data: legs }, signer, executeInstructionInfo] = await Promise.all([
    instruction.getLegsFromChain(),
    context.getSigningIdentity(),
    settlementApi.getExecuteInstructionInfo(rawId),
  ]);

  const legContributions = await Promise.all(
    legs.map(async (leg, index) => {
      if (isOffChainLeg(leg)) {
        return {
          allowedAssetHolders: [] as AssetHolder[],
          senderLegCount: new BigNumber(0),
          offChainIndex: index,
        };
      } else {
        const { from, to } = leg;
        const [allowedAssetHolders, senderLegCount] = await assembleAssetHolders(
          tuple([], new BigNumber(0)),
          from,
          to,
          signer.did,
          assetHolderIdParams
        );
        return { allowedAssetHolders, senderLegCount, offChainIndex: undefined };
      }
    })
  );

  const allowedAssetHolders = legContributions.flatMap(c => c.allowedAssetHolders);
  const senderLegCount = legContributions.reduce(
    (sum, c) => sum.plus(c.senderLegCount),
    new BigNumber(0)
  );
  const offChainLegIndices = legContributions
    .filter(c => c.offChainIndex !== undefined)
    .map(c => c.offChainIndex);

  const instructionInfo = executeInstructionInfo.unwrapOrDefault();

  return {
    allowedAssetHolders,
    assetHolderParams,
    senderLegCount,
    totalLegCount: new BigNumber(legs.length),
    signer,
    offChainLegIndices,
    instructionInfo,
  };
}

/**
 * @hidden
 */
export const modifyInstructionAffirmation = (): Procedure<
  ModifyInstructionAffirmationParams,
  Instruction,
  Storage
> => new Procedure(prepareModifyInstructionAffirmation, getAuthorization, prepareStorage);
