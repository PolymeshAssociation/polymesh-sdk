import BigNumber from 'bignumber.js';
import { CheckpointId, Moment, Ticker } from 'polymesh-types/types';

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

    const checkpointsMultiParams: [Ticker, CheckpointId][] = [];
    const checkpoints: { checkpoint: Checkpoint; totalSupply: BigNumber }[] = [];

    entries.forEach(
      ([
        {
          args: [, id],
        },
        balance,
      ]) => {
        checkpointsMultiParams.push(tuple(rawTicker, id));
        checkpoints.push({
          checkpoint: new Checkpoint({ id: u64ToBigNumber(id), ticker }, context),
          totalSupply: balanceToBigNumber(balance),
        });
      }
    );

    const timestamps = await query.checkpoint.timestamps.multi<Moment>(checkpointsMultiParams);

    const data = timestamps.map((moment, i) => {
      const { totalSupply, checkpoint } = checkpoints[i];
      return {
        checkpoint,
        totalSupply,
        createdAt: momentToDate(moment),
      };
    });

    return {
      data,
      next,
    };
  }
}
