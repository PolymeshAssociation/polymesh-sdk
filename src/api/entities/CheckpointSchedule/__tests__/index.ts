import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { CheckpointSchedule, Context, Entity } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { CalendarPeriod, CalendarUnit } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('CheckpointSchedule class', () => {
  let context: Context;

  let id: BigNumber;
  let ticker: string;
  let period: CalendarPeriod;
  let start: Date;
  let remaining: BigNumber;
  let nextCheckpointDate: Date;
  let stringToTickerSpy: jest.SpyInstance;
  let bigNumberToU64Spy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();

    id = new BigNumber(1);
    ticker = 'SOME_TICKER';
    period = {
      unit: CalendarUnit.Month,
      amount: new BigNumber(1),
    };
    start = new Date('10/14/1987 UTC');
    remaining = new BigNumber(11);
    nextCheckpointDate = new Date(new Date().getTime() + 60 * 60 * 1000 * 24 * 365 * 60);
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should extend Entity', () => {
    expect(CheckpointSchedule.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    it('should assign ticker and id to instance', () => {
      let schedule = new CheckpointSchedule(
        { id, ticker, start, period, remaining: new BigNumber(0), nextCheckpointDate },
        context
      );

      expect(schedule.asset.ticker).toBe(ticker);
      expect(schedule.id).toEqual(id);
      expect(schedule.period).toEqual(period);
      expect(schedule.start).toEqual(start);
      expect(schedule.expiryDate).toBeNull();

      schedule = new CheckpointSchedule(
        {
          id,
          ticker,
          start,
          period: { unit: CalendarUnit.Month, amount: new BigNumber(0) },
          remaining,
          nextCheckpointDate,
        },
        context
      );

      expect(schedule.asset.ticker).toBe(ticker);
      expect(schedule.id).toEqual(id);
      expect(schedule.period).toEqual(null);
      expect(schedule.start).toEqual(start);
      expect(schedule.expiryDate).toEqual(start);

      schedule = new CheckpointSchedule(
        {
          id,
          ticker,
          start,
          period: { unit: CalendarUnit.Year, amount: new BigNumber(1) },
          remaining: new BigNumber(2),
          nextCheckpointDate: start,
        },
        context
      );

      expect(schedule.expiryDate).toEqual(new Date('10/14/1988 UTC'));
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(
        CheckpointSchedule.isUniqueIdentifiers({ id: new BigNumber(1), ticker: 'symbol' })
      ).toBe(true);
      expect(CheckpointSchedule.isUniqueIdentifiers({})).toBe(false);
      expect(CheckpointSchedule.isUniqueIdentifiers({ id: new BigNumber(1) })).toBe(false);
      expect(CheckpointSchedule.isUniqueIdentifiers({ id: 'id' })).toBe(false);
    });
  });

  describe('method: details', () => {
    it('should throw an error if Schedule does not exists', async () => {
      const checkpointSchedule = new CheckpointSchedule(
        { id: new BigNumber(2), ticker, period, start, remaining, nextCheckpointDate },
        context
      );
      const rawScheduleId = dsMockUtils.createMockU64(id);

      stringToTickerSpy.mockReturnValue(dsMockUtils.createMockTicker(ticker));

      dsMockUtils.createQueryMock('checkpoint', 'schedules', {
        returnValue: [
          dsMockUtils.createMockStoredSchedule({
            id: rawScheduleId,
          } as any),
        ],
      });

      let error;

      try {
        await checkpointSchedule.details();
      } catch (err) {
        error = err;
      }

      expect(error.message).toBe('Schedule no longer exists. It was either removed or it expired');
    });

    it('should return the Schedule details ', async () => {
      const rawRemaining = new BigNumber(2);
      const checkpointSchedule = new CheckpointSchedule(
        { id, ticker, period, start, remaining, nextCheckpointDate },
        context
      );
      const rawScheduleId = dsMockUtils.createMockU64(id);

      stringToTickerSpy.mockReturnValue(dsMockUtils.createMockTicker(ticker));
      jest.spyOn(utilsConversionModule, 'u32ToBigNumber').mockClear().mockReturnValue(rawRemaining);
      jest.spyOn(utilsConversionModule, 'momentToDate').mockReturnValue(nextCheckpointDate);

      dsMockUtils.createQueryMock('checkpoint', 'schedules', {
        returnValue: [
          dsMockUtils.createMockStoredSchedule({
            schedule: dsMockUtils.createMockCheckpointSchedule({
              start: dsMockUtils.createMockMoment(new BigNumber(start.getTime())),
              period: dsMockUtils.createMockCalendarPeriod({
                unit: dsMockUtils.createMockCalendarUnit('Month'),
                amount: dsMockUtils.createMockU64(new BigNumber(1)),
              }),
            }),
            id: rawScheduleId,
            at: dsMockUtils.createMockMoment(new BigNumber(nextCheckpointDate.getTime())),
            remaining: dsMockUtils.createMockU32(rawRemaining),
          }),
        ],
      });

      const result = await checkpointSchedule.details();

      expect(result.remainingCheckpoints).toEqual(rawRemaining);
      expect(result.nextCheckpointDate).toEqual(nextCheckpointDate);
    });
  });

  describe('method: getCheckpoints', () => {
    it("should throw an error if the schedule doesn't exist", async () => {
      const schedule = new CheckpointSchedule(
        { id: new BigNumber(2), ticker, start, period, remaining, nextCheckpointDate },
        context
      );
      const rawScheduleId = dsMockUtils.createMockU64(id);

      dsMockUtils.createQueryMock('checkpoint', 'schedules', {
        returnValue: [
          dsMockUtils.createMockStoredSchedule({
            id: rawScheduleId,
          } as any) as any,
        ],
      });

      let err;

      try {
        await schedule.getCheckpoints();
      } catch (error) {
        err = error;
      }

      expect(err.message).toBe('Schedule no longer exists. It was either removed or it expired');
    });

    it('should return all the checkpoints created by the schedule', async () => {
      const schedule = new CheckpointSchedule(
        { id, ticker, start, period, remaining, nextCheckpointDate },
        context
      );
      const firstId = new BigNumber(1);
      const secondId = new BigNumber(2);
      const rawFirstId = dsMockUtils.createMockU64(firstId);
      const rawSecondId = dsMockUtils.createMockU64(secondId);
      const rawScheduleId = dsMockUtils.createMockU64(id);

      dsMockUtils.createQueryMock('checkpoint', 'schedules', {
        returnValue: [
          dsMockUtils.createMockStoredSchedule({
            id: rawScheduleId,
          } as any) as any,
        ],
      });

      dsMockUtils.createQueryMock('checkpoint', 'schedulePoints', {
        returnValue: [rawFirstId, rawSecondId],
      });

      when(bigNumberToU64Spy).calledWith(firstId).mockReturnValue(rawFirstId);
      when(bigNumberToU64Spy).calledWith(secondId).mockReturnValue(rawSecondId);

      const result = await schedule.getCheckpoints();

      expect(result[0].id).toEqual(firstId);
      expect(result[1].id).toEqual(secondId);
    });
  });

  describe('method: exists', () => {
    it('should return whether the schedule exists', async () => {
      let schedule = new CheckpointSchedule(
        { id, ticker, start, period, remaining, nextCheckpointDate },
        context
      );

      dsMockUtils.createQueryMock('checkpoint', 'schedules', {
        returnValue: [
          dsMockUtils.createMockStoredSchedule({
            id: dsMockUtils.createMockU64(id),
          } as any),
        ],
      });

      let result = await schedule.exists();

      expect(result).toBe(true);

      schedule = new CheckpointSchedule(
        { id: new BigNumber(2), ticker, start, period, remaining, nextCheckpointDate },
        context
      );

      result = await schedule.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      const schedule = new CheckpointSchedule(
        {
          id: new BigNumber(1),
          ticker: 'SOME_TICKER',
          start,
          period,
          remaining,
          nextCheckpointDate,
        },
        context
      );
      expect(schedule.toHuman()).toEqual({
        id: '1',
        ticker: 'SOME_TICKER',
        period: {
          unit: 'month',
          amount: '1',
        },
        start: '1987-10-14T00:00:00.000Z',
        complexity: '12',
        expiryDate: schedule.expiryDate?.toISOString(),
      });
    });
  });
});
