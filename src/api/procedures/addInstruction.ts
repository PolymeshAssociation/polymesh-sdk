import { u64 } from '@polkadot/types';
import {
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesMemo,
  PolymeshPrimitivesSettlementLeg,
  PolymeshPrimitivesSettlementSettlementType,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { flatten, isEqual, union, unionWith } from 'lodash';

import { assertPortfolioExists, assertVenueExists } from '~/api/procedures/utils';
import {
  Context,
  DefaultPortfolio,
  Instruction,
  NumberedPortfolio,
  PolymeshError,
  Procedure,
} from '~/internal';
import {
  AddInstructionParams,
  AddInstructionsParams,
  ErrorCode,
  InstructionEndCondition,
  InstructionFungibleLeg,
  InstructionNonFungibleLeg,
  InstructionType,
  RoleType,
  SettlementTx,
  TxTags,
} from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import { MAX_LEGS_LENGTH } from '~/utils/constants';
import {
  bigNumberToBalance,
  bigNumberToU64,
  dateToMoment,
  endConditionToSettlementType,
  legToFungibleLeg,
  legToNonFungibleLeg,
  nftToMeshNft,
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolio,
  portfolioLikeToPortfolioId,
  stringToMemo,
  stringToTicker,
  u64ToBigNumber,
} from '~/utils/conversion';
import {
  assembleBatchTransactions,
  assetInputToAsset,
  asTicker,
  filterEventRecords,
  optionize,
} from '~/utils/internal';

/**
 * @hidden
 */
export type Params = AddInstructionsParams & {
  venueId: BigNumber;
};

/**
 * @hidden
 */
export interface Storage {
  portfoliosToAffirm: (DefaultPortfolio | NumberedPortfolio)[][];
}

/**
 * @hidden
 */
type InternalAddAndAffirmInstructionParams = [
  u64,
  PolymeshPrimitivesSettlementSettlementType,
  u64 | null,
  u64 | null,
  PolymeshPrimitivesSettlementLeg[],
  PolymeshPrimitivesIdentityIdPortfolioId[],
  PolymeshPrimitivesMemo | null
][];

/**
 * @hidden
 */
type InternalAddInstructionParams = [
  u64,
  PolymeshPrimitivesSettlementSettlementType,
  u64 | null,
  u64 | null,
  PolymeshPrimitivesSettlementLeg[],
  PolymeshPrimitivesMemo | null
][];

/**
 * @hidden
 */
export const createAddInstructionResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): Instruction[] => {
    const events = filterEventRecords(receipt, 'settlement', 'InstructionCreated');

    const result = events.map(
      ({ data }) => new Instruction({ id: u64ToBigNumber(data[2]) }, context)
    );

    return result;
  };

/**
 * @hidden
 */
function getEndCondition(
  instruction: AddInstructionParams,
  latestBlock: BigNumber,
  index: number
): { endCondition: InstructionEndCondition; errorIndex: number | null } {
  let endCondition: InstructionEndCondition;
  let errorIndex = null;

  if ('endBlock' in instruction && instruction.endBlock) {
    const { endBlock } = instruction;

    if (endBlock.lte(latestBlock)) {
      errorIndex = index;
    }

    endCondition = { type: InstructionType.SettleOnBlock, endBlock };
  } else if ('endAfterBlock' in instruction && instruction.endAfterBlock) {
    const { endAfterBlock } = instruction;

    if (endAfterBlock.lte(latestBlock)) {
      errorIndex = index;
    }

    endCondition = { type: InstructionType.SettleManual, endAfterBlock };
  } else {
    endCondition = { type: InstructionType.SettleOnAffirmation };
  }

  return {
    endCondition,
    errorIndex,
  };
}

/**
 * @hidden
 */
