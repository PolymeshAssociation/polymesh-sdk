import BigNumber from 'bignumber.js';

import { assertInstructionValidForUnlocking } from '~/api/procedures/utils';
import { Instruction, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToU64 } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = {
  id: BigNumber;
};

/**
 * @hidden
 */
export async function prepareUnlockInstructionForExecution(
  this: Procedure<Params, Instruction>,
  args: Params
): Promise<TransactionSpec<Instruction, ExtrinsicParams<'settlementTx', 'unlockInstruction'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { settlement: settlementTx },
      },
    },
    context,
  } = this;

  const { id } = args;

  const instruction = new Instruction({ id }, context);

  const [{ did: signerDid }, instructionDetails, mediatorAffirmations] = await Promise.all([
    context.getSigningIdentity(),
    instruction.detailsFromChain(),
    instruction.getMediators(),
  ]);

  assertInstructionValidForUnlocking(instructionDetails);

  const mediatorWithAffirmation = mediatorAffirmations.find(
    ({ identity: { did } }) => did === signerDid
  );

  if (!mediatorWithAffirmation) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Only mediators can unlock instructions for execution',
      data: { signer: signerDid, instructionId: id.toString() },
    });
  }

  if (mediatorWithAffirmation.expiry && mediatorWithAffirmation.expiry < new Date()) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Mediator affirmation has expired',
    });
  }

  const rawInstructionId = bigNumberToU64(id, context);

  return {
    transaction: settlementTx.unlockInstruction,
    resolver: instruction,
    args: [rawInstructionId],
  };
}

/**
 * @hidden
 */
export function getAuthorization(this: Procedure<Params, Instruction>): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.settlement.UnlockInstruction],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const unlockInstructionForExecution = (): Procedure<Params, Instruction> =>
  new Procedure(prepareUnlockInstructionForExecution, getAuthorization);
