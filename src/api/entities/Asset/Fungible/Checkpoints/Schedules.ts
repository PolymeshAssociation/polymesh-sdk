import BigNumber from 'bignumber.js';

import {
  CheckpointSchedule,
  Context,
  createCheckpointSchedule,
  FungibleAsset,
  Namespace,
  PolymeshError,
  removeCheckpointSchedule,
} from '~/internal';
import {
  CreateCheckpointScheduleParams,
  ErrorCode,
  ProcedureMethod,
  RemoveCheckpointScheduleParams,
  ScheduleWithDetails,
} from '~/types';
import { momentToDate, stringToTicker, u64ToBigNumber } from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Asset Checkpoint Schedules related functionality
 */
export class Schedules extends Namespace<FungibleAsset> {
  /**
   * @hidden
   */
  constructor(parent: FungibleAsset, context: Context) {
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
      },
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

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
          pendingPoints: points,
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

  /**
   * Retrieve the maximum allowed Schedule complexity for this Asset
   */
  public async maxComplexity(): Promise<BigNumber> {
    const { context } = this;

    const complexity = await context.polymeshApi.query.checkpoint.schedulesMaxComplexity();

    return u64ToBigNumber(complexity);
  }
}
