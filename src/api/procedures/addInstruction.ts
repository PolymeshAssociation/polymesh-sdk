import { u64 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { flatten, isEqual, union, unionWith } from 'lodash';
import {
  Moment,
  PortfolioId,
  SettlementTx,
  SettlementType,
  Ticker,
  TxTags,
} from 'polymesh-types/types';

import { assertPortfolioExists } from '~/api/procedures/utils';
import {
  Context,
  DefaultPortfolio,
  Instruction,
  NumberedPortfolio,
  PolymeshError,
  PostTransactionValue,
  Procedure,
  SecurityToken,
  Venue,
} from '~/internal';
import { ErrorCode, InstructionType, PortfolioLike, RoleType } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { tuple } from '~/types/utils';
import { MAX_LEGS_LENGTH } from '~/utils/constants';
import {
  dateToMoment,
  endConditionToSettlementType,
  numberToBalance,
  numberToU64,
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolio,
  portfolioLikeToPortfolioId,
  stringToTicker,
  u64ToBigNumber,
} from '~/utils/conversion';
import {
  assembleBatchTransactions,
  filterEventRecords,
  getTicker,
  optionize,
} from '~/utils/internal';

export interface AddInstructionParams {
  /**
   * array of token movements (amount, from, to, token)
   */
  legs: {
    amount: BigNumber;
    from: PortfolioLike;
    to: PortfolioLike;
    token: string | SecurityToken;
  }[];
  /**
   * date at which the trade was agreed upon (optional, for offchain trades)
   */
  tradeDate?: Date;
  /**
   * date at which the trade was executed (optional, for offchain trades)
   */
  valueDate?: Date;
  /**
   * block at which the Instruction will be executed automatically (optional, the Instruction will be executed when all participants have authorized it if not supplied)
   */
  endBlock?: BigNumber;
}

export interface AddInstructionsParams {
  /**
   * array of Instructions to be added in the Venue
   */
  instructions: AddInstructionParams[];
}

/**
 * @hidden
 */
export type Params = AddInstructionsParams & {
  venue: Venue;
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
  SettlementType,
  Moment | null,
  Moment | null,
  {
    from: PortfolioId;
    to: PortfolioId;
    asset: Ticker;
    amount: Balance;
  }[],
  PortfolioId[]
][];

/**
 * @hidden
 */
type InternalAddInstructionParams = [
  u64,
  SettlementType,
  Moment | null,
  Moment | null,
  {
    from: PortfolioId;
    to: PortfolioId;
    asset: Ticker;
    amount: Balance;
  }[]
][];

/**
 * @hidden
 */
export const createAddInstructionResolver = (
  context: Context,
  previousInstructions?: PostTransactionValue<Instruction[]>
) => (receipt: ISubmittableResult): Instruction[] => {
  const events = filterEventRecords(receipt, 'settlement', 'InstructionCreated');

  const result = events.map(
    ({ data }) => new Instruction({ id: u64ToBigNumber(data[2]) }, context)
  );

  if (previousInstructions) {
    return previousInstructions.value.concat(result);
  }

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
  const endBlockErrIndexes: number[] = [];
  /**
   * array of indexes of Instructions where the value date is before the trade date
   */
  const datesErrIndexes: number[] = [];

  await P.each(instructions, async ({ legs, endBlock, tradeDate, valueDate }, i) => {
    if (!legs.length) {
      legEmptyErrIndexes.push(i);
    }

    if (legs.length > MAX_LEGS_LENGTH) {
      legLengthErrIndexes.push(i);
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
      !endBlockErrIndexes.length &&
      !datesErrIndexes.length
    ) {
      const rawVenueId = numberToU64(venueId, context);
      const rawSettlementType = endConditionToSettlementType(endCondition, context);
      const rawTradeDate = optionize(dateToMoment)(tradeDate, context);
      const rawValueDate = optionize(dateToMoment)(valueDate, context);
      const rawLegs: {
        from: PortfolioId;
        to: PortfolioId;
        asset: Ticker;
        amount: Balance;
      }[] = [];

      await Promise.all(
        legs.map(async ({ from, to, amount, token }) => {
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
            asset: stringToTicker(getTicker(token), context),
            amount: numberToBalance(amount, context),
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
        ]);
      } else {
        addInstructionParams.push([
          rawVenueId,
          rawSettlementType,
          rawTradeDate,
          rawValueDate,
          rawLegs,
        ]);
      }
    }
  });

  return {
    errIndexes: {
      legEmptyErrIndexes,
      legLengthErrIndexes,
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
): Promise<PostTransactionValue<Instruction[]>> {
  const {
    context: {
      polymeshApi: {
        tx: { settlement },
      },
    },
    context,
    storage: { portfoliosToAffirm },
  } = this;
  const {
    instructions,
    venue: { id: venueId },
  } = args;

  const latestBlock = await context.getLatestBlock();

  if (!instructions.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Instructions array cannot be empty',
    });
  }

  const {
    errIndexes: { legEmptyErrIndexes, legLengthErrIndexes, endBlockErrIndexes, datesErrIndexes },
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

  const addAndAffirmTx = settlement.addAndAffirmInstruction;
  const addTx = settlement.addInstruction;

  const transactions = assembleBatchTransactions(
    tuple(
      {
        transaction: addTx,
        argsArray: addInstructionParams,
      },
      {
        transaction: addAndAffirmTx,
        argsArray: addAndAffirmInstructionParams,
      }
    )
  );

  const [resultInstructions] = this.addBatchTransaction({
    transactions,
    resolvers: [createAddInstructionResolver(context)],
  });

  return resultInstructions;
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, Instruction[], Storage>,
  { venue: { id: venueId } }: Params
): Promise<ProcedureAuthorization> {
  const {
    storage: { portfoliosToAffirm },
  } = this;

  let transactions: SettlementTx[] = [];
  let portfolios: (DefaultPortfolio | NumberedPortfolio)[] = [];

  portfoliosToAffirm.forEach(portfoliosList => {
    transactions = union(transactions, [
      portfoliosList.length
        ? TxTags.settlement.AddAndAffirmInstruction
        : TxTags.settlement.AddInstruction,
    ]);
    portfolios = unionWith(portfolios, portfoliosList, isEqual);
  });

  return {
    roles: [{ type: RoleType.VenueOwner, venueId }],
    permissions: {
      tokens: [],
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

  const identity = await context.getCurrentIdentity();

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
