import BigNumber from 'bignumber.js';
import { StoredSchedule } from 'polymesh-types/types';
import sinon from 'sinon';

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
  let stringToTickerStub: sinon.SinonStub;
  let bigNumberToU64Stub: sinon.SinonStub;

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
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    bigNumberToU64Stub = sinon.stub(utilsConversionModule, 'bigNumberToU64');
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

      stringToTickerStub.returns(dsMockUtils.createMockTicker(ticker));

      dsMockUtils.createQueryStub('checkpoint', 'schedules', {
        returnValue: [
          dsMockUtils.createMockStoredSchedule({
            id: rawScheduleId,
          } as StoredSchedule),
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

      stringToTickerStub.returns(dsMockUtils.createMockTicker(ticker));
      sinon.stub(utilsConversionModule, 'u32ToBigNumber').returns(rawRemaining);
      sinon.stub(utilsConversionModule, 'momentToDate').returns(nextCheckpointDate);

      dsMockUtils.createQueryStub('checkpoint', 'schedules', {
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

      dsMockUtils.createQueryStub('checkpoint', 'schedules', {
        returnValue: [
          dsMockUtils.createMockStoredSchedule({
            id: rawScheduleId,
          } as StoredSchedule),
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

      dsMockUtils.createQueryStub('checkpoint', 'schedules', {
        returnValue: [
          dsMockUtils.createMockStoredSchedule({
            id: rawScheduleId,
          } as StoredSchedule),
        ],
      });

      dsMockUtils.createQueryStub('checkpoint', 'schedulePoints', {
        returnValue: [rawFirstId, rawSecondId],
      });

      bigNumberToU64Stub.withArgs(firstId).returns(rawFirstId);
      bigNumberToU64Stub.withArgs(secondId).returns(rawSecondId);

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

      dsMockUtils.createQueryStub('checkpoint', 'schedules', {
        returnValue: [
          dsMockUtils.createMockStoredSchedule({
            id: dsMockUtils.createMockU64(id),
          } as StoredSchedule),
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

  describe('method: toJson', () => {
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
      expect(schedule.toJson()).toEqual({
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
