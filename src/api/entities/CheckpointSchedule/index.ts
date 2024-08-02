import BigNumber from 'bignumber.js';

import { Checkpoint, Context, Entity, FungibleAsset, PolymeshError } from '~/internal';
import { ErrorCode, ScheduleDetails } from '~/types';
import {
  assetToMeshAssetId,
  bigNumberToU64,
  momentToDate,
  u64ToBigNumber,
} from '~/utils/conversion';
import { toHumanReadable } from '~/utils/internal';

export interface UniqueIdentifiers {
  id: BigNumber;
  assetId: string;
}

export interface HumanReadable {
  id: string;
  /**
   * @deprecated in favour of `assetId`
   */
  ticker: string;
  assetId: string;
  pendingPoints: string[];
  expiryDate: string | null;
}

export interface Params {
  pendingPoints: Date[];
}

const notExistsMessage = 'Schedule no longer exists. It was either removed or it expired';

/**
 * Represents a Checkpoint Schedule for an Asset. Schedules can be set up to create Checkpoints at regular intervals
 */
export class CheckpointSchedule extends Entity<UniqueIdentifiers, HumanReadable> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id, assetId } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof assetId === 'string';
  }

  /**
   * schedule identifier number
   */
  public id: BigNumber;

  /**
   * Asset for which Checkpoints are scheduled
   */
  public asset: FungibleAsset;

  /**
   * dates in the future where checkpoints are schedule to be created
   */
  public pendingPoints: Date[];

  /**
   * date at which the last Checkpoint will be created with this Schedule.
   */
  public expiryDate: Date;

  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers & Params, context: Context) {
    const { pendingPoints, ...identifiers } = args;

    super(identifiers, context);

    const { id, assetId } = identifiers;

    const sortedPoints = [...pendingPoints].sort((a, b) => a.getTime() - b.getTime());
    this.pendingPoints = sortedPoints;
    this.expiryDate = sortedPoints[sortedPoints.length - 1];
    this.id = id;
    this.asset = new FungibleAsset({ assetId }, context);
  }

  /**
   * Retrieve information specific to this Schedule
   */
  public async details(): Promise<ScheduleDetails> {
    const {
      context: {
        polymeshApi: {
          query: { checkpoint },
        },
      },
      id,
      context,
      asset,
    } = this;

    const rawId = bigNumberToU64(id, context);

    const scheduleOpt = await checkpoint.scheduledCheckpoints(
      assetToMeshAssetId(asset, context),
      rawId
    );

    if (scheduleOpt.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: notExistsMessage,
      });
    }

    const schedule = scheduleOpt.unwrap();
    const points = [...schedule.pending].map(point => momentToDate(point));

    return {
      remainingCheckpoints: new BigNumber(points.length),
      nextCheckpointDate: points[0],
    };
  }

  /**
   * Retrieve all Checkpoints created by this Schedule
   */
  public async getCheckpoints(): Promise<Checkpoint[]> {
    const {
      context: {
        polymeshApi: {
          query: { checkpoint },
        },
      },
      context,
      asset: { id: assetId },
      asset,
      id,
    } = this;

    const exists = await this.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: notExistsMessage,
      });
    }

    const result = await checkpoint.schedulePoints(
      assetToMeshAssetId(asset, context),
      bigNumberToU64(id, context)
    );

    return result.map(rawId => new Checkpoint({ id: u64ToBigNumber(rawId), assetId }, context));
  }

  /**
   * Determine whether this Checkpoint Schedule exists on chain
   */
  public async exists(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { checkpoint },
        },
      },
      context,
      asset,
      id,
    } = this;

    const rawId = bigNumberToU64(id, context);

    const rawSchedule = await checkpoint.scheduledCheckpoints(
      assetToMeshAssetId(asset, context),
      rawId
    );

    return rawSchedule.isSome;
  }

  /**
   * Return the Schedule's static data
   */
  public toHuman(): HumanReadable {
    const { asset, id, pendingPoints } = this;

    return toHumanReadable({
      ticker: asset,
      assetId: asset,
      id,
      pendingPoints,
      expiryDate: pendingPoints[pendingPoints.length - 1],
    });
  }
}
