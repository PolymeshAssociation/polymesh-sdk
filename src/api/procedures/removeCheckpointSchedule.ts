import BigNumber from 'bignumber.js';

import { FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RemoveCheckpointScheduleParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToU64, stringToTicker, u32ToBigNumber } from '~/utils/conversion';

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
): Promise<TransactionSpec<void, ExtrinsicParams<'checkpoint', 'removeSchedule'>>> {
  const {
    context,
    context: {
      polymeshApi: { tx, query },
    },
  } = this;
  const { ticker, schedule } = args;

  const id = schedule instanceof BigNumber ? schedule : schedule.id;
  const rawTicker = stringToTicker(ticker, context);
  const rawId = bigNumberToU64(id, context);

  const rawSchedule = await query.checkpoint.scheduledCheckpoints(rawTicker, rawId);
  const exists = rawSchedule.isSome;

  if (!exists) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Schedule was not found. It may have been removed or expired',
    });
  }

  const rawScheduleId = bigNumberToU64(id, context);

  const scheduleRefCount = await query.checkpoint.scheduleRefCount(rawTicker, rawScheduleId);
  const referenceCount = u32ToBigNumber(scheduleRefCount);

  if (referenceCount.gt(0)) {
    throw new PolymeshError({
      code: ErrorCode.EntityInUse,
      message: 'This Schedule is being referenced by other Entities. It cannot be removed',
      data: {
        referenceCount,
      },
    });
  }

  return {
    transaction: tx.checkpoint.removeSchedule,
    args: [rawTicker, rawScheduleId],
    resolver: undefined,
  };
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
      assets: [new FungibleAsset({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removeCheckpointSchedule = (): Procedure<Params, void> =>
  new Procedure(prepareRemoveCheckpointSchedule, getAuthorization);
