import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  createCheckpointScheduleResolver,
  getAuthorization,
  Params,
  prepareCreateCheckpointSchedule,
} from '~/api/procedures/createCheckpointSchedule';
import { CheckpointSchedule, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { CalendarUnit, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/CheckpointSchedule',
  require('~/testUtils/mocks/entities').mockCheckpointScheduleModule(
    '~/api/entities/CheckpointSchedule'
  )
);
jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('createCheckpointSchedule procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let datesToScheduleCheckpointsSpy: jest.SpyInstance<any, [Date[], Context]>;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    datesToScheduleCheckpointsSpy = jest.spyOn(utilsConversionModule, 'datesToScheduleCheckpoints');
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if the start date is in the past', () => {
    const proc = procedureMockUtils.getInstance<Params, CheckpointSchedule>(mockContext);

    return expect(
      prepareCreateCheckpointSchedule.call(proc, {
        ticker,
        start: new Date(new Date().getTime() - 10000),
        period: null,
        repetitions: null,
      })
    ).rejects.toThrow('Schedule start date must be in the future');
  });

  it('should return a create checkpoint schedule transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, CheckpointSchedule>(mockContext);

    const transaction = dsMockUtils.createTxMock('checkpoint', 'createSchedule');

    const start = new Date(new Date().getTime() + 10000);
    const period = {
      unit: CalendarUnit.Month,
      amount: new BigNumber(1),
    };
    const repetitions = new BigNumber(1);

    const rawSchedule = dsMockUtils.createMockScheduleSpec({
      start: dsMockUtils.createMockOption(
        dsMockUtils.createMockMoment(new BigNumber(start.getTime()))
      ),
      period: dsMockUtils.createMockCalendarPeriod({
        unit: dsMockUtils.createMockCalendarUnit('Month'),
        amount: dsMockUtils.createMockU64(period.amount),
      }),
      remaining: dsMockUtils.createMockU32(repetitions),
    });

    datesToScheduleCheckpointsSpy.mockReturnValue(rawSchedule);

    const result = await prepareCreateCheckpointSchedule.call(proc, {
      ticker,
      start,
      period,
      repetitions,
    });

    expect(result).toEqual({
      transaction,
      resolver: expect.any(Function),
      args: [rawTicker, rawSchedule],
    });
  });

  describe('createCheckpointScheduleResolver', () => {
    const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
    const id = new BigNumber(1);
    const start = new Date('10/14/1987');
    const period = {
      unit: CalendarUnit.Month,
      amount: new BigNumber(1),
    };

    beforeAll(() => {
      entityMockUtils.initMocks({
        checkpointScheduleOptions: {
          ticker,
          id,
          start,
          period,
          expiryDate: new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000),
        },
      });
    });
    beforeEach(() => {
      filterEventRecordsSpy.mockReturnValue([
        dsMockUtils.createMockIEvent([
          dsMockUtils.createMockIdentityId('someDid'),
          dsMockUtils.createMockTicker(ticker),
          dsMockUtils.createMockU64(id),
          dsMockUtils.createMockCheckpointSchedule({
            pending: dsMockUtils.createMockBTreeSet([
              dsMockUtils.createMockMoment(new BigNumber(start.getTime())),
            ]),
          }),
        ]),
      ]);
    });

    afterEach(() => {
      filterEventRecordsSpy.mockReset();
    });

    it('should return the new CheckpointSchedule', () => {
      const result = createCheckpointScheduleResolver(
        ticker,
        mockContext
      )({} as ISubmittableResult);
      expect(result.asset.ticker).toBe(ticker);
      expect(result.id).toEqual(id);
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, CheckpointSchedule>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      const start = new Date('10/14/1987');
      const period = {
        unit: CalendarUnit.Month,
        amount: new BigNumber(1),
      };
      const repetitions = new BigNumber(10);

      expect(boundFunc({ ticker, start, period, repetitions })).toEqual({
        permissions: {
          transactions: [TxTags.checkpoint.CreateSchedule],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
