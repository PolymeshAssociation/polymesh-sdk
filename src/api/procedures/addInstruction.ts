import { u64 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { flatten, uniq } from 'lodash';
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
import { filterEventRecords } from '~/utils/internal';

export interface AddInstructionParams {
  legs: {
    amount: BigNumber;
    from: PortfolioLike;
    to: PortfolioLike;
    token: string | SecurityToken;
  }[];
  tradeDate?: Date;
  valueDate?: Date;
  endBlock?: BigNumber;
}

export interface AddInstructionsParams {
  instructions: AddInstructionParams[];
}

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
  portfoliosToAffirm: Array<(DefaultPortfolio | NumberedPortfolio)[]>;
}

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
  const { instructions, venueId } = args;

  const venue = new Venue({ id: venueId }, context);
  const exists = await venue.exists();

  if (!exists) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The Venue doesn't exist",
    });
  }

  const addAndAffirmInstructions: [
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
  ][] = [];
  const addInstruction: [
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
  ][] = [];

  const noLegs: number[] = [];
  const noFutureBlock: number[] = [];
  const noFutureDate: number[] = [];

  await P.each(instructions, async ({ legs, endBlock, tradeDate, valueDate }, i) => {
    if (!legs.length) {
      noLegs.push(i + 1);
    }

    let endCondition;

    if (endBlock) {
      const latestBlock = await context.getLatestBlock();

      if (endBlock.lte(latestBlock)) {
        noFutureBlock.push(i + 1);
      }

      endCondition = { type: InstructionType.SettleOnBlock, value: endBlock } as const;
    } else {
      endCondition = { type: InstructionType.SettleOnAffirmation } as const;
    }

    if (tradeDate && valueDate && tradeDate > valueDate) {
      noFutureDate.push(i + 1);
    }

    if (!noLegs.length && !noFutureBlock.length && !noFutureDate.length) {
      const rawVenueId = numberToU64(venueId, context);
      const rawSettlementType = endConditionToSettlementType(endCondition, context);
      const rawTradeDate = tradeDate ? dateToMoment(tradeDate, context) : null;
      const rawValueDate = valueDate ? dateToMoment(valueDate, context) : null;
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
            asset: stringToTicker(typeof token === 'string' ? token : token.ticker, context),
            amount: numberToBalance(amount, context),
          });
        })
      );

      if (portfoliosToAffirm[i].length) {
        addAndAffirmInstructions.push([
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
        addInstruction.push([rawVenueId, rawSettlementType, rawTradeDate, rawValueDate, rawLegs]);
      }
    }
  });

  if (noLegs.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The legs array can't be empty",
      data: {
        instructionNumber: noLegs,
      },
    });
  }

  if (noFutureBlock.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'End block must be a future block',
      data: {
        instructionNumber: noFutureBlock,
      },
    });
  }

  if (noFutureDate.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Value date must be after trade date',
      data: {
        instructionNumber: noFutureDate,
      },
    });
  }

  let affirmedInstructions: PostTransactionValue<Instruction[]> | undefined;
  let addedInstructions: PostTransactionValue<Instruction[]>;

  if (addAndAffirmInstructions.length) {
    [affirmedInstructions] = this.addBatchTransaction(
      settlement.addAndAffirmInstruction,
      {
        resolvers: [createAddInstructionResolver(context)],
      },
      addAndAffirmInstructions
    );
  }

  if (addInstruction.length) {
    [addedInstructions] = this.addBatchTransaction(
      settlement.addInstruction,
      {
        resolvers: [createAddInstructionResolver(context, affirmedInstructions)],
      },
      addInstruction
    );

    affirmedInstructions = addedInstructions;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return affirmedInstructions!;
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

  const portfolios: (DefaultPortfolio | NumberedPortfolio)[] = [];
  const transactions: SettlementTx[] = [];

  portfoliosToAffirm.forEach(portfoliosList => {
    transactions.push(
      portfoliosList.length
        ? TxTags.settlement.AddAndAffirmInstruction
        : TxTags.settlement.AddInstruction
    );
    portfolios.push(...portfoliosList);
  });

  return {
    identityRoles: [{ type: RoleType.VenueOwner, venueId }],
    signerPermissions: {
      tokens: [],
      portfolios: uniq(portfolios),
      transactions: uniq(transactions),
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

      if (result.length) {
        return result;
      }

      return [];
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
export const addInstruction = new Procedure(
  prepareAddInstruction,
  getAuthorization,
  prepareStorage
);
