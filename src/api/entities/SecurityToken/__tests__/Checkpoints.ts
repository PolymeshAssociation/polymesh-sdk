import BigNumber from 'bignumber.js';
import { Ticker } from 'polymesh-types/types';
import sinon, { SinonStub } from 'sinon';

import {
  Checkpoint,
  CheckpointSchedule,
  Context,
  createCheckpoint,
  createCheckpointSchedule,
  Namespace,
  removeCheckpointSchedule,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { CalendarUnit } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

import { Checkpoints } from '../Checkpoints';

jest.mock(
  '~/api/entities/Checkpoint',
  require('~/testUtils/mocks/entities').mockCheckpointModule('~/api/entities/Checkpoint')
);
jest.mock(
  '~/api/entities/CheckpointSchedule',
  require('~/testUtils/mocks/entities').mockCheckpointScheduleModule(
    '~/api/entities/CheckpointSchedule'
  )
);

describe('Checkpoints class', () => {
  let context: Context;
  let checkpoints: Checkpoints;

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
    checkpoints = new Checkpoints(token, context);
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Checkpoints.prototype instanceof Namespace).toBe(true);
  });

  describe('method: create', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Checkpoint>;

      sinon.stub(createCheckpoint, 'prepare').withArgs({ ticker }, context).resolves(expectedQueue);

      const queue = await checkpoints.create();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: createSchedule', () => {
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
        .withArgs({ ticker, ...args }, context)
        .resolves(expectedQueue);

      const queue = await checkpoints.createSchedule(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: removeSchedule', () => {
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
        .withArgs({ ticker, ...args }, context)
        .resolves(expectedQueue);

      const queue = await checkpoints.removeSchedule(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: get', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should return all created checkpoints with their timestamps', async () => {
      const timestamps = [1000, 2000, new Date().getTime() + 10000];
      const ids = [1, 2, 3];
      const rawTicker = dsMockUtils.createMockTicker(ticker);

      dsMockUtils.createQueryStub('checkpoint', 'timestamps', {
        entries: timestamps.map((timestamp, index) =>
          tuple(
            [rawTicker, dsMockUtils.createMockU64(ids[index])],
            dsMockUtils.createMockMoment(timestamp)
          )
        ),
      });

      stringToTickerStub.withArgs(ticker, context).returns(rawTicker);

      const result = await checkpoints.get();

      expect(result).toEqual(
        timestamps.slice(0, -1).map((timestamp, index) => ({
          checkpoint: entityMockUtils.getCheckpointInstance({ id: new BigNumber(ids[index]) }),
          createdAt: new Date(timestamp),
        }))
      );
    });
  });

  describe('method: getSchedules', () => {
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
      sinon.stub(utilsConversionModule, 'storedScheduleToScheduleParams').returns({
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

      const result = await checkpoints.getSchedules();

      expect(result[0].details).toEqual({
        remainingCheckpoints: remaining,
        nextCheckpointDate,
      });
      expect(result[0].schedule.id).toEqual(id);
      expect(result[0].schedule.ticker).toEqual(ticker);
      expect(result[0].schedule.start).toEqual(start);
      expect(result[0].schedule.period).toEqual(period);
    });
  });
});
