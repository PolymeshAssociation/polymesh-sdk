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

describe('CheckpointSchedule class', () => {
  let context: Context;

  let id: BigNumber;
  let ticker: string;
  let period: CalendarPeriod;
  let start: Date;
  let remaining: number;
  let u64ToBigNumberStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();

    id = new BigNumber(1);
    ticker = 'SOME_TICKER';
    period = {
      unit: CalendarUnit.Month,
      amount: 1,
    };
    start = new Date('10/14/1987');
    remaining = 11;
    u64ToBigNumberStub = sinon.stub(utilsConversionModule, 'u64ToBigNumber');
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
    entityMockUtils.cleanup();
  });

  test('should extend entity', () => {
    expect(CheckpointSchedule.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker and id to instance', () => {
      let schedule = new CheckpointSchedule({ id, ticker, start, period, remaining: 0 }, context);

      expect(schedule.ticker).toBe(ticker);
      expect(schedule.id).toEqual(id);
      expect(schedule.period).toEqual(period);
      expect(schedule.start).toEqual(start);
      expect(schedule.isInfinite).toEqual(true);

      schedule = new CheckpointSchedule(
        { id, ticker, start, period: { unit: CalendarUnit.Month, amount: 0 }, remaining },
        context
      );

      expect(schedule.ticker).toBe(ticker);
      expect(schedule.id).toEqual(id);
      expect(schedule.period).toEqual(null);
      expect(schedule.start).toEqual(start);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(
        CheckpointSchedule.isUniqueIdentifiers({ id: new BigNumber(1), ticker: 'symbol' })
      ).toBe(true);
      expect(CheckpointSchedule.isUniqueIdentifiers({})).toBe(false);
      expect(CheckpointSchedule.isUniqueIdentifiers({ id: new BigNumber(1) })).toBe(false);
      expect(CheckpointSchedule.isUniqueIdentifiers({ id: 'id' })).toBe(false);
    });
  });

  describe('method: expiryDate', () => {
    test("should return the Schedule's expiry date", async () => {
      const schedule = new CheckpointSchedule({ id, ticker, start, period, remaining }, context);
      const nextCheckpointDate = new Date('10/14/2021');
      const rawScheduleId = dsMockUtils.createMockU64(id.toNumber());

      u64ToBigNumberStub.withArgs(rawScheduleId).returns(id);

      dsMockUtils.createQueryStub('checkpoint', 'schedules', {
        returnValue: [
          dsMockUtils.createMockStoredSchedule({
            schedule: dsMockUtils.createMockCheckpointSchedule({
              start: dsMockUtils.createMockMoment(start.getTime()),
              period: dsMockUtils.createMockCalendarPeriod({
                unit: dsMockUtils.createMockCalendarUnit('Month'),
                amount: dsMockUtils.createMockU64(1),
              }),
            }),
            id: rawScheduleId,
            at: dsMockUtils.createMockMoment(nextCheckpointDate.getTime()),
            remaining: dsMockUtils.createMockU32(2),
          }),
        ],
      });

      let result = await schedule.expiryDate();

      expect(result).toEqual(new Date('11/14/2021'));

      schedule.period = null;

      result = await schedule.expiryDate();

      expect(result).toEqual(start);

      schedule.isInfinite = true;

      result = await schedule.expiryDate();

      expect(result).toBeNull();
    });
  });

  describe('method: getCheckpoints', () => {
    test("should throw an error if the schedule doesn't exist", async () => {
      const schedule = new CheckpointSchedule({ id, ticker, start, period, remaining }, context);
      const otherId = new BigNumber(2);
      const rawId = dsMockUtils.createMockU64(otherId.toNumber());

      dsMockUtils.createQueryStub('checkpoint', 'schedules', {
        returnValue: [({ id: rawId } as unknown) as StoredSchedule],
      });
      u64ToBigNumberStub.withArgs(rawId).returns(otherId);

      let err;

      try {
        await schedule.getCheckpoints();
      } catch (error) {
        err = error;
      }

      expect(err.message).toBe("The Schedule doesn't exist");
    });

    test('should return all the checkpoints created by the schedule', async () => {
      const schedule = new CheckpointSchedule({ id, ticker, start, period, remaining }, context);
      const firstId = new BigNumber(1);
      const secondId = new BigNumber(2);
      const rawFirstId = dsMockUtils.createMockU64(firstId.toNumber());
      const rawSecondId = dsMockUtils.createMockU64(secondId.toNumber());
      const rawId = dsMockUtils.createMockU64(id.toNumber());

      dsMockUtils.createQueryStub('checkpoint', 'schedules', {
        returnValue: [({ id: rawId } as unknown) as StoredSchedule],
      });
      u64ToBigNumberStub.withArgs(rawId).returns(id);

      sinon.stub(utilsConversionModule, 'stringToTicker');
      sinon.stub(utilsConversionModule, 'numberToU64');

      dsMockUtils.createQueryStub('checkpoint', 'schedulePoints', {
        returnValue: [rawFirstId, rawSecondId],
      });

      u64ToBigNumberStub.withArgs(rawFirstId).returns(firstId);
      u64ToBigNumberStub.withArgs(rawSecondId).returns(secondId);

      const result = await schedule.getCheckpoints();

      expect(result[0].id).toEqual(firstId);
      expect(result[1].id).toEqual(secondId);
    });
  });

  describe('method: exists', () => {
    test('should return whether the schedule exists', async () => {
      let schedule = new CheckpointSchedule({ id, ticker, start, period, remaining }, context);

      dsMockUtils.createQueryStub('checkpoint', 'schedules', {
        returnValue: [
          dsMockUtils.createMockStoredSchedule({
            id: dsMockUtils.createMockU64(id.toNumber()),
          } as StoredSchedule),
        ],
      });

      u64ToBigNumberStub.returns(id);

      let result = await schedule.exists();

      expect(result).toBe(true);

      schedule = new CheckpointSchedule(
        { id: new BigNumber(2), ticker, start, period, remaining },
        context
      );

      result = await schedule.exists();

      expect(result).toBe(false);
    });
  });
});
