import { u64 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import {
  PalletSettlementInstructionMemo,
  PalletSettlementSettlementType,
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesTicker,
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
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolio,
  portfolioLikeToPortfolioId,
  stringToInstructionMemo,
  stringToTicker,
  u64ToBigNumber,
} from '~/utils/conversion';
import {
  assembleBatchTransactions,
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
  PalletSettlementSettlementType,
  u64 | null,
  u64 | null,
  {
    from: PolymeshPrimitivesIdentityIdPortfolioId;
    to: PolymeshPrimitivesIdentityIdPortfolioId;
    asset: PolymeshPrimitivesTicker;
    amount: Balance;
  }[],
  PolymeshPrimitivesIdentityIdPortfolioId[],
  PalletSettlementInstructionMemo | null
][];

/**
 * @hidden
 */
type InternalAddInstructionParams = [
  u64,
  PalletSettlementSettlementType,
  u64 | null,
  u64 | null,
  {
    from: PolymeshPrimitivesIdentityIdPortfolioId;
    to: PolymeshPrimitivesIdentityIdPortfolioId;
    asset: PolymeshPrimitivesTicker;
    amount: Balance;
  }[],
  PalletSettlementInstructionMemo | null
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
  /**
   * array of indexes of Instructions where the value date is before the trade date
   */
  const datesErrIndexes: number[] = [];

  await P.each(instructions, async ({ legs, endBlock, tradeDate, valueDate, memo }, i) => {
    if (!legs.length) {
      legEmptyErrIndexes.push(i);
    }

    if (legs.length > MAX_LEGS_LENGTH) {
      legLengthErrIndexes.push(i);
    }

    const zeroAmountLegs = legs.filter(leg => leg.amount.isZero());
    if (zeroAmountLegs.length) {
      legAmountErrIndexes.push(i);
    }

    let endCondition;

    if (endBlock) {
      if (endBlock.lte(latestBlock)) {
        endBlockErrIndexes.push(i);
      }

      endCondition = { type: InstructionType.SettleOnBlock, value: endBlock } as const;
    } else {
      endCondition = { type: InstructionType.SettleOnAffirmation } as const;
    }

    if (tradeDate && valueDate && tradeDate > valueDate) {
      datesErrIndexes.push(i);
    }

    if (
      !legEmptyErrIndexes.length &&
      !legLengthErrIndexes.length &&
      !legAmountErrIndexes.length &&
      !endBlockErrIndexes.length &&
      !datesErrIndexes.length
    ) {
      const rawVenueId = bigNumberToU64(venueId, context);
      const rawSettlementType = endConditionToSettlementType(endCondition, context);
      const rawTradeDate = optionize(dateToMoment)(tradeDate, context);
      const rawValueDate = optionize(dateToMoment)(valueDate, context);
      const rawLegs: {
        from: PolymeshPrimitivesIdentityIdPortfolioId;
        to: PolymeshPrimitivesIdentityIdPortfolioId;
        asset: PolymeshPrimitivesTicker;
        amount: Balance;
      }[] = [];
      const rawInstructionMemo = optionize(stringToInstructionMemo)(memo, context);

      await Promise.all(
        legs.map(async ({ from, to, amount, asset }) => {
          const fromId = portfolioLikeToPortfolioId(from);
          const toId = portfolioLikeToPortfolioId(to);

          await Promise.all([
            assertPortfolioExists(fromId, context),
            assertPortfolioExists(toId, context),
          ]);

          const rawFromPortfolio = portfolioIdToMeshPortfolioId(fromId, context);
          const rawToPortfolio = portfolioIdToMeshPortfolioId(toId, context);

          rawLegs.push({
            from: rawFromPortfolio,
            to: rawToPortfolio,
            asset: stringToTicker(asTicker(asset), context),
            amount: bigNumberToBalance(amount, context),
          });
        })
      );

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

  const addAndAffirmTx = settlement.addAndAffirmInstructionWithMemo;
  const addTx = settlement.addInstructionWithMemo;

  const transactions = assembleBatchTransactions([
    {
      transaction: addTx,
      argsArray: addInstructionParams,
    },
    {
      transaction: addAndAffirmTx,
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
