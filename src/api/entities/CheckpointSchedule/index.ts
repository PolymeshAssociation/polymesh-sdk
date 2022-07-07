import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';

import { Asset, Checkpoint, Context, Entity, PolymeshError } from '~/internal';
import { CalendarPeriod, CalendarUnit, ErrorCode, ScheduleDetails } from '~/types';
import {
  bigNumberToU64,
  momentToDate,
  stringToTicker,
  u32ToBigNumber,
  u64ToBigNumber,
} from '~/utils/conversion';
import { periodComplexity, toHumanReadable } from '~/utils/internal';

export interface UniqueIdentifiers {
  id: BigNumber;
  ticker: string;
}

export interface CalendarPeriodHumanReadable {
  unit: CalendarUnit;
  amount: string;
}

export interface HumanReadable {
  id: string;
  ticker: string;
  period: CalendarPeriodHumanReadable | null;
  start: string;
  expiryDate: string | null;
  complexity: string;
}

export interface Params {
  period: CalendarPeriod;
  start: Date;
  remaining: BigNumber;
  nextCheckpointDate: Date;
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
    const { id, ticker } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof ticker === 'string';
  }

  /**
   * schedule identifier number
   */
  public id: BigNumber;

  /**
   * Asset for which Checkpoints are scheduled
   */
  public asset: Asset;

  /**
   * how often this Schedule creates a Checkpoint. A null value means this Schedule
   *   creates a single Checkpoint and then expires
   */
  public period: CalendarPeriod | null;

  /**
   * first Checkpoint creation date
   */
  public start: Date;

  /**
   * date at which the last Checkpoint will be created with this Schedule.
   *   A null value means that this Schedule never expires
   */
  public expiryDate: Date | null;

  /**
   * abstract measure of the complexity of this Schedule. Shorter periods translate into more complexity
   */
  public complexity: BigNumber;

  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers & Params, context: Context) {
    const { period, start, remaining, nextCheckpointDate, ...identifiers } = args;

    super(identifiers, context);

    const { id, ticker } = identifiers;

    const noPeriod = period.amount.isZero();

    this.id = id;
    this.asset = new Asset({ ticker }, context);
    this.period = noPeriod ? null : period;
    this.start = start;
    this.complexity = periodComplexity(period);

    if (remaining.isZero() && !noPeriod) {
      this.expiryDate = null;
    } else if (!this.period) {
      this.expiryDate = start;
    } else {
      const { amount, unit } = period;

      this.expiryDate = dayjs(nextCheckpointDate)
        .add(amount.multipliedBy(remaining.minus(1)).toNumber(), unit)
        .toDate();
    }
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
      asset: { ticker },
    } = this;

    const rawSchedules = await checkpoint.schedules(stringToTicker(ticker, context));

    const schedule = rawSchedules.find(({ id: scheduleId }) => u64ToBigNumber(scheduleId).eq(id));

    if (!schedule) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: notExistsMessage,
      });
    }

    const { at, remaining } = schedule;

    return {
      remainingCheckpoints: u32ToBigNumber(remaining),
      nextCheckpointDate: momentToDate(at),
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
      asset: { ticker },
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
      stringToTicker(ticker, context),
      bigNumberToU64(id, context)
    );

    return result.map(rawId => new Checkpoint({ id: u64ToBigNumber(rawId), ticker }, context));
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
      asset: { ticker },
      id,
    } = this;

    const rawSchedules = await checkpoint.schedules(stringToTicker(ticker, context));

    const exists = rawSchedules.find(({ id: scheduleId }) => u64ToBigNumber(scheduleId).eq(id));

    return !!exists;
  }

  /**
   * Return the Schedule's static data
   */
  public toHuman(): HumanReadable {
    const { asset, id, expiryDate, complexity, start, period } = this;

    return toHumanReadable({
      ticker: asset,
      id,
      start,
      expiryDate,
      period,
      complexity,
    });
  }
}
