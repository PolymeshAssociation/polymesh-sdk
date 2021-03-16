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
  let nextCheckpointDate: Date;
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
    nextCheckpointDate = new Date('10/14/2030');
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
      let schedule = new CheckpointSchedule(
        { id, ticker, start, period, remaining: 0, nextCheckpointDate },
        context
      );

      expect(schedule.ticker).toBe(ticker);
      expect(schedule.id).toEqual(id);
      expect(schedule.period).toEqual(period);
      expect(schedule.start).toEqual(start);
      expect(schedule.expiryDate).toBeNull();

      schedule = new CheckpointSchedule(
        {
          id,
          ticker,
          start,
          period: { unit: CalendarUnit.Month, amount: 0 },
          remaining,
          nextCheckpointDate,
        },
        context
      );

      expect(schedule.ticker).toBe(ticker);
      expect(schedule.id).toEqual(id);
      expect(schedule.period).toEqual(null);
      expect(schedule.start).toEqual(start);
      expect(schedule.expiryDate).toEqual(start);

      schedule = new CheckpointSchedule(
        {
          id,
          ticker,
          start,
          period: { unit: CalendarUnit.Month, amount: 1 },
          remaining,
          nextCheckpointDate,
        },
        context
      );

      expect(schedule.expiryDate).toEqual(new Date('8/14/2031'));
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

  describe('method: details', () => {
    test('should return the Schedule details ', async () => {
      const rawRemaining = new BigNumber(2);
      const checkpointSchedule = new CheckpointSchedule(
        { id, ticker, period, start, remaining, nextCheckpointDate },
        context
      );

      u64ToBigNumberStub.returns(id);
      sinon
        .stub(utilsConversionModule, 'stringToTicker')
        .returns(dsMockUtils.createMockTicker(ticker));
      sinon.stub(utilsConversionModule, 'u32ToBigNumber').returns(rawRemaining);
      sinon.stub(utilsConversionModule, 'momentToDate').returns(nextCheckpointDate);

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
            id: dsMockUtils.createMockU64(id.toNumber()),
            at: dsMockUtils.createMockMoment(nextCheckpointDate.getTime()),
            remaining: dsMockUtils.createMockU32(rawRemaining.toNumber()),
          }),
        ],
      });

      const result = await checkpointSchedule.details();

      expect(result.remainingCheckpoints).toEqual(rawRemaining.toNumber());
      expect(result.nextCheckpointDate).toEqual(nextCheckpointDate);
    });
  });

  describe('method: exists', () => {
    test('should return whether the schedule exists', async () => {
      let schedule = new CheckpointSchedule(
        { id, ticker, start, period, remaining, nextCheckpointDate },
        context
      );

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
        { id: new BigNumber(2), ticker, start, period, remaining, nextCheckpointDate },
        context
      );

      result = await schedule.exists();

      expect(result).toBe(false);
    });
  });
});
