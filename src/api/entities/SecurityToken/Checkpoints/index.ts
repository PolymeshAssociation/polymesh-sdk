import { Moment } from 'polymesh-types/types';

import { Checkpoint, Context, createCheckpoint, Namespace, SecurityToken } from '~/internal';
import { CheckpointWithData, PaginationOptions, ResultSet } from '~/types';
import { ProcedureMethod } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  balanceToBigNumber,
  momentToDate,
  stringToTicker,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod, requestPaginated } from '~/utils/internal';

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
   * Retrieve all Checkpoints created on this Security Token, together with their corresponding creation Date and Total Supply
   *
   * @note supports pagination
   */
  public async get(paginationOpts?: PaginationOptions): Promise<ResultSet<CheckpointWithData>> {
    const {
      parent: { ticker },
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const { entries, lastKey: next } = await requestPaginated(query.checkpoint.totalSupply, {
      arg: rawTicker,
      paginationOpts,
    });

    const checkpoints = entries.map(([{ args: [, id] }, balance]) => ({
      tuple: tuple(id, rawTicker),
      id,
      balance,
    }));

    const timestamps = await query.checkpoint.timestamps.multi<Moment>(
      checkpoints.map(({ tuple: rawTuple }) => rawTuple)
    );

    const data = timestamps.map((moment, i) => {
      const { id, balance } = checkpoints[i];
      return {
        checkpoint: new Checkpoint({ id: u64ToBigNumber(id), ticker }, context),
        totalSupply: balanceToBigNumber(balance),
        createdAt: momentToDate(moment),
      };
    });

    return {
      data,
      next,
    };
  }
}
