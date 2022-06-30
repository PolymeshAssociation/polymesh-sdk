import {
  PolymeshPrimitivesStatisticsStat2ndKey,
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesStatisticsStatUpdate,
  PolymeshPrimitivesTicker,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import { BTreeSet } from '@polkadot/types-codec';
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
import { createMockBTreeSet } from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import { ClaimType, CountryCode, ErrorCode, StatClaimType, StatType, TxTags } from '~/types';
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
  let rawClaimCountStatType: PolymeshPrimitivesStatisticsStatType;
  let rawStatUpdate: PolymeshPrimitivesStatisticsStatUpdate;
  let raw2ndKey: PolymeshPrimitivesStatisticsStat2ndKey;

  let addTransactionStub: sinon.SinonStub;
  let setActiveAssetStats: PolymeshTx<
    [PolymeshPrimitivesTicker, PolymeshPrimitivesTransferComplianceTransferCondition]
  >;
  let statisticsOpTypeToStatOpTypeStub: sinon.SinonStub<
    [{ op: PolymeshPrimitivesStatisticsStatOpType }, Context],
    PolymeshPrimitivesStatisticsStatType
  >;
  let statUpdatesToBtreeStatUpdateStub: sinon.SinonStub<
    [PolymeshPrimitivesStatisticsStatUpdate[], Context],
    BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>
  >;
  let createStat2ndKeyStub: sinon.SinonStub<
    [
      type: 'NoClaimStat' | StatClaimType,
      context: Context,
      claimStat?: CountryCode | 'yes' | 'no' | undefined
    ],
    PolymeshPrimitivesStatisticsStat2ndKey
  >;
  let activeAssetStatsStub: sinon.SinonStub;
  let assetTransferCompliancesStub: sinon.SinonStub;
  let rawStatUpdateBtree: BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>;
  let statisticStatTypesToBtreeStatTypeStub: sinon.SinonStub<
    [PolymeshPrimitivesStatisticsStatType[], Context],
    BTreeSet<PolymeshPrimitivesStatisticsStatType>
  >;
  let statStub: sinon.SinonStub;
  let emptyStatTypeBtreeSet: BTreeSet<PolymeshPrimitivesStatisticsStatType>;
  let statBtreeSet: BTreeSet<PolymeshPrimitivesStatisticsStatType>;

  let emptyStorage: Storage;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    mockContext = dsMockUtils.getContextInstance();
    ticker = 'TICKER';
    emptyStorage = {
      currentStats: dsMockUtils.createMockBTreeSet([]),
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
    statisticStatTypesToBtreeStatTypeStub = sinon.stub(
      utilsConversionModule,
      'statisticStatTypesToBtreeStatType'
    );
  });

  beforeEach(() => {
    statStub.returns(StatisticsOpType.Balance);
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    setActiveAssetStats = dsMockUtils.createTxStub('statistics', 'setActiveAssetStats');

    rawCountStatType = dsMockUtils.createMockStatisticsStatType();
    rawBalanceStatType = dsMockUtils.createMockStatisticsStatType({
      op: dsMockUtils.createMockStatisticsOpType(StatisticsOpType.Balance),
    });
    rawClaimCountStatType = dsMockUtils.createMockStatisticsStatType({
      op: dsMockUtils.createMockStatisticsOpType(StatisticsOpType.ClaimCount),
      claimIssuer: [
        dsMockUtils.createMockIdentitiesClaimClaimType(),
        dsMockUtils.createMockIdentityId(),
      ],
    });
    emptyStatTypeBtreeSet = dsMockUtils.createMockBTreeSet([]);
    statBtreeSet = dsMockUtils.createMockBTreeSet([
      rawCountStatType,
      rawBalanceStatType,
      rawClaimCountStatType,
    ]);
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawStatUpdate = dsMockUtils.createMockStatUpdate();
    rawStatUpdateBtree = dsMockUtils.createMockBTreeSet([rawStatUpdate]);

    createStat2ndKeyStub.withArgs('NoClaimStat', mockContext, undefined).returns(raw2ndKey);

    statUpdatesToBtreeStatUpdateStub
      .withArgs([rawStatUpdate], mockContext)
      .returns(rawStatUpdateBtree);

    stringToTickerKeyStub.withArgs(ticker, mockContext).returns({ Ticker: rawTicker });
    statisticStatTypesToBtreeStatTypeStub.returns(emptyStatTypeBtreeSet);
    args = {
      type: StatType.Balance,
      ticker,
    };
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
    const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void, Storage>(mockContext, {
      currentStats: statBtreeSet,
    });
    statisticsOpTypeToStatOpTypeStub.returns(rawCountStatType);
    (rawCountStatType.eq as sinon.SinonStub).returns(true);

    await prepareRemoveAssetStat.call(proc, args);

    sinon.assert.calledWith(addTransactionStub.firstCall, {
      transaction: setActiveAssetStats,
      args: [{ Ticker: rawTicker }, emptyStatTypeBtreeSet],
    });

    args = {
      type: StatType.ScopedCount,
      ticker,
      claimIssuer: {
        issuer: entityMockUtils.getIdentityInstance(),
        claimType: ClaimType.Affiliate,
      },
    };

    await prepareRemoveAssetStat.call(proc, args);

    sinon.assert.calledWith(addTransactionStub.secondCall, {
      transaction: setActiveAssetStats,
      args: [{ Ticker: rawTicker }, emptyStatTypeBtreeSet],
    });
  });

  it('should throw if the stat is not set', () => {
    const currentStats = createMockBTreeSet<PolymeshPrimitivesStatisticsStatType>([]);
    const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void, Storage>(mockContext, {
      currentStats,
    });

    activeAssetStatsStub.returns([rawCountStatType]);
    statStub.returns(StatisticsOpType.Count);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Cannot remove a stat that is not enabled for this Asset',
    });

    return expect(prepareRemoveAssetStat.call(proc, args)).rejects.toThrowError(expectedError);
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
      activeAssetStatsStub.returns([rawCountStatType, rawBalanceStatType, rawClaimCountStatType]);
      let result = await boundFunc({
        ticker: 'TICKER',
        type: StatType.Balance,
      });

      expect(result).toEqual({
        currentStats: [rawCountStatType, rawBalanceStatType, rawClaimCountStatType],
      });

      statStub.returns(StatisticsOpType.Balance);

      result = await boundFunc({
        ticker: 'TICKER',
        type: StatType.Balance,
      });

      expect(result).toEqual({
        currentStats: [rawCountStatType, rawBalanceStatType, rawClaimCountStatType],
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
          dsMockUtils.createMockTransferCondition({
            ClaimCount: [
              dsMockUtils.createMockStatisticsStatClaim({
                Accredited: dsMockUtils.createMockBool(true),
              }),
              dsMockUtils.createMockIdentityId(),
              dsMockUtils.createMockU64(new BigNumber(20)),
              dsMockUtils.createMockOption(),
            ],
          }),
        ],
      });

      statStub.returns(StatisticsOpType.Balance);

      const expectedError = new PolymeshError({
        code: ErrorCode.NoDataChange,
        message:
          'This statistics cannot be removed because a TransferRequirement is currently using it',
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

      statStub.returns(StatisticsOpType.ClaimCount);

      await expect(
        boundFunc({
          ticker: 'TICKER',
          type: StatType.ScopedCount,
          claimIssuer: {
            issuer: entityMockUtils.getIdentityInstance(),
            claimType: ClaimType.Accredited,
          },
        })
      ).rejects.toThrowError(expectedError);
    });
  });
});
