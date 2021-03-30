import { ISubmittableResult } from '@polkadot/types/types';

import {
  CheckpointSchedule,
  Context,
  PolymeshError,
  PostTransactionValue,
  Procedure,
  SecurityToken,
} from '~/internal';
import { CalendarPeriod, ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  scheduleSpecToMeshScheduleSpec,
  storedScheduleToCheckpointScheduleParams,
  stringToTicker,
} from '~/utils/conversion';
import { findEventRecord } from '~/utils/internal';

export interface CreateCheckpointScheduleParams {
  start: Date | null;
  period: CalendarPeriod | null;
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
export const createCheckpointScheduleResolver = (ticker: string, context: Context) => (
  receipt: ISubmittableResult
): CheckpointSchedule => {
  const { data } = findEventRecord(receipt, 'checkpoint', 'ScheduleCreated');

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
    identityRoles: [{ type: RoleType.TokenOwner, ticker }],
    signerPermissions: {
      transactions: [TxTags.checkpoint.CreateSchedule],
      tokens: [new SecurityToken({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const createCheckpointSchedule = new Procedure(
  prepareCreateCheckpointSchedule,
  getAuthorization
);
