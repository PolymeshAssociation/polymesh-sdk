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
  DefaultPortfolio,
  ErrorCode,
  InstructionAffirmationOperation,
  ModifyInstructionAffirmationParams,
  NumberedPortfolio,
  OffChainAffirmationReceipt,
  PortfolioId,
  PortfolioLike,
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
  portfolioLikeToPortfolioId,
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
  portfolios: AssetHolder[];
  portfolioParams: PortfolioLike[];
  senderLegAmount: BigNumber;
  totalLegAmount: BigNumber;
  signer: Identity;
  offChainLegIndices: number[];
  instructionInfo: ExecuteInstructionInfo;
}

/**
 * @hidden
 */
const assertPortfoliosValid = (
  portfolioParams: PortfolioLike[],
  portfolios: AssetHolder[],
  operation: InstructionAffirmationOperation
): void => {
  if (
    operation === InstructionAffirmationOperation.AffirmAsMediator ||
    operation === InstructionAffirmationOperation.RejectAsMediator ||
    operation === InstructionAffirmationOperation.WithdrawAsMediator
  ) {
    return;
  }

  if (portfolioParams.length && portfolioParams.length !== portfolios.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Some of the portfolios are not a involved in this instruction',
    });
  }

  if (!portfolios.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The signing Identity is not involved in this Instruction',
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
  totalLegAmount: BigNumber,
  rawPortfolioIds: PolymeshPrimitivesAssetAssetHolder[]
): TransactionSpec<Instruction, ExtrinsicParams<'settlementTx', 'rejectInstructionWithCount'>> {
  const rawInstructionId = bigNumberToU64(instruction.id, context);
  const rawAssetCount = getAssetCount(context, instructionInfo);

  return {
    transaction: context.polymeshApi.tx.settlement.rejectInstructionWithCount,
    resolver: instruction,
    feeMultiplier: totalLegAmount,
    args: [rawInstructionId, rawPortfolioIds[0], rawAssetCount],
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
      portfolios,
      portfolioParams,
      senderLegAmount,
      totalLegAmount,
      signer,
      instructionInfo,
      offChainLegIndices,
    },
  } = this;

  const { operation, id, ...rest } = args;

  const instruction = new Instruction({ id }, context);

  await assertInstructionValid(instruction, context);

  if (!('receipts' in args)) {
    assertPortfoliosValid(portfolioParams, portfolios, operation);
  }

  const rawInstructionId = bigNumberToU64(id, context);

  const rawAssetHolders: PolymeshPrimitivesAssetAssetHolder[] = portfolios.map(portfolio =>
    assetHolderIdToMeshAssetHolder(assetHolderLikeToAssetHolderId(portfolio), context)
  );

  const rawDid = stringToIdentityId(signer.did, context);

  const multiArgs = rawAssetHolders.map(assetHolder => tuple(assetHolder, rawInstructionId));

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
      validateMediatorStatusForWithdrawl(mediatorStatus, signer, id);

      return {
        transaction: settlementTx.withdrawAffirmationAsMediator,
        resolver: instruction,
        args: [rawInstructionId],
      };
    }

    case InstructionAffirmationOperation.RejectAsMediator: {
      return rejectAsMediator(mediatorStatus, signer, context, instruction, instructionInfo);
    }

    case InstructionAffirmationOperation.Reject: {
      await validateInstructionNotLocked(instruction);

      return reject(context, instructionInfo, instruction, totalLegAmount, rawAssetHolders);
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
      await validateInstructionNotLocked(instruction);

      excludeCriteria.push(AffirmationStatus.Pending);
      errorMessage = 'The instruction is not affirmed';
      transaction = settlementTx.withdrawAffirmationWithCount as ModifyInstructionType;

      break;
    }
  }

  const validAssetHolders = rawAssetHolders.filter(
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
    rawAssetHolders
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
    feeMultiplier: senderLegAmount,
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
    storage: { portfolios },
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
      portfolios: portfolios.filter(p => !(p instanceof Account)) as (
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
function extractPortfolioParams(params: ModifyInstructionAffirmationParams): PortfolioLike[] {
  const { operation } = params;
  let portfolioParams: PortfolioLike[] = [];
  if (operation === InstructionAffirmationOperation.Reject) {
    const { portfolio } = params;
    if (portfolio) {
      portfolioParams.push(portfolio);
    }
  } else if (
    operation === InstructionAffirmationOperation.Affirm ||
    operation === InstructionAffirmationOperation.Withdraw
  ) {
    const { portfolios } = params;
    if (portfolios) {
      portfolioParams = [...portfolioParams, ...portfolios];
    }
  }
  return portfolioParams;
}

/**
 * @hidden
 */
export const isParam = (legAssetHolder: AssetHolder, portfolioIdParams: PortfolioId[]): boolean => {
  const assetHolder = assetHolderLikeToAssetHolderId(legAssetHolder);
  if (typeof assetHolder === 'string') {
    return false;
  }
  const { did: legPortfolioDid, number: legPortfolioNumber } = assetHolder;
  return (
    !portfolioIdParams.length ||
    portfolioIdParams.some(
      ({ did, number }) =>
        did === legPortfolioDid &&
        new BigNumber(legPortfolioNumber ?? 0).eq(new BigNumber(number ?? 0))
    )
  );
};

/**
 * @hidden
 */
const assemblePortfolios = async (
  result: [AssetHolder[], BigNumber],
  from: AssetHolder,
  to: AssetHolder,
  signingDid: string,
  portfolioIdParams: PortfolioId[]
): Promise<[AssetHolder[], BigNumber]> => {
  const [fromExists, toExists] = await Promise.all([from.exists(), to.exists()]);

  const [custodiedPortfolios, amount] = result;

  let res = [...custodiedPortfolios];
  let legAmount = amount;

  const checkCustody = async (
    legAssetHolder: AssetHolder,
    exists: boolean,
    sender: boolean
  ): Promise<void> => {
    if (legAssetHolder instanceof Account) {
      res = [...res, legAssetHolder];
    } else if (exists) {
      const isCustodied = await legAssetHolder.isCustodiedBy({ identity: signingDid });
      if (isCustodied) {
        res = [...res, legAssetHolder];
        if (sender) {
          legAmount = legAmount.plus(1);
        }
      }
    } else if (legAssetHolder.owner.did === signingDid) {
      res = [...res, legAssetHolder];
    }
  };

  const promises = [];
  if (isParam(from, portfolioIdParams)) {
    promises.push(checkCustody(from, fromExists, true));
  }

  if (isParam(to, portfolioIdParams)) {
    promises.push(checkCustody(to, toExists, false));
  }

  await Promise.all(promises);

  return tuple(res, legAmount);
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

  const portfolioParams = extractPortfolioParams(params);

  const portfolioIdParams = portfolioParams.map(portfolioLikeToPortfolioId);

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
          addedPortfolios: [] as (DefaultPortfolio | NumberedPortfolio)[],
          deltaAmount: new BigNumber(0),
          offChainIndex: index,
        };
      } else {
        const { from, to } = leg;
        const [addedPortfolios, deltaAmount] = await assemblePortfolios(
          tuple([], new BigNumber(0)),
          from,
          to,
          signer.did,
          portfolioIdParams
        );
        return { addedPortfolios, deltaAmount, offChainIndex: undefined };
      }
    })
  );

  const portfolios = legContributions.flatMap(c => c.addedPortfolios);
  const senderLegAmount = legContributions.reduce(
    (sum, c) => sum.plus(c.deltaAmount),
    new BigNumber(0)
  );
  const offChainLegIndices = legContributions
    .filter(c => c.offChainIndex !== undefined)
    .map(c => c.offChainIndex);

  const instructionInfo = executeInstructionInfo.unwrapOrDefault();

  return {
    portfolios,
    portfolioParams,
    senderLegAmount,
    totalLegAmount: new BigNumber(legs.length),
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
