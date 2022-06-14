import { Vec } from '@polkadot/types';
import {
  BTreeSetStatUpdate,
  PolymeshPrimitivesStatisticsStat2ndKey,
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesStatisticsStatUpdate,
  PolymeshPrimitivesTicker,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  getAuthorization,
  prepareAddAssetStat,
  prepareStorage,
  Storage,
} from '~/api/procedures/addAssetStat';
import { AddAssetStatParams, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, StatType, TxTags } from '~/types';
import { PolymeshTx, StatisticsOpType, TickerKey } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('addAssetStat procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerKeyStub: sinon.SinonStub<[string, Context], TickerKey>;
  let ticker: string;
  let count: BigNumber;
  let rawTicker: PolymeshPrimitivesTicker;
  let args: AddAssetStatParams;
  let rawStatType: PolymeshPrimitivesStatisticsStatType;
  let rawStatUpdate: PolymeshPrimitivesStatisticsStatUpdate;
  let raw2ndKey: PolymeshPrimitivesStatisticsStat2ndKey;

  let addBatchTransactionStub: sinon.SinonStub;
  let setActiveAssetStats: PolymeshTx<
    [PolymeshPrimitivesTicker, PolymeshPrimitivesTransferComplianceTransferCondition]
  >;
  let statisticsOpTypeToStatOpTypeStub: sinon.SinonStub<
    [PolymeshPrimitivesStatisticsStatOpType, Context],
    PolymeshPrimitivesStatisticsStatType
  >;
  let statUpdatesToBtreeStatUpdateStub: sinon.SinonStub<
    [PolymeshPrimitivesStatisticsStatUpdate[], Context],
    BTreeSetStatUpdate
  >;
  let createStat2ndKeyStub: sinon.SinonStub<[Context], PolymeshPrimitivesStatisticsStat2ndKey>;
  let activeAssetStatsStub: sinon.SinonStub;

  let emptyStorage: Storage;
  let statStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    mockContext = dsMockUtils.getContextInstance();
    ticker = 'TICKER';
    emptyStorage = {
      currentStats: [] as unknown as Vec<PolymeshPrimitivesStatisticsStatType>,
    };
    count = new BigNumber(10);
    stringToTickerKeyStub = sinon.stub(utilsConversionModule, 'stringToTickerKey');
    createStat2ndKeyStub = sinon.stub(utilsConversionModule, 'createStat2ndKey');
    statisticsOpTypeToStatOpTypeStub = sinon.stub(
      utilsConversionModule,
      'statisticsOpTypeToStatType'
    );
    statUpdatesToBtreeStatUpdateStub = sinon.stub(
      utilsConversionModule,
      'statUpdatesToBtreeStatUpdate'
    );
    dsMockUtils.setConstMock('statistics', 'maxTransferConditionsPerAsset', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(3)),
    });
    statStub = sinon.stub(utilsConversionModule, 'meshStatToStatisticsOpType');
    activeAssetStatsStub = dsMockUtils.createQueryStub('statistics', 'activeAssetStats');
  });

  beforeEach(() => {
    statStub.returns(StatisticsOpType.Balance);
    addBatchTransactionStub = procedureMockUtils.getAddBatchTransactionStub();
    setActiveAssetStats = dsMockUtils.createTxStub('statistics', 'setActiveAssetStats');

    rawStatType = dsMockUtils.createMockStatistics();
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawStatUpdate = dsMockUtils.createMockStatUpdate();

    createStat2ndKeyStub.withArgs(mockContext).returns(raw2ndKey);
    statUpdatesToBtreeStatUpdateStub
      .withArgs([rawStatUpdate], mockContext)
      .returns([rawStatUpdate] as BTreeSetStatUpdate);

    stringToTickerKeyStub.withArgs(ticker, mockContext).returns({ Ticker: rawTicker });
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
    sinon.restore();
  });

  it('should add an setAssetStats transaction to the queue', async () => {
    args = {
      type: StatType.Balance,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddAssetStatParams, void, Storage>(mockContext, {
      ...emptyStorage,
    });
    statisticsOpTypeToStatOpTypeStub.returns(rawStatType);

    await prepareAddAssetStat.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub.firstCall, {
      transactions: [
        {
          transaction: setActiveAssetStats,
          args: [{ Ticker: rawTicker }, [rawStatType]],
        },
      ],
    });

    args = {
      type: StatType.Count,
      ticker,
      count: new BigNumber(3),
    };

    await prepareAddAssetStat.call(proc, args);
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      args = {
        ticker,
        count,
        type: StatType.Count,
      };

      const proc = procedureMockUtils.getInstance<AddAssetStatParams, void, Storage>(
        mockContext,
        emptyStorage
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [
            TxTags.statistics.SetActiveAssetStats,
            TxTags.statistics.BatchUpdateAssetStats,
          ],
          portfolios: [],
        },
      });
      expect(boundFunc({ ticker, type: StatType.Balance })).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [TxTags.statistics.SetActiveAssetStats],
          portfolios: [],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    beforeEach(() => {
      const did = 'someDid';
      dsMockUtils.configureMocks({
        contextOptions: {
          did,
        },
      });
    });

    it('should fetch, process and return shared data', async () => {
      const proc = procedureMockUtils.getInstance<AddAssetStatParams, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);
      activeAssetStatsStub.returns([rawStatType]);
      let result = await boundFunc({
        ticker: 'TICKER',
        type: StatType.Count,
        count: new BigNumber(1),
      } as AddAssetStatParams);

      expect(result).toEqual({
        currentStats: [rawStatType],
      });

      statStub.returns(StatisticsOpType.Count);

      result = await boundFunc({
        ticker: 'TICKER',
        type: StatType.Balance,
        count: new BigNumber(1),
      } as AddAssetStatParams);

      expect(result).toEqual({
        currentStats: [rawStatType],
      });
    });

    it('should throw an error if the stat is already set', () => {
      const proc = procedureMockUtils.getInstance<AddAssetStatParams, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      activeAssetStatsStub.returns([rawStatType]);

      statStub.returns(StatisticsOpType.Count);

      const expectedError = new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'Stat is already enabled',
      });

      return expect(
        boundFunc({
          ticker: 'TICKER',
          type: StatType.Balance,
        })
      ).rejects.toThrowError(expectedError);
    });
  });
});
