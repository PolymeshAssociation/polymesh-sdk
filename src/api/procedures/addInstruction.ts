import { u64 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { PortfolioId, Ticker } from 'polymesh-types/types';

import { Instruction, SecurityToken } from '~/api/entities';
import { Context, PolymeshError, PostTransactionValue, Procedure } from '~/base';
import { ErrorCode, InstructionType, PortfolioLike, Role, RoleType } from '~/types';
import {
  dateToMoment,
  endConditionToSettlementType,
  findEventRecord,
  numberToBalance,
  numberToU64,
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolioId,
  stringToTicker,
  u64ToBigNumber,
} from '~/utils';

export interface AddInstructionParams {
  legs: {
    amount: BigNumber;
    from: PortfolioLike;
    to: PortfolioLike;
    token: string | SecurityToken;
  }[];
  validFrom?: Date;
  endBlock?: BigNumber;
}

export type Params = AddInstructionParams & {
  venueId: BigNumber;
};

/**
 * @hidden
 */
export const createAddInstructionResolver = (context: Context) => (
  receipt: ISubmittableResult
): Instruction => {
  const eventRecord = findEventRecord(receipt, 'settlement', 'InstructionCreated');
  const data = eventRecord.event.data;
  const id = u64ToBigNumber(data[2] as u64);

  return new Instruction({ id }, context);
};

/**
 * @hidden
 */
export async function prepareAddInstruction(
  this: Procedure<Params, Instruction>,
  args: Params
): Promise<PostTransactionValue<Instruction>> {
  const {
    context: {
      polymeshApi: {
        tx: { settlement },
      },
    },
    context,
  } = this;
  const { legs, venueId, endBlock, validFrom } = args;

  if (!legs.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The legs array can't be empty",
    });
  }

  let endCondition;
  let did: string;

  if (endBlock) {
    let latestBlock;
    [{ did }, latestBlock] = await Promise.all([
      context.getCurrentIdentity(),
      context.getLatestBlock(),
    ]);

    if (endBlock.lte(latestBlock)) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'End block must be a future block',
      });
    }

    endCondition = { type: InstructionType.SettleOnBlock, value: endBlock } as const;
  } else {
    ({ did } = await context.getCurrentIdentity());

    endCondition = { type: InstructionType.SettleOnAuthorization } as const;
  }

  const rawVenueId = numberToU64(venueId, context);
  const rawSettlementType = endConditionToSettlementType(endCondition, context);
  const rawValidFrom = validFrom ? dateToMoment(validFrom, context) : null;
  const rawLegs: {
    from: PortfolioId;
    to: PortfolioId;
    asset: Ticker;
    amount: Balance;
  }[] = [];
  const rawPortfolios: PortfolioId[] = [];

  await Promise.all(
    legs.map(async ({ from, to, amount, token }) => {
      const { did: fromDid, number: fromNumber } = await portfolioLikeToPortfolioId(from, context);
      const { did: toDid, number: toNumber } = await portfolioLikeToPortfolioId(to, context);
      const fromPortfolio = portfolioIdToMeshPortfolioId(
        { did: fromDid, number: fromNumber },
        context
      );

      if (fromDid === did) {
        rawPortfolios.push(fromPortfolio);
      }

      rawLegs.push({
        from: fromPortfolio,
        to: portfolioIdToMeshPortfolioId({ did: toDid, number: toNumber }, context),
        asset: stringToTicker(typeof token === 'string' ? token : token.ticker, context),
        amount: numberToBalance(amount, context),
      });
    })
  );

  let newInstruction;

  if (rawPortfolios.length) {
    [newInstruction] = this.addTransaction(
      settlement.addAndAuthorizeInstruction,
      {
        resolvers: [createAddInstructionResolver(context)],
      },
      rawVenueId,
      rawSettlementType,
      rawValidFrom,
      rawLegs,
      rawPortfolios
    );
  } else {
    [newInstruction] = this.addTransaction(
      settlement.addInstruction,
      {
        resolvers: [createAddInstructionResolver(context)],
      },
      rawVenueId,
      rawSettlementType,
      rawValidFrom,
      rawLegs
    );
  }

  return newInstruction;
}

/**
 * @hidden
 */
export function getRequiredRoles({ venueId }: Params): Role[] {
  return [{ type: RoleType.VenueOwner, venueId }];
}

/**
 * @hidden
 */
export const addInstruction = new Procedure(prepareAddInstruction, getRequiredRoles);
