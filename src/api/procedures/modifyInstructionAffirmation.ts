import { BTreeSet, Option, u64, Vec } from '@polkadot/types';
import {
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesSettlementAffirmationCount,
  PolymeshPrimitivesSettlementAffirmationStatus,
  PolymeshPrimitivesSettlementAssetCount,
  PolymeshPrimitivesSettlementReceiptDetails,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import P from 'bluebird';

import { assertInstructionValid } from '~/api/procedures/utils';
import { Context, Identity, Instruction, PolymeshError, Procedure } from '~/internal';
import { AffirmationCount, ExecuteInstructionInfo, Moment } from '~/polkadot/polymesh';
import {
  AffirmationStatus,
  AffirmInstructionParams,
  DefaultPortfolio,
  ErrorCode,
  InstructionAffirmationOperation,
  Leg,
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
  bigNumberToU64,
  boolToBoolean,
  dateToMoment,
  mediatorAffirmationStatusToStatus,
  meshAffirmationStatusToAffirmationStatus,
  portfolioIdsToBtreeSet,
  portfolioIdToMeshPortfolioId,
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
  portfolios: (DefaultPortfolio | NumberedPortfolio)[];
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
  portfolios: (DefaultPortfolio | NumberedPortfolio)[],
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
    if (meshAffirmationStatusToAffirmationStatus(status) !== AffirmationStatus.Pending) {
      alreadyAffirmedLegs.push(receipts[index].legId);
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
    if (boolToBoolean(rawBool)) {
      invalidReceipts.push(receipts[index]);
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

  await Promise.all([assertInstructionValid(instruction, context)]);

  if (!('receipts' in args)) {
    assertPortfoliosValid(portfolioParams, portfolios, operation);
  }

  const rawInstructionId = bigNumberToU64(id, context);

  const rawPortfolioIds: PolymeshPrimitivesIdentityIdPortfolioId[] = portfolios.map(portfolio =>
    portfolioIdToMeshPortfolioId(portfolioLikeToPortfolioId(portfolio), context)
  );

  const rawDid = stringToIdentityId(signer.did, context);

  const multiArgs = rawPortfolioIds.map(portfolioId => tuple(portfolioId, rawInstructionId));

  const [rawAffirmationStatuses, rawMediatorAffirmation] = await Promise.all([
    settlement.userAffirmations.multi(multiArgs),
    settlement.instructionMediatorsAffirmations(rawInstructionId, rawDid),
  ]);

  const affirmationStatuses = rawAffirmationStatuses.map(meshAffirmationStatusToAffirmationStatus);
  const { status: mediatorStatus, expiry } =
    mediatorAffirmationStatusToStatus(rawMediatorAffirmation);

  const excludeCriteria: AffirmationStatus[] = [];
  let errorMessage: string;
  let transaction:
    | PolymeshTx<
        [
          u64,
          BTreeSet<PolymeshPrimitivesIdentityIdPortfolioId>,
          PolymeshPrimitivesSettlementAssetCount
        ]
      >
    | PolymeshTx<
        [
          u64,
          BTreeSet<PolymeshPrimitivesIdentityIdPortfolioId>,
          PolymeshPrimitivesSettlementAffirmationCount
        ]
      >
    | PolymeshTx<[u64, Option<Moment>]>
    | PolymeshTx<[u64]>
    | PolymeshTx<
        [
          u64,
          Vec<PolymeshPrimitivesSettlementReceiptDetails>,
          BTreeSet<PolymeshPrimitivesIdentityIdPortfolioId>,
          Option<PolymeshPrimitivesSettlementAffirmationCount>
        ]
      >
    | null = null;

  let rawReceiptDetails: Vec<PolymeshPrimitivesSettlementReceiptDetails> | null = null;
  switch (operation) {
    case InstructionAffirmationOperation.AffirmAsMediator: {
      validateMediatorStatusForAffirmation(mediatorStatus, signer, id);

      const givenExpiry = args.expiry;
      const now = new Date();
      if (givenExpiry && givenExpiry < now) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'The expiry must be in the future',
          data: { expiry, now },
        });
      }

      const rawExpiry = optionize(dateToMoment)(givenExpiry, context);

      return {
        transaction: settlementTx.affirmInstructionAsMediator,
        resolver: instruction,
        args: [rawInstructionId, rawExpiry],
      };
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
      if (mediatorStatus === AffirmationStatus.Unknown) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'The signer is not a mediator for the instruction',
          data: { did: signer.did, instructionId: id.toString() },
        });
      }

      const rawAssetCount = getAssetCount(context, instructionInfo);

      return {
        transaction: settlementTx.rejectInstructionAsMediator,
        resolver: instruction,
        args: [rawInstructionId, rawAssetCount],
      };
    }

    case InstructionAffirmationOperation.Reject: {
      const rawAssetCount = getAssetCount(context, instructionInfo);

      return {
        transaction: settlementTx.rejectInstructionWithCount,
        resolver: instruction,
        feeMultiplier: totalLegAmount,
        args: [rawInstructionId, rawPortfolioIds[0], rawAssetCount],
      };
    }

    case InstructionAffirmationOperation.Affirm: {
      excludeCriteria.push(AffirmationStatus.Affirmed);
      errorMessage = 'The Instruction is already affirmed';
      const { receipts } = rest as AffirmInstructionParams;
      if (receipts?.length) {
        transaction = settlementTx.affirmWithReceiptsWithCount;
        rawReceiptDetails = await assertReceipts(receipts, offChainLegIndices, id, context);
      } else {
        transaction = settlementTx.affirmInstructionWithCount;
      }
      break;
    }

    case InstructionAffirmationOperation.Withdraw: {
      excludeCriteria.push(AffirmationStatus.Pending);
      errorMessage = 'The instruction is not affirmed';
      transaction = settlementTx.withdrawAffirmationWithCount;

      break;
    }
  }

  const validPortfolioIds = rawPortfolioIds.filter(
    (_, index) => !excludeCriteria.includes(affirmationStatuses[index])
  );

  if (!validPortfolioIds.length && !rawReceiptDetails) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: errorMessage,
    });
  }

  const rawAffirmCount = await call.settlementApi.getAffirmationCount<AffirmationCount>(
    rawInstructionId,
    rawPortfolioIds
  );

  let portfolioIds;
  if (context.isV6) {
    portfolioIds = validPortfolioIds;
  } else {
    portfolioIds = portfolioIdsToBtreeSet(validPortfolioIds, context);
  }

  if (transaction === settlementTx.affirmWithReceiptsWithCount) {
    return {
      transaction,
      resolver: instruction,
      args: [rawInstructionId, rawReceiptDetails, portfolioIds, rawAffirmCount],
    };
  }

  return {
    transaction,
    resolver: instruction,
    feeMultiplier: senderLegAmount,
    args: [rawInstructionId, portfolioIds, rawAffirmCount],
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<ModifyInstructionAffirmationParams, Instruction, Storage>,
  args: ModifyInstructionAffirmationParams
): Promise<ProcedureAuthorization> {
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
      portfolios,
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
const isParam = (
  legPortfolio: DefaultPortfolio | NumberedPortfolio,
  portfolioIdParams: PortfolioId[]
): boolean => {
  const { did: legPortfolioDid, number: legPortfolioNumber } =
    portfolioLikeToPortfolioId(legPortfolio);
  return (
    !portfolioIdParams.length ||
    portfolioIdParams.some(
      ({ did, number }) =>
        did === legPortfolioDid &&
        new BigNumber(legPortfolioNumber || 0).eq(new BigNumber(number || 0))
    )
  );
};

/**
 * @hidden
 */
const assemblePortfolios = async (
  result: [(DefaultPortfolio | NumberedPortfolio)[], BigNumber],
  from: DefaultPortfolio | NumberedPortfolio,
  to: DefaultPortfolio | NumberedPortfolio,
  signingDid: string,
  portfolioIdParams: PortfolioId[]
): Promise<[(DefaultPortfolio | NumberedPortfolio)[], BigNumber]> => {
  const [fromExists, toExists] = await Promise.all([from.exists(), to.exists()]);

  const [custodiedPortfolios, amount] = result;

  let res = [...custodiedPortfolios];
  let legAmount = amount;

  const checkCustody = async (
    legPortfolio: DefaultPortfolio | NumberedPortfolio,
    exists: boolean,
    sender: boolean
  ): Promise<void> => {
    if (exists) {
      const isCustodied = await legPortfolio.isCustodiedBy({ identity: signingDid });
      if (isCustodied) {
        res = [...res, legPortfolio];
        if (sender) {
          legAmount = legAmount.plus(1);
        }
      }
    } else if (legPortfolio.owner.did === signingDid) {
      res = [...res, legPortfolio];
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
    context: { polymeshApi },
  } = this;
  const { id } = params;
  const rawId = bigNumberToU64(id, context);

  const portfolioParams = extractPortfolioParams(params);

  const portfolioIdParams = portfolioParams.map(portfolioLikeToPortfolioId);

  const instruction = new Instruction({ id }, context);

  const [{ data: legs }, signer, executeInstructionInfo] = await Promise.all([
    instruction.getLegsFromChain(),
    context.getSigningIdentity(),
    polymeshApi.call.settlementApi.getExecuteInstructionInfo(rawId),
  ]);

  const [portfolios, senderLegAmount, offChainLegIndices] = await P.reduce<
    Leg,
    [(DefaultPortfolio | NumberedPortfolio)[], BigNumber, number[]]
  >(
    legs,
    async (result, leg, index) => {
      let [custodiedPortfolios, legAmount, offChainLegs] = result;
      if (isOffChainLeg(leg)) {
        offChainLegs.push(index);
      } else {
        const { from, to } = leg;
        [custodiedPortfolios, legAmount] = await assemblePortfolios(
          tuple(custodiedPortfolios, legAmount),
          from,
          to,
          signer.did,
          portfolioIdParams
        );
      }
      return tuple(custodiedPortfolios, legAmount, offChainLegs);
    },
    [[], new BigNumber(0), []]
  );

  let instructionInfo: ExecuteInstructionInfo;
  /* istanbul ignore if: this will be removed after dual version support for v6-v7 */
  if (context.isV6) {
    instructionInfo = executeInstructionInfo as unknown as ExecuteInstructionInfo;
  } else {
    const rawInfo = executeInstructionInfo as Option<ExecuteInstructionInfo>;
    instructionInfo = rawInfo.unwrapOrDefault();
  }

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
