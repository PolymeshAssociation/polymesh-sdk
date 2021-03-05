import { CreateCheckpointScheduleParams } from '~/api/procedures/createCheckpointSchedule';
import {
  Checkpoint,
  CheckpointSchedule,
  Context,
  createCheckpoint,
  createCheckpointSchedule,
  Namespace,
  SecurityToken,
} from '~/internal';
import { CheckpointWithCreationDate, PaginationOptions, ResultSet } from '~/types';
import { ProcedureMethod } from '~/types/internal';
import { momentToDate, stringToTicker, u64ToBigNumber } from '~/utils/conversion';
import { createProcedureMethod, requestPaginated } from '~/utils/internal';

/**
 * Handles all Security Token Checkpoints related functionality
 */
export class Checkpoints extends Namespace<SecurityToken> {
  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.create = createProcedureMethod(() => [createCheckpoint, { ticker }], context);
    this.createSchedule = createProcedureMethod(
      args => [createCheckpointSchedule, { ticker, ...args }],
      context
    );
  }

  /**
   * Create a snapshot of Security Token holders and their respective balances at this moment
   *
   * @note required role:
   *   - Security Token Owner
   */
  public create: ProcedureMethod<void, Checkpoint>;

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
  public createSchedule: ProcedureMethod<CreateCheckpointScheduleParams, CheckpointSchedule>;

  /**
   * Retrieve all Checkpoints created on this Security Token, together with their corresponding creation Date
   *
   * @note supports pagination
   */
  public async get(
    paginationOpts?: PaginationOptions
  ): Promise<ResultSet<CheckpointWithCreationDate>> {
    const {
      parent: { ticker },
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const { entries, lastKey: next } = await requestPaginated(
      context.polymeshApi.query.checkpoint.timestamps,
      { paginationOpts, arg: rawTicker }
    );

    const now = new Date();
    const data = entries
      .map(([{ args: [, id] }, timestamp]) => ({
        checkpoint: new Checkpoint({ id: u64ToBigNumber(id), ticker }, context),
        createdAt: momentToDate(timestamp),
      }))
      // the query also returns the next scheduled checkpoint (which hasn't been created yet)
      .filter(({ createdAt }) => createdAt <= now);

    return {
      data,
      next,
    };
  }
}
