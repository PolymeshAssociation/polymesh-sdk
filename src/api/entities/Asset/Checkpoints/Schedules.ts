import BigNumber from 'bignumber.js';
import P from 'bluebird';

import {
  Asset,
  CheckpointSchedule,
  Context,
  createCheckpointSchedule,
  Namespace,
  PolymeshError,
  removeCheckpointSchedule,
} from '~/internal';
import {
  CalendarUnit,
  CreateCheckpointScheduleParams,
  ErrorCode,
  ProcedureMethod,
  RemoveCheckpointScheduleParams,
  ScheduleWithDetails,
} from '~/types';
import {
  momentToDate,
  storedScheduleToCheckpointScheduleParams,
  stringToTicker,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Asset Checkpoint Schedules related functionality
 */
export class Schedules extends Namespace<Asset> {
  /**
   * @hidden
   */
  constructor(parent: Asset, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.create = createProcedureMethod(
      { getProcedureAndArgs: args => [createCheckpointSchedule, { ticker, ...args }] },
      context
    );
    this.remove = createProcedureMethod(
      { getProcedureAndArgs: args => [removeCheckpointSchedule, { ticker, ...args }] },
      context
    );
  }

  /**
   * Create a schedule for Checkpoint creation (e.g. "Create a checkpoint every week for 5 weeks, starting next tuesday")
   *
   * @note ⚠️ Chain v6 introduces changes in how checkpoints are created. Only a set amount of points can be specified, infinitely repeating schedules are deprecated
   *
   * @note due to chain limitations, schedules are advanced and (if appropriate) executed whenever the Asset is
   *   redeemed, issued or transferred between portfolios. This means that on an Asset without much movement, there may be disparities between intended Checkpoint creation dates
   *   and the actual date when they are created. This, however, has no effect on the Checkpoint's accuracy regarding to balances
   */
  public create: ProcedureMethod<CreateCheckpointScheduleParams, CheckpointSchedule>;

  /**
   * Remove the supplied Checkpoint Schedule for a given Asset
   */
  public remove: ProcedureMethod<RemoveCheckpointScheduleParams, void>;

  /**
   * Retrieve a single Checkpoint Schedule associated to this Asset by its ID
   *
   * @throws if there is no Schedule with the passed ID
   */
  public async getOne({ id }: { id: BigNumber }): Promise<ScheduleWithDetails> {
    const schedules = await this.get();

    const result = schedules.find(({ schedule }) => schedule.id.eq(id));

    if (!result) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Schedule does not exist',
      });
    }

    return result;
  }

  /**
   * Retrieve all active Checkpoint Schedules
   */
  public async get(): Promise<ScheduleWithDetails[]> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: {
          query: { checkpoint },
        },
        isV5,
      },
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    if (isV5) {
      const rawSchedules = await (checkpoint as any).schedules(rawTicker);

      return P.map(rawSchedules, async (rawSchedule: any) => {
        const scheduleParams = storedScheduleToCheckpointScheduleParams(rawSchedule);
        const schedule = new CheckpointSchedule({ ...scheduleParams, ticker }, context);

        const { remaining: remainingCheckpoints, nextCheckpointDate } = scheduleParams;
        return {
          schedule,
          details: {
            remainingCheckpoints,
            nextCheckpointDate,
          },
        };
      });
    } else {
      const rawSchedulesEntries = await checkpoint.scheduledCheckpoints.entries(rawTicker);

      return rawSchedulesEntries.map(([key, rawScheduleOpt]) => {
        const rawSchedule = rawScheduleOpt.unwrap();
        const rawId = key.args[1];
        const id = u64ToBigNumber(rawId);
        const points = [...rawSchedule.pending].map(rawPoint => momentToDate(rawPoint));
        const schedule = new CheckpointSchedule(
          {
            ticker,
            id,
            start: points[0],
            nextCheckpointDate: points[0],
            remaining: new BigNumber(points.length),
            // Note: We put in a zero value instead of trying to infer a proper period
            period: {
              amount: new BigNumber(0),
              unit: CalendarUnit.Second,
            },
          },
          context
        );

        const remainingCheckpoints = new BigNumber([...rawSchedule.pending].length);
        return {
          schedule,
          details: {
            remainingCheckpoints,
            nextCheckpointDate: points[0],
          },
        };
      });
    }
  }

  /**
   * Retrieve the maximum allowed Schedule complexity for this Asset
   */
  public async maxComplexity(): Promise<BigNumber> {
    const { context } = this;

    const complexity = await context.polymeshApi.query.checkpoint.schedulesMaxComplexity();

    return u64ToBigNumber(complexity);
  }
}
