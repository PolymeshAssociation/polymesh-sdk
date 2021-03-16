import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';

import { Checkpoint, Context, Entity } from '~/internal';
import { CalendarPeriod } from '~/types';
import {
  momentToDate,
  numberToU64,
  stringToTicker,
  u32ToBigNumber,
  u64ToBigNumber,
} from '~/utils/conversion';

export interface UniqueIdentifiers {
  id: BigNumber;
  ticker: string;
}

export interface Params {
  period: CalendarPeriod;
  start: Date;
  remaining: number;
}

/**
 * Represents a Schedule in which Checkpoints are created for a specific
 *  Security Token. Schedules can be set up to create checkpoints
 */
export class CheckpointSchedule extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id, ticker } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof ticker === 'string';
  }

  /**
   * schedule identifier number
   */
  public id: BigNumber;

  /**
   * ticker of the Security Token for which Checkpoints are scheduled
   */
  public ticker: string;

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
   * if true, the Schedule never expires
   */
  public isInfinite: boolean;

  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers & Params, context: Context) {
    const { period, start, remaining, ...identifiers } = args;

    super(identifiers, context);

    const { id, ticker } = identifiers;

    const noPeriod = period.amount === 0;

    this.id = id;
    this.ticker = ticker;
    this.period = noPeriod ? null : period;
    this.start = start;

    /*
      if both remaining and period.amount are 0, remaining is ignored and the Schedule
      is treated as a one-shot
    */
    this.isInfinite = remaining === 0 && !noPeriod;
  }

  /**
   * Retrieve the date at which the last Checkpoint will be created with this Schedule.
   *   A null value means that this Schedule never expires
   */
  public async expiryDate(): Promise<Date | null> {
    const { isInfinite, context, ticker, id, period, start } = this;

    if (isInfinite) {
      return null;
    }

    if (!period) {
      return start;
    }

    const schedules = await context.polymeshApi.query.checkpoint.schedules(
      stringToTicker(ticker, context)
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { remaining: rawRemaining, at } = schedules.find(({ id: scheduleId }) =>
      u64ToBigNumber(scheduleId).eq(id)
    )!;

    const remaining = u32ToBigNumber(rawRemaining).toNumber();
    const nextCheckpointDate = momentToDate(at);

    const { amount, unit } = period;

    return dayjs(nextCheckpointDate)
      .add(amount * (remaining - 1), unit)
      .toDate();
  }

  /**
   * Retrieve all checkpoints created by this schedule
   */
  public async getCheckpoints(): Promise<Checkpoint[]> {
    const {
      context: {
        polymeshApi: {
          query: { checkpoint },
        },
      },
      context,
      ticker,
      id,
    } = this;

    const result = await checkpoint.schedulePoints(
      stringToTicker(ticker, context),
      numberToU64(id, context)
    );

    return result.map(rawId => new Checkpoint({ id: u64ToBigNumber(rawId), ticker }, context));
  }
}
