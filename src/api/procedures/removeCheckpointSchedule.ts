import BigNumber from 'bignumber.js';

import { CheckpointSchedule, PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { numberToU64, stringToTicker, u32ToBigNumber } from '~/utils/conversion';

export interface RemoveCheckpointScheduleParams {
  schedule: CheckpointSchedule | BigNumber;
}

/**
 * @hidden
 */
export type Params = RemoveCheckpointScheduleParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareRemoveCheckpointSchedule(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context,
    context: {
      polymeshApi: { tx, query },
    },
  } = this;
  const { ticker, schedule } = args;

  const rawTicker = stringToTicker(ticker, context);

  const rawScheduleId = numberToU64(
    schedule instanceof BigNumber ? schedule : schedule.id,
    context
  );

  const scheduleRefCount = await query.checkpoint.scheduleRefCount(rawTicker, rawScheduleId);

  if (u32ToBigNumber(scheduleRefCount).gt(0)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You cannot remove this Schedule',
    });
  }

  this.addTransaction(tx.checkpoint.removeSchedule, {}, rawTicker, rawScheduleId);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker }: Params
): ProcedureAuthorization {
  const { context } = this;
  return {
    identityRoles: [{ type: RoleType.TokenOwner, ticker }],
    signerPermissions: {
      transactions: [TxTags.checkpoint.RemoveSchedule],
      tokens: [new SecurityToken({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removeCheckpointSchedule = new Procedure(
  prepareRemoveCheckpointSchedule,
  getAuthorization
);
