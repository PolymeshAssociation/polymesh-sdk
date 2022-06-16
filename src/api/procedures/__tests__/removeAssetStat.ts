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
  prepareRemoveAssetStat,
  prepareStorage,
  Storage,
} from '~/api/procedures/removeAssetStat';
import { Context, PolymeshError, RemoveAssetStatParams } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, StatType, TxTags } from '~/types';
import { PolymeshTx, StatisticsOpType, TickerKey } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('removeAssetStat procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerKeyStub: sinon.SinonStub<[string, Context], TickerKey>;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;
  let args: RemoveAssetStatParams;
  let rawCountStatType: PolymeshPrimitivesStatisticsStatType;
  let rawBalanceStatType: PolymeshPrimitivesStatisticsStatType;
  let rawStatUpdate: PolymeshPrimitivesStatisticsStatUpdate;
  let raw2ndKey: PolymeshPrimitivesStatisticsStat2ndKey;

  let addTransactionStub: sinon.SinonStub;
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
  let assetTransferCompliancesStub: sinon.SinonStub;
  let statStub: sinon.SinonStub;

  let emptyStorage: Storage;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    mockContext = dsMockUtils.getContextInstance();
    ticker = 'TICKER';
    emptyStorage = {
      currentStats: [] as unknown as Vec<PolymeshPrimitivesStatisticsStatType>,
    };
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
    assetTransferCompliancesStub = dsMockUtils.createQueryStub(
      'statistics',
      'assetTransferCompliances'
    );
  });

  beforeEach(() => {
    statStub.returns(StatisticsOpType.Balance);
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    setActiveAssetStats = dsMockUtils.createTxStub('statistics', 'setActiveAssetStats');

    rawCountStatType = dsMockUtils.createMockStatistics();
    rawBalanceStatType = dsMockUtils.createMockStatistics();
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

    const currentStats = { toArray: () => [], indexOf: () => 0 } as any;
    const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void, Storage>(mockContext, {
      currentStats,
    });
    statisticsOpTypeToStatOpTypeStub.returns(rawCountStatType);

    await prepareRemoveAssetStat.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, {
      transaction: setActiveAssetStats,
      args: [{ Ticker: rawTicker }, []],
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      args = {
        ticker,
        type: StatType.Count,
      };

      const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void, Storage>(
        mockContext,
        emptyStorage
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
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
      const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void, Storage>(
        mockContext
      );
      assetTransferCompliancesStub.returns({
        requirements: [],
      });
      const boundFunc = prepareStorage.bind(proc);
      activeAssetStatsStub.returns([rawCountStatType, rawBalanceStatType]);
      let result = await boundFunc({
        ticker: 'TICKER',
        type: StatType.Balance,
      });

      expect(result).toEqual({
        currentStats: [rawCountStatType, rawBalanceStatType],
      });

      statStub.returns(StatisticsOpType.Balance);

      result = await boundFunc({
        ticker: 'TICKER',
        type: StatType.Balance,
      });

      expect(result).toEqual({
        currentStats: [rawCountStatType, rawBalanceStatType],
      });
    });

    it('should throw an error if the stat is being used', async () => {
      const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void, Storage>(
        mockContext
      );
      const boundFunc = prepareStorage.bind(proc);

      activeAssetStatsStub.returns([rawCountStatType]);
      assetTransferCompliancesStub.returns({
        requirements: [
          dsMockUtils.createMockTransferCondition({
            MaxInvestorOwnership: dsMockUtils.createMockU64(new BigNumber(10)),
          }),
          dsMockUtils.createMockTransferCondition({
            MaxInvestorCount: dsMockUtils.createMockU64(new BigNumber(20)),
          }),
        ],
      });

      statStub.returns(StatisticsOpType.Balance);

      const expectedError = new PolymeshError({
        code: ErrorCode.NoDataChange,
        message:
          'This statistics cannot be removed as a TransferRequirement is currently using using it',
      });

      await expect(
        boundFunc({
          ticker: 'TICKER',
          type: StatType.Balance,
        })
      ).rejects.toThrowError(expectedError);

      statStub.returns(StatisticsOpType.Count);
      await expect(
        boundFunc({
          ticker: 'TICKER',
          type: StatType.Count,
        })
      ).rejects.toThrowError(expectedError);
    });

    it('should throw if the stat is not set', () => {
      const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void, Storage>(
        mockContext
      );
      const boundFunc = prepareStorage.bind(proc);

      activeAssetStatsStub.returns([rawCountStatType]);
      statStub.returns(StatisticsOpType.Count);

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Stat of type: "Balance" is not enabled for Asset: "TICKER"',
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
