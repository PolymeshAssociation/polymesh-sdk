import BigNumber from 'bignumber.js';
import { Ticker } from 'polymesh-types/types';
import sinon, { SinonStub } from 'sinon';

import {
  CheckpointSchedule,
  Context,
  createCheckpointSchedule,
  Namespace,
  removeCheckpointSchedule,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { CalendarUnit, ScheduleWithDetails } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

import { Schedules } from '../Schedules';

jest.mock(
  '~/api/entities/CheckpointSchedule',
  require('~/testUtils/mocks/entities').mockCheckpointScheduleModule(
    '~/api/entities/CheckpointSchedule'
  )
);

describe('Schedules class', () => {
  let context: Context;
  let schedules: Schedules;

  let ticker: string;

  let stringToTickerStub: SinonStub<[string, Context], Ticker>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();

    ticker = 'SOME_TICKER';

    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();

    context = dsMockUtils.getContextInstance();

    const token = entityMockUtils.getSecurityTokenInstance({ ticker });
    schedules = new Schedules(token, context);
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Schedules.prototype instanceof Namespace).toBe(true);
  });

  describe('method: create', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<CheckpointSchedule>;
      const args = {
        start: null,
        period: {
          unit: CalendarUnit.Month,
          amount: 1,
        },
        repetitions: null,
      };

      sinon
        .stub(createCheckpointSchedule, 'prepare')
        .withArgs({ args: { ticker, ...args }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await schedules.create(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: remove', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;
      const args = {
        schedule: new BigNumber(1),
      };

      sinon
        .stub(removeCheckpointSchedule, 'prepare')
        .withArgs({ args: { ticker, ...args }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await schedules.remove(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: get', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should return the current checkpoint schedules', async () => {
      const rawTicker = dsMockUtils.createMockTicker(ticker);
      const id = new BigNumber(1);
      const start = new Date('10/14/1987');
      const nextCheckpointDate = new Date('10/14/2030');
      const remaining = new BigNumber(2);
      const period = {
        unit: CalendarUnit.Month,
        amount: 1,
      };

      stringToTickerStub.withArgs(ticker, context).returns(rawTicker);

      sinon.stub(utilsConversionModule, 'storedScheduleToCheckpointScheduleParams').returns({
        id,
        period,
        start,
        remaining: remaining.toNumber(),
        nextCheckpointDate,
      });

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
            remaining: dsMockUtils.createMockU32(remaining.toNumber()),
          }),
        ],
      });

      const result = await schedules.get();

      expect(result[0].details).toEqual({
        remainingCheckpoints: remaining.toNumber(),
        nextCheckpointDate,
      });
      expect(result[0].schedule.id).toEqual(id);
      expect(result[0].schedule.ticker).toEqual(ticker);
      expect(result[0].schedule.start).toEqual(start);
      expect(result[0].schedule.period).toEqual(period);
    });
  });

  describe('method: complexityOf', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should return the complexity of the passed period', () => {
      const period = {
        unit: CalendarUnit.Month,
        amount: 7,
      };
      const expected = 2;
      sinon.stub(utilsInternalModule, 'periodComplexity').withArgs(period).returns(expected);

      expect(schedules.complexityOf(period)).toBe(expected);
    });
  });

  describe('method: currentComplexity', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should return the sum of the complexity of all schedules', async () => {
      const getStub = sinon.stub(schedules, 'get');
      getStub.resolves(([
        { schedule: entityMockUtils.getCheckpointScheduleInstance({ complexity: 1 }) },
        { schedule: entityMockUtils.getCheckpointScheduleInstance({ complexity: 2 }) },
        { schedule: entityMockUtils.getCheckpointScheduleInstance({ complexity: 2.5 }) },
      ] as unknown) as ScheduleWithDetails[]);

      let result = await schedules.currentComplexity();

      expect(result).toBe(5.5);

      getStub.resolves([]);

      result = await schedules.currentComplexity();

      expect(result).toBe(0);
    });
  });

  describe('method: maxComplexity', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should return the maximum complexity from the chain', async () => {
      dsMockUtils.createQueryStub('checkpoint', 'schedulesMaxComplexity', {
        returnValue: dsMockUtils.createMockU64(20),
      });

      const result = await schedules.maxComplexity();

      expect(result).toBe(20);
    });
  });
});
