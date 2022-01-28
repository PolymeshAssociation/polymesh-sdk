import { ISubmittableResult } from '@polkadot/types/types';

import {
  Asset,
  CheckpointSchedule,
  Context,
  PolymeshError,
  PostTransactionValue,
  Procedure,
} from '~/internal';
import { CalendarPeriod, ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  scheduleSpecToMeshScheduleSpec,
  storedScheduleToCheckpointScheduleParams,
  stringToTicker,
} from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

export interface CreateCheckpointScheduleParams {
  /**
   * The date from which to begin creating snapshots. A null value indicates immediately
   */
  start: Date | null;
  /**
   * The cadence with which to make Checkpoints.
   * @note A null value indicates to create only one Checkpoint, regardless of repetitions specified. This can be used to schedule the creation of a Checkpoint in the future
   */
  period: CalendarPeriod | null;
  /**
   * The number of snapshots to take. A null value indicates snapshots should be made indefinitely
   */
  repetitions: number | null;
}

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

    const scheduleParams = storedScheduleToCheckpointScheduleParams(data[2]);

    return new CheckpointSchedule(
      {
        ticker,
        ...scheduleParams,
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
): Promise<PostTransactionValue<CheckpointSchedule>> {
  const { context } = this;
  const { ticker, start, period, repetitions } = args;

  const now = new Date();
  if (start && start < now) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Schedule start date must be in the future',
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawSchedule = scheduleSpecToMeshScheduleSpec({ start, period, repetitions }, context);

  const [schedule] = this.addTransaction(
    context.polymeshApi.tx.checkpoint.createSchedule,
    { resolvers: [createCheckpointScheduleResolver(ticker, context)] },
    rawTicker,
    rawSchedule
  );

  return schedule;
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
