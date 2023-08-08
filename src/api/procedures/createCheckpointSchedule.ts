import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import dayjs, { Dayjs } from 'dayjs';

import { Asset, CheckpointSchedule, Context, PolymeshError, Procedure } from '~/internal';
import {
  CalendarPeriod,
  CalendarUnit,
  CreateCheckpointScheduleParams,
  ErrorCode,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  datesToScheduleCheckpoints,
  momentToDate,
  scheduleSpecToMeshScheduleSpec,
  storedScheduleToCheckpointScheduleParams,
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

const calculatePoints = (start: Date, reps: number, period: CalendarPeriod): Date[] => {
  const dates = [start];

  const { unit, amount } = period;

  let nextDay = dayjs(start);
  for (let i = 0; i < reps; i++) {
    nextDay = nextDay.add(amount.toNumber(), unit);

    dates.push(nextDay.toDate());
  }

  return dates;
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
        start: points[0],
        nextCheckpointDate: points[0],
        // Note: we provide a zero value instead of trying to infer
        period: {
          amount: new BigNumber(0),
          unit: CalendarUnit.Second,
        },
        remaining: new BigNumber(points.length),
      },
      context
    );
  };

/**
 * @hidden
 */
export const legacyCreateCheckpointScheduleResolver =
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
): Promise<TransactionSpec<CheckpointSchedule, ExtrinsicParams<'checkpoint', 'createSchedule'>>> {
  const { context } = this;
  const { ticker, start, period, repetitions } = args;

  const now = new Date();
  if (start && start < now) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Schedule start date must be in the future',
    });
  }

  if (context.isV5) {
    const rawTicker = stringToTicker(ticker, context);
    const rawSchedule = scheduleSpecToMeshScheduleSpec({ start, period, repetitions }, context);

    return {
      transaction: context.polymeshApi.tx.checkpoint.createSchedule,
      args: [rawTicker, rawSchedule],
      resolver: legacyCreateCheckpointScheduleResolver(ticker, context),
    };
  } else {
    const startDate = start || new Date();
    const reps = repetitions || new BigNumber(10);

    const points = period ? calculatePoints(startDate, reps.toNumber(), period) : [startDate];

    const rawTicker = stringToTicker(ticker, context);
    const rawSchedule = datesToScheduleCheckpoints(points, context);
    return {
      transaction: context.polymeshApi.tx.checkpoint.createSchedule,
      args: [rawTicker, rawSchedule],
      resolver: createCheckpointScheduleResolver(ticker, context),
    };
  }
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
