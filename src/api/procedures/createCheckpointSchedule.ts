import { ISubmittableResult } from '@polkadot/types/types';

import { CheckpointSchedule, Context, FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { CreateCheckpointScheduleParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  datesToScheduleCheckpoints,
  momentToDate,
  u64ToBigNumber,
} from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = CreateCheckpointScheduleParams & {
  asset: FungibleAsset;
};

/**
 * @hidden
 */
export const createCheckpointScheduleResolver =
  (assetId: string, context: Context) =>
  (receipt: ISubmittableResult): CheckpointSchedule => {
    const [{ data }] = filterEventRecords(receipt, 'checkpoint', 'ScheduleCreated');
    const rawId = data[2];
    const id = u64ToBigNumber(rawId);

    const rawPoints = data[3];
    const points = [...rawPoints.pending].map(rawPoint => momentToDate(rawPoint));

    return new CheckpointSchedule(
      {
        id,
        assetId,
        pendingPoints: points,
      },
      context
    );
  };

/**
 * @hidden
 */
export async function prepareCreateCheckpointSchedule(
  this: Procedure<Params, CheckpointSchedule>,
  args: Params
): Promise<TransactionSpec<CheckpointSchedule, ExtrinsicParams<'checkpoint', 'createSchedule'>>> {
  const { context } = this;
  const { asset, points } = args;

  const now = new Date();

  const anyInPast = points.some(point => point < now);
  if (anyInPast) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Schedule points must be in the future',
    });
  }

  const rawAssetId = assetToMeshAssetId(asset, context);

  const checkpointSchedule = datesToScheduleCheckpoints(points, context);

  return {
    transaction: context.polymeshApi.tx.checkpoint.createSchedule,
    args: [rawAssetId, checkpointSchedule],
    resolver: createCheckpointScheduleResolver(asset.id, context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, CheckpointSchedule>,
  { asset }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.checkpoint.CreateSchedule],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const createCheckpointSchedule = (): Procedure<Params, CheckpointSchedule> =>
  new Procedure(prepareCreateCheckpointSchedule, getAuthorization);
