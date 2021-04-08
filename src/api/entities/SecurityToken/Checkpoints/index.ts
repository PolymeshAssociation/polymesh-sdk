import { Checkpoint, Context, createCheckpoint, Namespace, SecurityToken } from '~/internal';
import { CheckpointWithCreationDate } from '~/types';
import { ProcedureMethod } from '~/types/internal';
import { momentToDate, stringToTicker, u64ToBigNumber } from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

import { Schedules } from './Schedules';

/**
 * Handles all Security Token Checkpoints related functionality
 */
export class Checkpoints extends Namespace<SecurityToken> {
  public schedules: Schedules;

  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.create = createProcedureMethod(
      { getProcedureAndArgs: () => [createCheckpoint, { ticker }] },
      context
    );

    this.schedules = new Schedules(parent, context);
  }

  /**
   * Create a snapshot of Security Token holders and their respective balances at this moment
   *
   * @note required role:
   *   - Security Token Owner
   */
  public create: ProcedureMethod<void, Checkpoint>;

  /**
   * Retrieve all Checkpoints created on this Security Token, together with their corresponding creation Date
   */
  public async get(): Promise<CheckpointWithCreationDate[]> {
    const {
      parent: { ticker },
      context,
    } = this;

    const entries = await context.polymeshApi.query.checkpoint.timestamps.entries(
      stringToTicker(ticker, context)
    );

    const now = new Date();
    return (
      entries
        .map(([{ args: [, id] }, timestamp]) => ({
          checkpoint: new Checkpoint({ id: u64ToBigNumber(id), ticker }, context),
          createdAt: momentToDate(timestamp),
        }))
        // the query also returns the next scheduled checkpoint for every schedule (which haven't been created yet)
        .filter(({ createdAt }) => createdAt <= now)
    );
  }
}
