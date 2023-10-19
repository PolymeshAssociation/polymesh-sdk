import { u64 } from '@polkadot/types';
import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  Checkpoint,
  Context,
  createCheckpoint,
  FungibleAsset,
  Namespace,
  PolymeshError,
} from '~/internal';
import {
  CheckpointWithData,
  ErrorCode,
  NoArgsProcedureMethod,
  PaginationOptions,
  ResultSet,
} from '~/types';
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
 * Handles all Asset Checkpoints related functionality
 */
export class Checkpoints extends Namespace<FungibleAsset> {
  public schedules: Schedules;

  /**
   * @hidden
   */
  constructor(parent: FungibleAsset, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.create = createProcedureMethod(
      { getProcedureAndArgs: () => [createCheckpoint, { ticker }], voidArgs: true },
      context
    );

    this.schedules = new Schedules(parent, context);
  }

  /**
   * Create a snapshot of Asset Holders and their respective balances at this moment
   */
  public create: NoArgsProcedureMethod<Checkpoint>;

  /**
   * Retrieve a single Checkpoint for this Asset by its ID
   *
   * @throws if there is no Checkpoint with the passed ID
   */
  public async getOne(args: { id: BigNumber }): Promise<Checkpoint> {
    const {
      parent: { ticker },
      context,
    } = this;

    const checkpoint = new Checkpoint({ id: args.id, ticker }, context);

    const exists = await checkpoint.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Checkpoint does not exist',
      });
    }

    return checkpoint;
  }

  /**
   * Retrieve all Checkpoints created on this Asset, together with their corresponding creation Date and Total Supply
   *
   * @note supports pagination
   */
  public async get(paginationOpts?: PaginationOptions): Promise<ResultSet<CheckpointWithData>> {
    const {
      parent: { ticker },
      context,
      context: {
        polymeshApi: {
          query: { checkpoint: checkpointQuery },
        },
      },
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const { entries, lastKey: next } = await requestPaginated(checkpointQuery.totalSupply, {
      arg: rawTicker,
      paginationOpts,
    });

    const checkpointsMultiParams: [PolymeshPrimitivesTicker, u64][] = [];
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

    const timestamps = await checkpointQuery.timestamps.multi(checkpointsMultiParams);

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
