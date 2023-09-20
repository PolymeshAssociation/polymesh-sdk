import { ISubmittableResult } from '@polkadot/types/types';

import { Asset, CheckpointSchedule, Context, PolymeshError, Procedure } from '~/internal';
import { CreateCheckpointScheduleParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  datesToScheduleCheckpoints,
  momentToDate,
  stringToTicker,
  u64ToBigNumber,
} from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = CreateCheckpointScheduleParams & {
  ticker: string;
};

/**
 * @hidden
 */
export const createCheckpointScheduleResolver =
  (ticker: string, context: Context) =>
  (receipt: ISubmittableResult): CheckpointSchedule => {
    const [{ data }] = filterEventRecords(receipt, 'checkpoint', 'ScheduleCreated');
    const rawId = data[2];
    const id = u64ToBigNumber(rawId);

    const rawPoints = data[3];
    const points = [...rawPoints.pending].map(rawPoint => momentToDate(rawPoint));

    return new CheckpointSchedule(
      {
        id,
        ticker,
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
  const { ticker, points } = args;

  const now = new Date();

  const anyInPast = points.some(point => point < now);
  if (anyInPast) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Schedule points must be in the future',
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const checkpointSchedule = datesToScheduleCheckpoints(points, context);

  return {
    transaction: context.polymeshApi.tx.checkpoint.createSchedule,
    args: [rawTicker, checkpointSchedule],
    resolver: createCheckpointScheduleResolver(ticker, context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, CheckpointSchedule>,
  { ticker }: Params
): ProcedureAuthorization {
  const { context } = this;
  return {
    permissions: {
      transactions: [TxTags.checkpoint.CreateSchedule],
      assets: [new Asset({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const createCheckpointSchedule = (): Procedure<Params, CheckpointSchedule> =>
  new Procedure(prepareCreateCheckpointSchedule, getAuthorization);
