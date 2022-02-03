import BigNumber from 'bignumber.js';
import P from 'bluebird';

import {
  Asset,
  CheckpointSchedule,
  Context,
  createCheckpointSchedule,
  CreateCheckpointScheduleParams,
  Namespace,
  PolymeshError,
  removeCheckpointSchedule,
  RemoveCheckpointScheduleParams,
} from '~/internal';
import { CalendarPeriod, ErrorCode, ProcedureMethod, ScheduleWithDetails } from '~/types';
import {
  storedScheduleToCheckpointScheduleParams,
  stringToTicker,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod, periodComplexity } from '~/utils/internal';

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
   * Create a schedule for Checkpoint creation (i.e. "Create a checkpoint every week for 5 weeks, starting next tuesday")
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
      },
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const rawSchedules = await checkpoint.schedules(rawTicker);

    return P.map(rawSchedules, async rawSchedule => {
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
  }

  /**
   * Calculate an abstract measure of the complexity of a given Calendar Period
   */
  public complexityOf(period: CalendarPeriod): number {
    return periodComplexity(period);
  }

  /**
   * Calculate the sum of the complexity of all current Checkpoint Schedules for this Asset.
   *   The number cannot exceed the Asset's maximum complexity (obtained via [[maxComplexity]])
   */
  public async currentComplexity(): Promise<number> {
    const schedules = await this.get();

    return schedules.reduce((prev, next) => prev + next.schedule.complexity, 0);
  }

  /**
   * Retrieve the maximum allowed Schedule complexity for this Asset
   */
  public async maxComplexity(): Promise<number> {
    const { context } = this;

    const complexity = await context.polymeshApi.query.checkpoint.schedulesMaxComplexity();

    return u64ToBigNumber(complexity).toNumber();
  }
}
