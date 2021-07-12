import BigNumber from 'bignumber.js';

import { CheckpointSchedule, PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { numberToU64, stringToTicker, u32ToBigNumber, u64ToBigNumber } from '~/utils/conversion';

export interface RemoveCheckpointScheduleParams {
  /**
   * schedule (or ID) of the schedule to be removed
   */
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

  const id = schedule instanceof BigNumber ? schedule : schedule.id;
  const rawTicker = stringToTicker(ticker, context);

  const rawSchedules = await query.checkpoint.schedules(rawTicker);
  const exists = rawSchedules.find(({ id: scheduleId }) => u64ToBigNumber(scheduleId).eq(id));

  if (!exists) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Schedule no longer exists. It was either removed or it expired',
    });
  }

  const rawScheduleId = numberToU64(id, context);

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
    permissions: {
      transactions: [TxTags.checkpoint.RemoveSchedule],
      tokens: [new SecurityToken({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removeCheckpointSchedule = (): Procedure<Params, void> =>
  new Procedure(prepareRemoveCheckpointSchedule, getAuthorization);
