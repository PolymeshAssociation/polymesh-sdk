import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { compact, flatten } from 'lodash';
import { PortfolioId, Ticker, TxTag, TxTags } from 'polymesh-types/types';

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
import { findEventRecord } from '~/utils/internal';

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

/**
 * @hidden
 */
export type Params = AddInstructionParams & {
  venueId: BigNumber;
};

/**
 * @hidden
 */
export interface Storage {
  portfoliosToAffirm: (DefaultPortfolio | NumberedPortfolio)[];
}

/**
 * @hidden
 */
export const createAddInstructionResolver = (context: Context) => (
  receipt: ISubmittableResult
): Instruction => {
  const { data } = findEventRecord(receipt, 'settlement', 'InstructionCreated');
  const id = u64ToBigNumber(data[2]);

  return new Instruction({ id }, context);
};

/**
 * @hidden
 */
export async function prepareAddInstruction(
  this: Procedure<Params, Instruction, Storage>,
  args: Params
): Promise<PostTransactionValue<Instruction>> {
  const {
    context: {
      polymeshApi: {
        tx: { settlement },
      },
    },
    context,
    storage: { portfoliosToAffirm },
  } = this;
  const { legs, venueId, endBlock, tradeDate, valueDate } = args;

  const venue = new Venue({ id: venueId }, context);
  const exists = await venue.exists();

  if (!exists) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The Venue doesn't exist",
    });
  }

  if (!legs.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The legs array can't be empty",
    });
  }

  let endCondition;

  if (endBlock) {
    const latestBlock = await context.getLatestBlock();

    if (endBlock.lte(latestBlock)) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'End block must be a future block',
      });
    }

    endCondition = { type: InstructionType.SettleOnBlock, value: endBlock } as const;
  } else {
    endCondition = { type: InstructionType.SettleOnAffirmation } as const;
  }

  if (tradeDate && valueDate && tradeDate > valueDate) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Value date must be after trade date',
    });
  }

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

  let newInstruction;

  if (portfoliosToAffirm.length) {
    [newInstruction] = this.addTransaction(
      settlement.addAndAffirmInstruction,
      {
        resolvers: [createAddInstructionResolver(context)],
      },
      rawVenueId,
      rawSettlementType,
      rawTradeDate,
      rawValueDate,
      rawLegs,
      portfoliosToAffirm.map(portfolio =>
        portfolioIdToMeshPortfolioId(portfolioLikeToPortfolioId(portfolio), context)
      )
    );
  } else {
    [newInstruction] = this.addTransaction(
      settlement.addInstruction,
      {
        resolvers: [createAddInstructionResolver(context)],
      },
      rawVenueId,
      rawSettlementType,
      rawTradeDate,
      rawValueDate,
      rawLegs
    );
  }

  return newInstruction;
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, Instruction, Storage>,
  { venueId }: Params
): Promise<ProcedureAuthorization> {
  const {
    storage: { portfoliosToAffirm },
  } = this;
  let transactions: TxTag[];

  if (portfoliosToAffirm.length) {
    transactions = [TxTags.settlement.AddAndAffirmInstruction];
  } else {
    transactions = [TxTags.settlement.AddInstruction];
  }

  return {
    identityRoles: [{ type: RoleType.VenueOwner, venueId }],
    signerPermissions: {
      tokens: [],
      portfolios: portfoliosToAffirm,
      transactions,
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, Instruction, Storage>,
  { legs }: Params
): Promise<Storage> {
  const { context } = this;

  const identity = await context.getCurrentIdentity();

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

    return undefined;
  });

  return {
    portfoliosToAffirm: flatten(compact(portfolios)),
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