async function getTxArgsAndErrors(
  instructions: AddInstructionParams[],
  portfoliosToAffirm: (DefaultPortfolio | NumberedPortfolio)[][],
  latestBlock: BigNumber,
  venueId: BigNumber,
  context: Context
): Promise<{
  errIndexes: {
    legEmptyErrIndexes: number[];
    legLengthErrIndexes: number[];
    legAmountErrIndexes: number[];
    endBlockErrIndexes: number[];
    datesErrIndexes: number[];
    sameIdentityErrIndexes: number[];
  };
  addAndAffirmInstructionParams: InternalAddAndAffirmInstructionParams;
  addInstructionParams: InternalAddInstructionParams;
}> {
  const addAndAffirmInstructionParams: InternalAddAndAffirmInstructionParams = [];
  const addInstructionParams: InternalAddInstructionParams = [];

  const legEmptyErrIndexes: number[] = [];
  const legLengthErrIndexes: number[] = [];
  const legAmountErrIndexes: number[] = [];
  const endBlockErrIndexes: number[] = [];
  const sameIdentityErrIndexes: number[] = [];
  /**
   * array of indexes of Instructions where the value date is before the trade date
   */
  const datesErrIndexes: number[] = [];

  await P.each(instructions, async (instruction, i) => {
    const { legs, tradeDate, valueDate, memo } = instruction;
    if (!legs.length) {
      legEmptyErrIndexes.push(i);
    }

    if (legs.length > MAX_LEGS_LENGTH) {
      legLengthErrIndexes.push(i);
    }

    const fungibleLegs: InstructionFungibleLeg[] = [];
    const nftLegs: InstructionNonFungibleLeg[] = [];

    for (const leg of legs) {
      const { asset } = leg;
      const { type: assetType } = await assetInputToAsset(asset, context);
      if (assetType === 'fungible') {
        fungibleLegs.push(leg as InstructionFungibleLeg);
      } else if (assetType === 'nftCollection') {
        nftLegs.push(leg as InstructionNonFungibleLeg);
      }
    }

    const zeroAmountFungibleLegs = fungibleLegs.filter(leg => leg.amount.isZero());
    if (zeroAmountFungibleLegs.length) {
      legAmountErrIndexes.push(i);
    }

    const zeroNftsNonFungible = nftLegs.filter(leg => leg.nfts.length === 0);
    if (zeroNftsNonFungible.length) {
      legAmountErrIndexes.push(i);
    }

    const sameIdentityLegs = legs.filter(({ from, to }) => {
      const fromId = portfolioLikeToPortfolioId(from);
      const toId = portfolioLikeToPortfolioId(to);
      return fromId.did === toId.did;
    });

    if (sameIdentityLegs.length) {
      sameIdentityErrIndexes.push(i);
    }

    const { endCondition, errorIndex } = getEndCondition(instruction, latestBlock, i);

    if (errorIndex !== null) {
      endBlockErrIndexes.push(errorIndex);
    }

    if (tradeDate && valueDate && tradeDate > valueDate) {
      datesErrIndexes.push(i);
    }

    if (
      !legEmptyErrIndexes.length &&
      !legLengthErrIndexes.length &&
      !legAmountErrIndexes.length &&
      !endBlockErrIndexes.length &&
      !datesErrIndexes.length &&
      !sameIdentityErrIndexes.length
    ) {
      const rawVenueId = bigNumberToU64(venueId, context);
      const rawSettlementType = endConditionToSettlementType(endCondition, context);
      const rawTradeDate = optionize(dateToMoment)(tradeDate, context);
      const rawValueDate = optionize(dateToMoment)(valueDate, context);
      const rawLegs: PolymeshPrimitivesSettlementLeg[] = [];
      const rawInstructionMemo = optionize(stringToMemo)(memo, context);

      await Promise.all([
        ...fungibleLegs.map(async ({ from, to, amount, asset }) => {
          const fromId = portfolioLikeToPortfolioId(from);
          const toId = portfolioLikeToPortfolioId(to);

          await Promise.all([
            assertPortfolioExists(fromId, context),
            assertPortfolioExists(toId, context),
          ]);

          const rawFromPortfolio = portfolioIdToMeshPortfolioId(fromId, context);
          const rawToPortfolio = portfolioIdToMeshPortfolioId(toId, context);

          const rawLeg = legToFungibleLeg(
            {
              sender: rawFromPortfolio,
              receiver: rawToPortfolio,
              ticker: stringToTicker(asTicker(asset), context),
              amount: bigNumberToBalance(amount, context),
            },
            context
          );

          rawLegs.push(rawLeg);
        }),
        ...nftLegs.map(async ({ from, to, nfts, asset }) => {
          const fromId = portfolioLikeToPortfolioId(from);
          const toId = portfolioLikeToPortfolioId(to);

          await Promise.all([
            assertPortfolioExists(fromId, context),
            assertPortfolioExists(toId, context),
          ]);

          const rawFromPortfolio = portfolioIdToMeshPortfolioId(fromId, context);
          const rawToPortfolio = portfolioIdToMeshPortfolioId(toId, context);

          const rawLeg = legToNonFungibleLeg(
            {
              sender: rawFromPortfolio,
              receiver: rawToPortfolio,
              nfts: nftToMeshNft(asTicker(asset), nfts, context),
            },
            context
          );

          rawLegs.push(rawLeg);
        }),
      ]);

      if (portfoliosToAffirm[i].length) {
        addAndAffirmInstructionParams.push([
          rawVenueId,
          rawSettlementType,
          rawTradeDate,
          rawValueDate,
          rawLegs,
          portfoliosToAffirm[i].map(portfolio =>
            portfolioIdToMeshPortfolioId(portfolioLikeToPortfolioId(portfolio), context)
          ),
          rawInstructionMemo,
        ]);
      } else {
        addInstructionParams.push([
          rawVenueId,
          rawSettlementType,
          rawTradeDate,
          rawValueDate,
          rawLegs,
          rawInstructionMemo,
        ]);
      }
    }
  });

  return {
    errIndexes: {
      legEmptyErrIndexes,
      legLengthErrIndexes,
      legAmountErrIndexes,
      endBlockErrIndexes,
      datesErrIndexes,
      sameIdentityErrIndexes,
    },
    addAndAffirmInstructionParams,
    addInstructionParams,
  };
}

