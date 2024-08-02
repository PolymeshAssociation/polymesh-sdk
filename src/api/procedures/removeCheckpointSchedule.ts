import BigNumber from 'bignumber.js';

import { FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RemoveCheckpointScheduleParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId, bigNumberToU64, u32ToBigNumber } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = RemoveCheckpointScheduleParams & {
  asset: FungibleAsset;
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
  const { asset, schedule } = args;

  const scheduleId = schedule instanceof BigNumber ? schedule : schedule.id;
  const rawAssetId = assetToMeshAssetId(asset, context);

  const rawScheduleId = bigNumberToU64(scheduleId, context);

  const rawSchedule = await query.checkpoint.scheduledCheckpoints(rawAssetId, rawScheduleId);

  if (!rawSchedule.isSome) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Schedule was not found. It may have been removed or expired',
    });
  }

  const scheduleRefCount = await query.checkpoint.scheduleRefCount(rawAssetId, rawScheduleId);
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
    args: [rawAssetId, rawScheduleId],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { asset }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.checkpoint.RemoveSchedule],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removeCheckpointSchedule = (): Procedure<Params, void> =>
  new Procedure(prepareRemoveCheckpointSchedule, getAuthorization);
