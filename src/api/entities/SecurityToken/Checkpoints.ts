import { Checkpoint, Context, createCheckpoint, Namespace, SecurityToken } from '~/internal';
import { CheckpointWithCreationDate } from '~/types';
import { ProcedureMethod } from '~/types/internal';
import { momentToDate, stringToTicker, u64ToBigNumber } from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

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
  }

  /**
   * Create a snapshot of Security Token holders and their respective balances at this moment
   *
   * @note required role:
   *   - Security Token Owner
   */
  public create: ProcedureMethod<void, SecurityToken>;

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
    const checkpointsWithCreationDate = entries
      .map(([{ args: [, id] }, timestamp]) => ({
        checkpoint: new Checkpoint({ id: u64ToBigNumber(id), ticker }, context),
        createdAt: momentToDate(timestamp),
      }))
      // the query also returns the next scheduled checkpoint (which hasn't been created yet)
      .filter(({ createdAt }) => createdAt <= now);

    return checkpointsWithCreationDate;
  }
}
