import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import {
  AffirmationStatus as MeshAffirmationStatus,
  PortfolioId,
  TxTag,
  TxTags,
} from 'polymesh-types/types';

import { assertInstructionValid } from '~/api/procedures/utils';
import { Instruction, PolymeshError, Procedure } from '~/internal';
import { AffirmationStatus, DefaultPortfolio, ErrorCode, Leg, NumberedPortfolio } from '~/types';
import {
  InstructionAffirmationOperation,
  PolymeshTx,
  ProcedureAuthorization,
} from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  meshAffirmationStatusToAffirmationStatus,
  numberToU64,
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolioId,
} from '~/utils/conversion';

export interface ModifyInstructionAffirmationParams {
  id: BigNumber;
  operation: InstructionAffirmationOperation;
}

export interface Storage {
  portfolios: (DefaultPortfolio | NumberedPortfolio)[];
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
    storage: { portfolios },
  } = this;

  const { operation, id } = args;

  const instruction = new Instruction({ id }, context);

  await assertInstructionValid(instruction, context);

  const rawInstructionId = numberToU64(id, context);
  const rawPortfolioIds: PortfolioId[] = portfolios.map((portfolio) =>
    portfolioIdToMeshPortfolioId(portfolioLikeToPortfolioId(portfolio), context)
  );

  const excludeCriteria: AffirmationStatus[] = [];
  let errorMessage: string;
  let transaction: PolymeshTx<[u64, PortfolioId[]]>;

  switch (operation) {
    case InstructionAffirmationOperation.Affirm: {
      excludeCriteria.push(AffirmationStatus.Affirmed);
      errorMessage = 'The Instruction is already affirmed';
      transaction = settlementTx.affirmInstruction;

      break;
    }
    case InstructionAffirmationOperation.Withdraw: {
      excludeCriteria.push(AffirmationStatus.Pending, AffirmationStatus.Rejected);
      errorMessage = 'The instruction is not affirmed';
      transaction = settlementTx.withdrawAffirmation;

      break;
    }
    case InstructionAffirmationOperation.Reject: {
      excludeCriteria.push(AffirmationStatus.Rejected);
      errorMessage = 'The Instruction cannot be rejected';
      transaction = settlementTx.rejectInstruction;

      break;
    }
  }

  const multiArgs = rawPortfolioIds.map((portfolioId) => tuple(portfolioId, rawInstructionId));

  const rawAffirmationStatuses = await settlement.userAffirmations.multi<MeshAffirmationStatus>(
    multiArgs
  );

  const affirmationStatuses = rawAffirmationStatuses.map(meshAffirmationStatusToAffirmationStatus);

  const validPortfolioIds = rawPortfolioIds.filter(
    (_, index) => !excludeCriteria.includes(affirmationStatuses[index])
  );

  if (!validPortfolioIds.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: errorMessage,
    });
  }

  this.addTransaction(transaction, {}, rawInstructionId, validPortfolioIds);

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
    signerPermissions: {
      portfolios,
      transactions,
      tokens: [],
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
  const legs = await instruction.getLegs();

  const portfolios = await P.reduce<Leg, (DefaultPortfolio | NumberedPortfolio)[]>(
    legs,
    async (result, { from, to }) => {
      const [fromIsCustodied, toIsCustodied] = await Promise.all([
        from.isCustodiedBy(),
        to.isCustodiedBy(),
      ]);

      let res = [...result];

      if (fromIsCustodied) {
        res = [...res, from];
      }

      if (toIsCustodied) {
        res = [...res, to];
      }

      return res;
    },
    []
  );

  return { portfolios };
}

/**
 * @hidden
 */
export const modifyInstructionAffirmation = new Procedure(
  prepareModifyInstructionAffirmation,
  getAuthorization
);
