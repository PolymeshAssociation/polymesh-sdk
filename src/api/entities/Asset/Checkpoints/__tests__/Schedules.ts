import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import sinon, { SinonStub } from 'sinon';

import { CheckpointSchedule, Context, Namespace, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
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
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Schedules class', () => {
  let context: Context;
  let schedules: Schedules;

  let ticker: string;

  let stringToTickerStub: SinonStub<[string, Context], PolymeshPrimitivesTicker>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    ticker = 'SOME_TICKER';

    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    procedureMockUtils.reset();

    context = dsMockUtils.getContextInstance();

    const asset = entityMockUtils.getAssetInstance({ ticker });
    schedules = new Schedules(asset, context);
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Schedules.prototype instanceof Namespace).toBe(true);
  });

  describe('method: create', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<CheckpointSchedule>;
      const args = {
        start: null,
        period: {
          unit: CalendarUnit.Month,
          amount: new BigNumber(1),
        },
        repetitions: null,
      };

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker, ...args }, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await schedules.create(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: remove', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;
      const args = {
        schedule: new BigNumber(1),
      };

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker, ...args }, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await schedules.remove(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getOne', () => {
    let getStub: sinon.SinonStub;
    let id: BigNumber;

    beforeAll(() => {
      id = new BigNumber(1);
    });

    beforeEach(() => {
      getStub = sinon.stub(schedules, 'get');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return the requested Checkpoint Schedule', async () => {
      const fakeResult = {
        schedule: entityMockUtils.getCheckpointScheduleInstance({ id }),
        details: {
          remainingCheckpoints: 1,
          nextCheckpointDate: new Date(),
        },
      };

      getStub.resolves([fakeResult]);

      const result = await schedules.getOne({ id });
      expect(result).toEqual(fakeResult);
    });

    it('should throw an error if the Schedule does not exist', () => {
      getStub.resolves([]);

      return expect(schedules.getOne({ id })).rejects.toThrow('The Schedule does not exist');
    });
  });

  describe('method: get', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should return the current checkpoint schedules', async () => {
      const rawTicker = dsMockUtils.createMockTicker(ticker);
      const id = new BigNumber(1);
      const start = new Date('10/14/1987');
      const nextCheckpointDate = new Date('10/14/2030');
      const remaining = new BigNumber(2);
      const period = {
        unit: CalendarUnit.Month,
        amount: new BigNumber(1),
      };

      stringToTickerStub.withArgs(ticker, context).returns(rawTicker);

      sinon.stub(utilsConversionModule, 'storedScheduleToCheckpointScheduleParams').returns({
        id,
        period,
        start,
        remaining,
        nextCheckpointDate,
      });

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
            id: dsMockUtils.createMockU64(id),
            at: dsMockUtils.createMockMoment(new BigNumber(nextCheckpointDate.getTime())),
            remaining: dsMockUtils.createMockU32(remaining),
          }),
        ],
      });

      const result = await schedules.get();

      expect(result[0].details).toEqual({
        remainingCheckpoints: remaining,
        nextCheckpointDate,
      });
      expect(result[0].schedule.id).toEqual(id);
      expect(result[0].schedule.asset.ticker).toEqual(ticker);
      expect(result[0].schedule.start).toEqual(start);
      expect(result[0].schedule.period).toEqual(period);
    });
  });

  describe('method: complexityOf', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should return the complexity of the passed period', () => {
      const period = {
        unit: CalendarUnit.Month,
        amount: new BigNumber(7),
      };
      const expected = new BigNumber(2);
      sinon.stub(utilsInternalModule, 'periodComplexity').withArgs(period).returns(expected);

      expect(schedules.complexityOf(period)).toBe(expected);
    });
  });

  describe('method: currentComplexity', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should return the sum of the complexity of all schedules', async () => {
      const getStub = sinon.stub(schedules, 'get');
      getStub.resolves([
        {
          schedule: entityMockUtils.getCheckpointScheduleInstance({ complexity: new BigNumber(1) }),
        },
        {
          schedule: entityMockUtils.getCheckpointScheduleInstance({ complexity: new BigNumber(2) }),
        },
        {
          schedule: entityMockUtils.getCheckpointScheduleInstance({
            complexity: new BigNumber(2.5),
          }),
        },
      ] as unknown as ScheduleWithDetails[]);

      let result = await schedules.currentComplexity();

      expect(result).toEqual(new BigNumber(5.5));

      getStub.resolves([]);

      result = await schedules.currentComplexity();

      expect(result).toEqual(new BigNumber(0));
    });
  });

  describe('method: maxComplexity', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should return the maximum complexity from the chain', async () => {
      dsMockUtils.createQueryStub('checkpoint', 'schedulesMaxComplexity', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(20)),
      });

      const result = await schedules.maxComplexity();

      expect(result).toEqual(new BigNumber(20));
    });
  });
});
