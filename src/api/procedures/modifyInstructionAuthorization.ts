import BigNumber from 'bignumber.js';

import { Instruction } from '~/api/entities';
import { checkInstructionValidation } from '~/api/procedures/utils';
import { PolymeshError, Procedure } from '~/base';
import { AuthorizationStatus, ErrorCode, InstructionAuthorizationOperation } from '~/types';
import {
  meshAuthorizationStatusToAuthorizationStatus,
  numberToU64,
  portfolioIdToMeshPortfolioId,
} from '~/utils';

export interface ModifyInstructionAuthorizationParams {
  operation: InstructionAuthorizationOperation;
}

/**
 * @hidden
 */
export type Params = ModifyInstructionAuthorizationParams & {
  id: BigNumber;
};

/**
 * @hidden
 */
export async function prepareModifyInstructionAuthorization(
  this: Procedure<Params, Instruction | void>,
  args: Params
): Promise<Instruction | void> {
  const {
    context: {
      polymeshApi: {
        tx,
        query: { settlement },
      },
    },
    context,
  } = this;

  const { operation, id } = args;

  const instruction = new Instruction({ id }, context);

  checkInstructionValidation(instruction, context);

  const currentIdentity = await context.getCurrentIdentity();
  const rawInstructionId = numberToU64(id, context);
  const rawPortfolioId = portfolioIdToMeshPortfolioId({ did: currentIdentity.did }, context);
  const rawAuthorizationStatus = await settlement.userAuths(rawPortfolioId, rawInstructionId);
  const authorizationStatus = meshAuthorizationStatusToAuthorizationStatus(rawAuthorizationStatus);

  switch (operation) {
    case InstructionAuthorizationOperation.Authorize: {
      if (authorizationStatus === AuthorizationStatus.Authorized) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'The Instruction is already authorized',
        });
      }

      this.addTransaction(tx.settlement.authorizeInstruction, {}, rawInstructionId, [
        rawPortfolioId,
      ]);

      return instruction;
    }
    case InstructionAuthorizationOperation.Unauthorize: {
      if (authorizationStatus === AuthorizationStatus.Pending) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'The Instruction is unauthorize',
        });
      }

      this.addTransaction(tx.settlement.unauthorizeInstruction, {}, rawInstructionId, [
        rawPortfolioId,
      ]);

      return instruction;
    }
    case InstructionAuthorizationOperation.Reject: {
      if (authorizationStatus === AuthorizationStatus.Rejected) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'The instruction cannot be rejected',
        });
      }

      this.addTransaction(tx.settlement.rejectInstruction, {}, rawInstructionId, [rawPortfolioId]);
    }
  }
}

/**
 * @hidden
 */
export const modifyInstructionAuthorization = new Procedure(prepareModifyInstructionAuthorization);