/**
 * @hidden
 */
export async function prepareAddInstruction(
  this: Procedure<Params, Instruction[], Storage>,
  args: Params
): Promise<BatchTransactionSpec<Instruction[], unknown[][]>> {
  const {
    context: {
      polymeshApi: {
        tx: { settlement },
      },
    },
    context,
    storage: { portfoliosToAffirm },
  } = this;
  const { instructions, venueId } = args;

  const [latestBlock] = await Promise.all([
    context.getLatestBlock(),
    assertVenueExists(venueId, context),
  ]);

  if (!instructions.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Instructions array cannot be empty',
    });
  }

  const {
    errIndexes: {
      legEmptyErrIndexes,
      legLengthErrIndexes,
      legAmountErrIndexes,
      endBlockErrIndexes,
      datesErrIndexes,
      sameIdentityErrIndexes,
    },
    addAndAffirmInstructionParams,
    addInstructionParams,
  } = await getTxArgsAndErrors(instructions, portfoliosToAffirm, latestBlock, venueId, context);

  if (legEmptyErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The legs array can't be empty",
      data: {
        failedInstructionIndexes: legEmptyErrIndexes,
      },
    });
  }

  if (legAmountErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Instruction legs cannot have zero amount',
      data: {
        failedInstructionIndexes: legAmountErrIndexes,
      },
    });
  }

  if (legLengthErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: 'The legs array exceeds the maximum allowed length',
      data: {
        maxLength: MAX_LEGS_LENGTH,
        failedInstructionIndexes: legLengthErrIndexes,
      },
    });
  }

  if (endBlockErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'End block must be a future block',
      data: {
        failedInstructionIndexes: endBlockErrIndexes,
      },
    });
  }

  if (datesErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Value date must be after trade date',
      data: {
        failedInstructionIndexes: datesErrIndexes,
      },
    });
  }

  if (sameIdentityErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Instruction leg cannot transfer Assets between same identity',
      data: {
        failedInstructionIndexes: sameIdentityErrIndexes,
      },
    });
  }

  const transactions = assembleBatchTransactions([
    {
      transaction: settlement.addInstruction,
      argsArray: addInstructionParams,
    },
    {
      transaction: settlement.addAndAffirmInstruction,
      argsArray: addAndAffirmInstructionParams,
    },
  ] as const);

  return {
    transactions,
    resolver: createAddInstructionResolver(context),
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, Instruction[], Storage>,
  { venueId }: Params
): Promise<ProcedureAuthorization> {
  const {
    storage: { portfoliosToAffirm },
  } = this;

  let transactions: SettlementTx[] = [];
  let portfolios: (DefaultPortfolio | NumberedPortfolio)[] = [];

  portfoliosToAffirm.forEach(portfoliosList => {
    transactions = union(transactions, [
      portfoliosList.length
        ? TxTags.settlement.AddAndAffirmInstructionWithMemo
        : TxTags.settlement.AddInstructionWithMemo,
    ]);
    portfolios = unionWith(portfolios, portfoliosList, isEqual);
  });

  return {
    roles: [{ type: RoleType.VenueOwner, venueId }],
    permissions: {
      assets: [],
      portfolios,
      transactions,
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, Instruction[], Storage>,
  { instructions }: Params
): Promise<Storage> {
  const { context } = this;

  const identity = await context.getSigningIdentity();

  const portfoliosToAffirm = await P.map(instructions, async ({ legs }) => {
    const portfolios = await P.map(legs, async ({ from, to }) => {
      const fromPortfolio = portfolioLikeToPortfolio(from, context);
      const toPortfolio = portfolioLikeToPortfolio(to, context);

      const result = [];
      const [fromCustodied, toCustodied] = await Promise.all([
        fromPortfolio.isCustodiedBy({ identity }),
        toPortfolio.isCustodiedBy({ identity }),
      ]);

      if (fromCustodied) {
        result.push(fromPortfolio);
      }

      if (toCustodied) {
        result.push(toPortfolio);
      }

      return result;
    });
    return flatten(portfolios);
  });

  return {
    portfoliosToAffirm,
  };
}

/**
 * @hidden
 */
export const addInstruction = (): Procedure<Params, Instruction[], Storage> =>
  new Procedure(prepareAddInstruction, getAuthorization, prepareStorage);
