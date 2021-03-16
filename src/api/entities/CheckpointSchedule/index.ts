import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';

import { Context, Entity } from '~/internal';
import { CalendarPeriod, ScheduleDetails } from '~/types';
import { momentToDate, stringToTicker, u32ToBigNumber, u64ToBigNumber } from '~/utils/conversion';

export interface UniqueIdentifiers {
  id: BigNumber;
  ticker: string;
}

export interface Params {
  period: CalendarPeriod;
  start: Date;
  remaining: number;
  nextCheckpointDate: Date;
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
   * date at which the last Checkpoint will be created with this Schedule.
   *   A null value means that this Schedule never expires
   */
  public expiryDate: Date | null;

  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers & Params, context: Context) {
    const { period, start, remaining, nextCheckpointDate, ...identifiers } = args;

    super(identifiers, context);

    const { id, ticker } = identifiers;

    const noPeriod = period.amount === 0;

    this.id = id;
    this.ticker = ticker;
    this.period = noPeriod ? null : period;
    this.start = start;

    if (remaining === 0 && !noPeriod) {
      this.expiryDate = null;
    } else if (!this.period) {
      this.expiryDate = start;
    } else {
      const { amount, unit } = period;

      this.expiryDate = dayjs(nextCheckpointDate)
        .add(amount * (remaining - 1), unit)
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
      ticker,
    } = this;

    const rawSchedules = await checkpoint.schedules(stringToTicker(ticker, context));

    const schedule = rawSchedules.find(({ id: scheduleId }) => u64ToBigNumber(scheduleId).eq(id));

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { at, remaining } = schedule!;

    return {
      remainingCheckpoints: u32ToBigNumber(remaining).toNumber(),
      nextCheckpointDate: momentToDate(at),
    };
  }

  /**
   * Retrieve whether the Checkpoint Schedule still exists on chain
   */
  public async exists(): Promise<boolean> {
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

    const rawSchedules = await checkpoint.schedules(stringToTicker(ticker, context));

    const scheduleIds = rawSchedules.map(({ id: scheduleId }) => u64ToBigNumber(scheduleId));

    return scheduleIds.includes(id);
  }
}
