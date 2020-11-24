import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { AuthorizationStatus as MeshAuthorizationStatus, PortfolioId } from 'polymesh-types/types';

import { Instruction } from '~/api/entities';
import { assertInstructionValid } from '~/api/procedures/utils';
import { PolymeshError, Procedure } from '~/base';
import { AuthorizationStatus, ErrorCode } from '~/types';
import { InstructionAuthorizationOperation, PolymeshTx } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  meshAuthorizationStatusToAuthorizationStatus,
  numberToU64,
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolioId,
} from '~/utils/conversion';

export interface ModifyInstructionAuthorizationParams {
  id: BigNumber;
  operation: InstructionAuthorizationOperation;
}

/**
 * @hidden
 */
export async function prepareModifyInstructionAuthorization(
  this: Procedure<ModifyInstructionAuthorizationParams, Instruction>,
  args: ModifyInstructionAuthorizationParams
): Promise<Instruction> {
  const {
    context: {
      polymeshApi: {
        tx: { settlement: settlementTx },
        query: { settlement },
      },
    },
    context,
  } = this;

  const { operation, id } = args;

  const instruction = new Instruction({ id }, context);

  await assertInstructionValid(instruction, context);

  const legs = await instruction.getLegs();

  const rawInstructionId = numberToU64(id, context);
  const rawPortfolioIds: PortfolioId[] = [];

  const excludeCriteria: AuthorizationStatus[] = [];
  let errorMessage: string;
  let transaction: PolymeshTx<[u64, PortfolioId[]]>;

  switch (operation) {
    case InstructionAuthorizationOperation.Authorize: {
      excludeCriteria.push(AuthorizationStatus.Authorized);
      errorMessage = 'The Instruction is already authorized';
      transaction = settlementTx.authorizeInstruction;

      break;
    }
    case InstructionAuthorizationOperation.Unauthorize: {
      excludeCriteria.push(AuthorizationStatus.Pending, AuthorizationStatus.Rejected);
      errorMessage = 'The instruction is not authorized';
      transaction = settlementTx.unauthorizeInstruction;

      break;
    }
    case InstructionAuthorizationOperation.Reject: {
      excludeCriteria.push(AuthorizationStatus.Rejected);
      errorMessage = 'The Instruction cannot be rejected';
      transaction = settlementTx.rejectInstruction;

      break;
    }
  }

  await Promise.all([
    P.map(legs, async ({ from, to }) => {
      const [fromId, toId] = await Promise.all([
        portfolioLikeToPortfolioId(from, context),
        portfolioLikeToPortfolioId(to, context),
      ]);

      const [fromIsCustodied, toIsCustodied] = await Promise.all([
        from.isCustodiedBy(),
        to.isCustodiedBy(),
      ]);

      if (fromIsCustodied) {
        rawPortfolioIds.push(portfolioIdToMeshPortfolioId(fromId, context));
      }

      if (toIsCustodied) {
        rawPortfolioIds.push(portfolioIdToMeshPortfolioId(toId, context));
      }
    }),
  ]);

  const multiArgs = rawPortfolioIds.map(portfolioId => tuple(portfolioId, rawInstructionId));

  const rawAuthorizationStatuses = await settlement.userAuths.multi<MeshAuthorizationStatus>(
    multiArgs
  );

  const authorizationStatuses = rawAuthorizationStatuses.map(
    meshAuthorizationStatusToAuthorizationStatus
  );

  const validPortfolioIds = rawPortfolioIds.filter(
    (_, index) => !excludeCriteria.includes(authorizationStatuses[index])
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
export const modifyInstructionAuthorization = new Procedure(prepareModifyInstructionAuthorization);
