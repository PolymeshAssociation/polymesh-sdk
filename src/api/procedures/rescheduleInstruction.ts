import BigNumber from 'bignumber.js';
import { TxTags } from 'polymesh-types/types';

import { Instruction, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, InstructionStatus } from '~/types';
import { numberToU64 } from '~/utils/conversion';

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
): Promise<Instruction> {
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
      code: ErrorCode.ValidationError,
      message: 'Only failed Instructions can be rescheduled',
      data: {
        instructionStatus: status,
      },
    });
  }

  const rawId = numberToU64(id, context);

  this.addTransaction(tx.settlement.rescheduleInstruction, {}, rawId);

  return instruction;
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
