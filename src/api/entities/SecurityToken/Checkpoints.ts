import { Checkpoint, Context, createCheckpoint, Namespace, SecurityToken } from '~/internal';
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
      .filter(({ createdAt }) => createdAt <= now);

    return {
      data,
      next,
    };
  }
}
