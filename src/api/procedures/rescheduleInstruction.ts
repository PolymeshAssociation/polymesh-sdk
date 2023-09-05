import BigNumber from 'bignumber.js';

import { Instruction, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, InstructionStatus, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import { bigNumberToU64 } from '~/utils/conversion';

/**
 * @hidden
 */
export interface Params {
  id: BigNumber;
}

/**
 * @hidden
 */
export async function prepareRescheduleInstruction(
  this: Procedure<Params, Instruction>,
  args: Params
): Promise<TransactionSpec<Instruction, ExtrinsicParams<'settlement', 'rescheduleInstruction'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { id } = args;

  const instruction = new Instruction({ id }, context);

  const { status } = await instruction.details();

  if (status !== InstructionStatus.Failed) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Only failed Instructions can be rescheduled',
      data: {
        instructionStatus: status,
      },
    });
  }

  const rawId = bigNumberToU64(id, context);

  const transaction = tx.settlement.rescheduleInstruction;

  return {
    transaction,
    args: [rawId],
    resolver: instruction,
  };
}

/**
 * @hidden
 */
export const rescheduleInstruction = (): Procedure<Params, Instruction> =>
  new Procedure(prepareRescheduleInstruction, {
    permissions: {
      transactions: [TxTags.settlement.RescheduleInstruction],
    },
  });
