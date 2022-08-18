import { u32, u64 } from '@polkadot/types';
import { PolymeshPrimitivesIdentityIdPortfolioId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import P from 'bluebird';

import { assertInstructionValid } from '~/api/procedures/utils';
import { Instruction, PolymeshError, Procedure } from '~/internal';
import {
  AffirmationStatus,
  DefaultPortfolio,
  ErrorCode,
  InstructionAffirmationOperation,
  Leg,
  ModifyInstructionAffirmationParams,
  NumberedPortfolio,
  TxTag,
  TxTags,
} from '~/types';
import { PolymeshTx, ProcedureAuthorization } from '~/types/internal';
import { QueryReturnType, tuple } from '~/types/utils';
import {
  bigNumberToU32,
  bigNumberToU64,
  meshAffirmationStatusToAffirmationStatus,
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolioId,
} from '~/utils/conversion';

export interface Storage {
  portfolios: (DefaultPortfolio | NumberedPortfolio)[];
  senderLegAmount: BigNumber;
  totalLegAmount: BigNumber;
}

/**
 * @hidden
 */
export async function prepareModifyInstructionAffirmation(
  this: Procedure<ModifyInstructionAffirmationParams, Instruction, Storage>,
  args: ModifyInstructionAffirmationParams
): Promise<Instruction> {
  const {
    context: {
      polymeshApi: {
        tx: { settlement: settlementTx },
        query: { settlement },
      },
    },
    context,
    storage: { portfolios, senderLegAmount, totalLegAmount },
  } = this;

  const { operation, id } = args;

  const instruction = new Instruction({ id }, context);

  await assertInstructionValid(instruction, context);

  if (!portfolios.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The signing Identity is not involved in this Instruction',
    });
  }

  const rawInstructionId = bigNumberToU64(id, context);
  const rawPortfolioIds: PolymeshPrimitivesIdentityIdPortfolioId[] = portfolios.map(portfolio =>
    portfolioIdToMeshPortfolioId(portfolioLikeToPortfolioId(portfolio), context)
  );

  const excludeCriteria: AffirmationStatus[] = [];
  let errorMessage: string;
  let transaction: PolymeshTx<[u64, PolymeshPrimitivesIdentityIdPortfolioId[], u32]> | null = null;

  switch (operation) {
    case InstructionAffirmationOperation.Affirm: {
      excludeCriteria.push(AffirmationStatus.Affirmed);
      errorMessage = 'The Instruction is already affirmed';
      transaction = settlementTx.affirmInstruction;

      break;
    }
    case InstructionAffirmationOperation.Withdraw: {
      excludeCriteria.push(AffirmationStatus.Pending);
      errorMessage = 'The instruction is not affirmed';
      transaction = settlementTx.withdrawAffirmation;

      break;
    }
  }

  const multiArgs = rawPortfolioIds.map(portfolioId => tuple(portfolioId, rawInstructionId));

  const rawAffirmationStatuses = await settlement.userAffirmations.multi<
    QueryReturnType<typeof settlement.userAffirmations>
  >(multiArgs);

  const affirmationStatuses = rawAffirmationStatuses.map(meshAffirmationStatusToAffirmationStatus);

  const validPortfolioIds = rawPortfolioIds.filter(
    (_, index) => !excludeCriteria.includes(affirmationStatuses[index])
  );

  if (!validPortfolioIds.length) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      // As InstructionAffirmationOperation.Reject has no excludeCriteria, if this error is thrown
      // it means that the operation had to be either affirm or withdraw, and so the errorMessage was set
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      message: errorMessage!,
    });
  }

  // rejection works a bit different
  if (transaction) {
    this.addTransaction({
      transaction,
      feeMultiplier: senderLegAmount,
      args: [rawInstructionId, validPortfolioIds, bigNumberToU32(senderLegAmount, context)],
    });
  } else {
    this.addTransaction({
      transaction: settlementTx.rejectInstruction,
      feeMultiplier: totalLegAmount,
      args: [rawInstructionId, validPortfolioIds[0], bigNumberToU32(totalLegAmount, context)],
    });
  }

  return instruction;
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<ModifyInstructionAffirmationParams, Instruction, Storage>,
  { operation }: ModifyInstructionAffirmationParams
): Promise<ProcedureAuthorization> {
  const {
    storage: { portfolios },
  } = this;

  let transactions: TxTag[];

  switch (operation) {
    case InstructionAffirmationOperation.Affirm: {
      transactions = [TxTags.settlement.AffirmInstruction];

      break;
    }
    case InstructionAffirmationOperation.Withdraw: {
      transactions = [TxTags.settlement.WithdrawAffirmation];

      break;
    }
    case InstructionAffirmationOperation.Reject: {
      transactions = [TxTags.settlement.RejectInstruction];

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
export async function prepareStorage(
  this: Procedure<ModifyInstructionAffirmationParams, Instruction, Storage>,
  { id }: ModifyInstructionAffirmationParams
): Promise<Storage> {
  const { context } = this;
  const instruction = new Instruction({ id }, context);
  const [{ data: legs }, { did }] = await Promise.all([
    instruction.getLegs(),
    context.getSigningIdentity(),
  ]);

  const [portfolios, senderLegAmount] = await P.reduce<
    Leg,
    [(DefaultPortfolio | NumberedPortfolio)[], BigNumber]
  >(
    legs,
    async (result, { from, to }) => {
      const [fromIsCustodied, toIsCustodied] = await Promise.all([
        from.isCustodiedBy({ identity: did }),
        to.isCustodiedBy({ identity: did }),
      ]);

      const [custodiedPortfolios, amount] = result;

      let res = [...custodiedPortfolios];
      let legAmount = amount;

      if (fromIsCustodied) {
        res = [...res, from];
        legAmount = legAmount.plus(1);
      }

      if (toIsCustodied) {
        res = [...res, to];
      }

      return tuple(res, legAmount);
    },
    [[], new BigNumber(0)]
  );

  return { portfolios, senderLegAmount, totalLegAmount: new BigNumber(legs.length) };
}

/**
 * @hidden
 */
export const modifyInstructionAffirmation = (): Procedure<
  ModifyInstructionAffirmationParams,
  Instruction,
  Storage
> => new Procedure(prepareModifyInstructionAffirmation, getAuthorization, prepareStorage);
