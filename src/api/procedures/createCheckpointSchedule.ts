import { ISubmittableResult } from '@polkadot/types/types';

import {
  Asset,
  CheckpointSchedule,
  Context,
  PolymeshError,
  PostTransactionValue,
  Procedure,
} from '~/internal';
import { CreateCheckpointScheduleParams, ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  scheduleSpecToMeshScheduleSpec,
  storedScheduleToCheckpointScheduleParams,
  stringToTicker,
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

  const [schedule] = this.addTransaction({
    transaction: context.polymeshApi.tx.checkpoint.createSchedule,
    resolvers: [createCheckpointScheduleResolver(ticker, context)],
    args: [rawTicker, rawSchedule],
  });

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
