import P from 'bluebird';

import {
  CheckpointSchedule,
  Context,
  createCheckpointSchedule,
  CreateCheckpointScheduleParams,
  Namespace,
  removeCheckpointSchedule,
  RemoveCheckpointScheduleParams,
  SecurityToken,
} from '~/internal';
import { CalendarPeriod, ProcedureMethod, ScheduleWithDetails } from '~/types';
import {
  storedScheduleToCheckpointScheduleParams,
  stringToTicker,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod, periodComplexity } from '~/utils/internal';

/**
 * Handles all Security Token Checkpoint Schedules related functionality
 */
export class Schedules extends Namespace<SecurityToken> {
  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
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
   * @note due to chain limitations, schedules are advanced and (if appropriate) executed whenever the Security Token is
   *   redeemed, issued or transferred between portfolios. This means that on a Security Token without much movement, there may be disparities between intended Checkpoint creation dates
   *   and the actual date when they are created. This, however, has no effect on the Checkpoint's accuracy regarding to balances
   *
   * @note required role:
   *   - Security Token Owner
   */
  public create: ProcedureMethod<CreateCheckpointScheduleParams, CheckpointSchedule>;

  /**
   * Remove the supplied Checkpoint Schedule for a given Security Token
   *
   * @note required role:
   *   - Security Token Owner
   */
  public remove: ProcedureMethod<RemoveCheckpointScheduleParams, void>;

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
   * Calculate the sum of the complexity of all current Checkpoint Schedules for this Security Token.
   *   The number cannot exceed the Token's maximum complexity (obtained via [[maxComplexity]])
   */
  public async currentComplexity(): Promise<number> {
    const schedules = await this.get();

    return schedules.reduce((prev, next) => prev + next.schedule.complexity, 0);
  }

  /**
   * Retrieve the maximum allowed Schedule complexity for this Security Token
   */
  public async maxComplexity(): Promise<number> {
    const { context } = this;

    const complexity = await context.polymeshApi.query.checkpoint.schedulesMaxComplexity();

    return u64ToBigNumber(complexity).toNumber();
  }
}
