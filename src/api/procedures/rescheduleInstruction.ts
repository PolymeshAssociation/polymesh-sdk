import BigNumber from 'bignumber.js';
import { TxTags } from 'polymesh-types/types';

import { Instruction, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, InstructionDetails, InstructionStatus, RoleType } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
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
export interface Storage {
  instructionDetails: InstructionDetails;
  instruction: Instruction;
}

/**
 * @hidden
 */
export async function prepareRescheduleInstruction(
  this: Procedure<Params, Instruction, Storage>,
  args: Params
): Promise<Instruction> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: {
      instructionDetails: { status },
      instruction,
    },
  } = this;
  const { id } = args;

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
export function getAuthorization(
  this: Procedure<Params, Instruction, Storage>
): ProcedureAuthorization {
  const {
    storage: {
      instructionDetails: {
        venue: { id },
      },
    },
  } = this;

  return {
    roles: [{ type: RoleType.VenueOwner, venueId: id }],
    permissions: {
      transactions: [TxTags.settlement.RescheduleInstruction],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, Instruction, Storage>,
  { id }: Params
): Promise<Storage> {
  const { context } = this;
  const instruction = new Instruction({ id }, context);
  const instructionDetails = await instruction.details();

  return {
    instruction,
    instructionDetails,
  };
}

/**
 * @hidden
 */
export const rescheduleInstruction = (): Procedure<Params, Instruction, Storage> =>
  new Procedure(prepareRescheduleInstruction, getAuthorization);
