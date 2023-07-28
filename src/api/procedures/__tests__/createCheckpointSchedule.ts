import {
  PolymeshCommonUtilitiesCheckpointScheduleCheckpoints,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
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
import { TxTags } from '~/types';
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
  let datesToCheckpointScheduleSpy: jest.SpyInstance<
    PolymeshCommonUtilitiesCheckpointScheduleCheckpoints,
    [Date[], Context]
  >;
  let ticker: string;
  let points: Date[];
  let rawTicker: PolymeshPrimitivesTicker;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    datesToCheckpointScheduleSpy = jest.spyOn(utilsConversionModule, 'datesToScheduleCheckpoints');
    ticker = 'SOME_TICKER';
    points = [new Date(new Date().getTime() + 10000)];
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
        points: [new Date(new Date().getTime() - 10000)],
        period: null,
        repetitions: null,
      })
    ).rejects.toThrow('Schedule points must be in the future');
  });

  it('should return a create checkpoint schedule transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, CheckpointSchedule>(mockContext);

    const transaction = dsMockUtils.createTxMock('checkpoint', 'createSchedule');

    const rawSpec = dsMockUtils.createMockCheckpointSchedule({
      pending: dsMockUtils.createMockBTreeSet(points),
    });
    when(datesToCheckpointScheduleSpy).calledWith(points, mockContext).mockReturnValue(rawSpec);

    const result = await prepareCreateCheckpointSchedule.call(proc, {
      ticker,
      points,
    });

    expect(result).toEqual({
      transaction,
      resolver: expect.any(Function),
      args: [rawTicker, rawSpec],
    });
  });

  describe('createCheckpointScheduleResolver', () => {
    const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
    const id = new BigNumber(1);
    const start = new Date('10/14/1987');

    beforeAll(() => {
      entityMockUtils.initMocks({
        checkpointScheduleOptions: {
          ticker,
          id,
          start,
          expiryDate: new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000),
          points: [start],
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

      expect(boundFunc({ ticker, points: [] })).toEqual({
        permissions: {
          transactions: [TxTags.checkpoint.CreateSchedule],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
