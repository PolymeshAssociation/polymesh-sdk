import { BTreeSet, u64, u128 } from '@polkadot/types';
import { Permill } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesStatisticsStat2ndKey,
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesStatisticsStatUpdate,
  PolymeshPrimitivesTicker,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { ScopeId } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  AddTransferRestrictionParams,
  getAuthorization,
  prepareAddTransferRestriction,
  prepareStorage,
  Storage,
} from '~/api/procedures/addTransferRestriction';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TransferRestriction, TransferRestrictionType, TxTags } from '~/types';
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

describe('addTransferRestriction procedure', () => {
  let mockContext: Mocked<Context>;
  let transferRestrictionToTransferRestrictionStub: sinon.SinonStub<
    [TransferRestriction, Context],
    PolymeshPrimitivesTransferComplianceTransferCondition
  >;
  let stringToTickerKeyStub: sinon.SinonStub<[string, Context], TickerKey>;
  let statisticsOpTypeToStatOpType: sinon.SinonStub<
    [StatisticsOpType, Context],
    PolymeshPrimitivesStatisticsStatOpType
  >;
  let statisticsOpTypeToStatTypeStub: sinon.SinonStub<
    [PolymeshPrimitivesStatisticsStatOpType, Context],
    PolymeshPrimitivesStatisticsStatType
  >;
  let statUpdateStub: sinon.SinonStub<
    [PolymeshPrimitivesStatisticsStat2ndKey, u128, Context],
    PolymeshPrimitivesStatisticsStatUpdate
  >;
  let statUpdatesToBtreeStatUpdateStub: sinon.SinonStub<
    [PolymeshPrimitivesStatisticsStatUpdate[], Context],
    BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>
  >;
  let createStat2ndKeyStub: sinon.SinonStub<[Context], PolymeshPrimitivesStatisticsStat2ndKey>;
  let transferConditionsToBtreeTransferConditionsStub: sinon.SinonStub<
    [PolymeshPrimitivesTransferComplianceTransferCondition[], Context],
    BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>
  >;
  let ticker: string;
  let count: BigNumber;
  let percentage: BigNumber;
  let countRestriction: TransferRestriction;
  let percentageRestriction: TransferRestriction;
  let rawTicker: PolymeshPrimitivesTicker;
  let rawCount: u64;
  let rawPercentage: Permill;
  let rawCountCondition: PolymeshPrimitivesTransferComplianceTransferCondition;
  let rawPercentageCondition: PolymeshPrimitivesTransferComplianceTransferCondition;
  let args: AddTransferRestrictionParams;
  let rawOp: PolymeshPrimitivesStatisticsStatOpType;
  let rawStatType: PolymeshPrimitivesStatisticsStatType;
  let raw2ndKey: PolymeshPrimitivesStatisticsStat2ndKey;
  let rawStatUpdate: PolymeshPrimitivesStatisticsStatUpdate;

  let addBatchTransactionStub: sinon.SinonStub;
  let setAssetTransferCompliance: PolymeshTx<
    [PolymeshPrimitivesTicker, PolymeshPrimitivesTransferComplianceTransferCondition]
  >;
  let setActiveAssetStats: PolymeshTx<
    [PolymeshPrimitivesTicker, BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>]
  >;
  let addExemptedEntitiesTransaction: PolymeshTx<
    [PolymeshPrimitivesTicker, PolymeshPrimitivesTransferComplianceTransferCondition, ScopeId[]]
  >;
  let batchUpdateAssetStatsTransaction: PolymeshTx<
    [
      PolymeshPrimitivesTicker,
      PolymeshPrimitivesStatisticsStatType,
      BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>
    ]
  >;
  let statisticStatTypesToBtreeStatTypeStub: sinon.SinonStub<
    [PolymeshPrimitivesStatisticsStatType[], Context],
    BTreeSet<PolymeshPrimitivesStatisticsStatType>
  >;
  let scopeIdsToBtreeSetIdentityIdStub: sinon.SinonStub<
    [PolymeshPrimitivesIdentityId[], Context],
    BTreeSet<PolymeshPrimitivesIdentityId>
  >;

  const emptyStorage = {
    needStat: true,
    currentExemptions: [],
    currentRestrictions:
      dsMockUtils.createMockBTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>([]),
    currentStats: [] as unknown as BTreeSet<PolymeshPrimitivesStatisticsStatType>,
  };

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    ticker = 'TICKER';
    count = new BigNumber(10);
    percentage = new BigNumber(49);
    countRestriction = { type: TransferRestrictionType.Count, value: count };
    percentageRestriction = { type: TransferRestrictionType.Percentage, value: percentage };
  });

  beforeEach(() => {
    addBatchTransactionStub = procedureMockUtils.getAddBatchTransactionStub();
    setAssetTransferCompliance = dsMockUtils.createTxStub(
      'statistics',
      'setAssetTransferCompliance'
    );
    setActiveAssetStats = dsMockUtils.createTxStub('statistics', 'setActiveAssetStats');
    addExemptedEntitiesTransaction = dsMockUtils.createTxStub('statistics', 'setEntitiesExempt');
    batchUpdateAssetStatsTransaction = dsMockUtils.createTxStub(
      'statistics',
      'batchUpdateAssetStats'
    );

    mockContext = dsMockUtils.getContextInstance();

    dsMockUtils.createQueryStub('asset', 'balanceOf', {
      returnValue: ['one', 'two', 'three'],
    });
    dsMockUtils.setConstMock('statistics', 'maxTransferConditionsPerAsset', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(3)),
    });
    transferRestrictionToTransferRestrictionStub = sinon.stub(
      utilsConversionModule,
      'transferRestrictionToPolymeshTransferCondition'
    );
    stringToTickerKeyStub = sinon.stub(utilsConversionModule, 'stringToTickerKey');
    statisticsOpTypeToStatOpType = sinon.stub(
      utilsConversionModule,
      'statisticsOpTypeToStatOpType'
    );
    statisticsOpTypeToStatTypeStub = sinon.stub(
      utilsConversionModule,
      'statisticsOpTypeToStatType'
    );
    statUpdatesToBtreeStatUpdateStub = sinon.stub(
      utilsConversionModule,
      'statUpdatesToBtreeStatUpdate'
    );
    statUpdateStub = sinon.stub(utilsConversionModule, 'statUpdate');
    createStat2ndKeyStub = sinon.stub(utilsConversionModule, 'createStat2ndKey');
    transferConditionsToBtreeTransferConditionsStub = sinon.stub(
      utilsConversionModule,
      'transferConditionsToBtreeTransferConditions'
    );
    statisticStatTypesToBtreeStatTypeStub = sinon.stub(
      utilsConversionModule,
      'statisticStatTypesToBtreeStatType'
    );
    scopeIdsToBtreeSetIdentityIdStub = sinon.stub(
      utilsConversionModule,
      'scopeIdsToBtreeSetIdentityId'
    );
    rawOp = dsMockUtils.createMockStatisticsOpType(StatisticsOpType.Count);
    rawStatType = dsMockUtils.createMockStatisticsStatType();
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawCount = dsMockUtils.createMockU64(count);
    rawPercentage = dsMockUtils.createMockPermill(percentage.multipliedBy(10000));
    rawCountCondition = dsMockUtils.createMockTransferCondition({ MaxInvestorCount: rawCount });
    rawPercentageCondition = dsMockUtils.createMockTransferCondition({
      MaxInvestorOwnership: rawPercentage,
    });
    raw2ndKey = dsMockUtils.createMock2ndKey();
    rawStatUpdate = dsMockUtils.createMockStatUpdate();

    transferRestrictionToTransferRestrictionStub
      .withArgs(countRestriction, mockContext)
      .returns(rawCountCondition);
    transferRestrictionToTransferRestrictionStub
      .withArgs(percentageRestriction, mockContext)
      .returns(rawPercentageCondition);
    stringToTickerKeyStub.withArgs(ticker, mockContext).returns({ Ticker: rawTicker });
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
    sinon.restore();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should add an add asset transfer compliance transaction to the queue', async () => {
    args = {
      type: TransferRestrictionType.Count,
      exemptedIdentities: [],
      count,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
      mockContext,
      { ...emptyStorage, needStat: false }
    );

    const mockCountBtree =
      dsMockUtils.createMockBTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>([
        rawCountCondition,
      ]);
    transferConditionsToBtreeTransferConditionsStub.returns(mockCountBtree);

    let result = await prepareAddTransferRestriction.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub.firstCall, {
      transactions: [
        {
          transaction: setAssetTransferCompliance,
          args: [{ Ticker: rawTicker }, mockCountBtree],
        },
      ],
    });

    const mockPercentBtree =
      dsMockUtils.createMockBTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>([
        rawPercentageCondition,
      ]);
    transferConditionsToBtreeTransferConditionsStub.returns(mockPercentBtree);

    expect(result).toEqual(new BigNumber(1));

    args = {
      type: TransferRestrictionType.Percentage,
      exemptedIdentities: [],
      percentage,
      ticker,
    };

    result = await prepareAddTransferRestriction.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub.secondCall, {
      transactions: [
        {
          transaction: setAssetTransferCompliance,
          args: [{ Ticker: rawTicker }, mockPercentBtree],
        },
      ],
    });

    expect(result).toEqual(new BigNumber(1));
  });

  it('should add an add exempted entities transaction to the queue', async () => {
    const did = 'someDid';
    const scopeId = 'someScopeId';
    const rawScopeId = dsMockUtils.createMockScopeId(scopeId);
    const identityScopeId = 'anotherScopeId';
    const rawIdentityScopeId = dsMockUtils.createMockScopeId(identityScopeId);
    const rawIdentityBtree = dsMockUtils.createMockBTreeSet<PolymeshPrimitivesIdentityId>([
      rawIdentityScopeId,
    ]);
    scopeIdsToBtreeSetIdentityIdStub.returns(rawIdentityBtree);

    entityMockUtils.configureMocks({
      identityOptions: { getScopeId: identityScopeId },
      assetOptions: { details: { requiresInvestorUniqueness: true } },
    });
    args = {
      type: TransferRestrictionType.Count,
      exemptedIdentities: [did],
      count,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
      mockContext,
      { ...emptyStorage, needStat: false }
    );

    const stringToScopeIdStub = sinon.stub(utilsConversionModule, 'stringToScopeId');

    stringToScopeIdStub.withArgs(scopeId, mockContext).returns(rawScopeId);
    stringToScopeIdStub.withArgs(identityScopeId, mockContext).returns(rawIdentityScopeId);
    statisticsOpTypeToStatOpType.withArgs(StatisticsOpType.Count, mockContext).returns(rawOp);

    const mockCountBtree =
      dsMockUtils.createMockBTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>([
        rawCountCondition,
      ]);
    transferConditionsToBtreeTransferConditionsStub.returns(mockCountBtree);

    let result = await prepareAddTransferRestriction.call(proc, args);
    sinon.assert.calledWith(addBatchTransactionStub.firstCall, {
      transactions: [
        {
          transaction: addExemptedEntitiesTransaction,
          feeMultiplier: new BigNumber(1),
          args: [true, { asset: { Ticker: rawTicker }, op: rawOp }, rawIdentityBtree],
        },
        {
          transaction: setAssetTransferCompliance,
          args: [{ Ticker: rawTicker }, mockCountBtree],
        },
      ],
    });

    expect(result).toEqual(new BigNumber(1));

    result = await prepareAddTransferRestriction.call(proc, {
      ...args,
      exemptedIdentities: [entityMockUtils.getIdentityInstance()],
    });

    sinon.assert.calledWith(addBatchTransactionStub.secondCall, {
      transactions: [
        {
          transaction: addExemptedEntitiesTransaction,
          feeMultiplier: new BigNumber(1),
          args: [true, { asset: { Ticker: rawTicker }, op: rawOp }, rawIdentityBtree],
        },
        {
          transaction: setAssetTransferCompliance,
          args: [{ Ticker: rawTicker }, mockCountBtree],
        },
      ],
    });

    expect(result).toEqual(new BigNumber(1));
  });

  it('should create stats and initialize stats if they do not exist', async () => {
    args = {
      type: TransferRestrictionType.Count,
      exemptedIdentities: [],
      count,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
      mockContext,
      {
        ...emptyStorage,
      }
    );
    const rawStatUpdateBtree =
      dsMockUtils.createMockBTreeSet<PolymeshPrimitivesStatisticsStatUpdate>([rawStatUpdate]);

    statisticsOpTypeToStatTypeStub.returns(rawStatType);
    createStat2ndKeyStub.withArgs(mockContext).returns(raw2ndKey);
    statUpdateStub.returns(rawStatUpdate);

    const mockStatTypeBtree = dsMockUtils.createMockBTreeSet<PolymeshPrimitivesStatisticsStatType>([
      rawStatType,
    ]);
    statisticStatTypesToBtreeStatTypeStub.returns(mockStatTypeBtree);
    const mockStatUpdateBtree =
      dsMockUtils.createMockBTreeSet<PolymeshPrimitivesStatisticsStatUpdate>([rawStatUpdateBtree]);
    statUpdatesToBtreeStatUpdateStub.returns(mockStatUpdateBtree);
    const mockCountBtree =
      dsMockUtils.createMockBTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>([
        rawCountCondition,
      ]);
    transferConditionsToBtreeTransferConditionsStub.returns(mockCountBtree);

    await prepareAddTransferRestriction.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: [
        {
          transaction: setActiveAssetStats,
          args: [{ Ticker: rawTicker }, mockStatTypeBtree],
        },
        {
          transaction: batchUpdateAssetStatsTransaction,
          args: [{ Ticker: rawTicker }, rawStatType, mockStatUpdateBtree],
        },
        {
          transaction: setAssetTransferCompliance,
          args: [{ Ticker: rawTicker }, mockCountBtree],
        },
      ],
    });

    const mockStatTypeBtreeTwoStats =
      dsMockUtils.createMockBTreeSet<PolymeshPrimitivesStatisticsStatType>([
        rawStatType,
        rawStatType,
      ]);
    statisticStatTypesToBtreeStatTypeStub.returns(mockStatTypeBtreeTwoStats);

    const mockPercentBtree =
      dsMockUtils.createMockBTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>([
        rawPercentageCondition,
      ]);

    transferConditionsToBtreeTransferConditionsStub.returns(mockPercentBtree);

    args = {
      type: TransferRestrictionType.Percentage,
      exemptedIdentities: [],
      percentage,
      ticker,
    };

    await prepareAddTransferRestriction.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: [
        {
          transaction: setActiveAssetStats,
          args: [{ Ticker: rawTicker }, mockStatTypeBtreeTwoStats],
        },
        {
          transaction: setAssetTransferCompliance,
          args: [{ Ticker: rawTicker }, mockPercentBtree],
        },
      ],
    });
  });

  it('should throw an error if attempting to add a restriction that already exists', async () => {
    args = {
      type: TransferRestrictionType.Count,
      exemptedIdentities: [],
      count,
      ticker,
    };
    let proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
      mockContext,
      {
        ...emptyStorage,
        currentRestrictions:
          dsMockUtils.createMockBTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>([
            rawCountCondition,
          ]),
      }
    );

    let err;

    try {
      await prepareAddTransferRestriction.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Cannot add the same restriction more than once');

    args = {
      type: TransferRestrictionType.Percentage,
      exemptedIdentities: [],
      percentage,
      ticker,
    };

    proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
      mockContext,
      {
        ...emptyStorage,
        currentRestrictions:
          dsMockUtils.createMockBTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>([
            rawCountCondition,
            rawPercentageCondition,
          ]),
      }
    );

    try {
      await prepareAddTransferRestriction.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Cannot add the same restriction more than once');
  });

  it('should throw an error if attempting to add a restriction when the restriction limit has been reached', async () => {
    args = {
      type: TransferRestrictionType.Count,
      count,
      ticker,
    };
    const restrictionsMockBtree =
      dsMockUtils.createMockBTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>([
        rawPercentageCondition,
        rawPercentageCondition,
        rawPercentageCondition,
      ]);

    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
      mockContext,
      {
        ...emptyStorage,
        currentRestrictions: restrictionsMockBtree,
      }
    );

    let err;

    try {
      await prepareAddTransferRestriction.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Transfer Restriction limit reached');
    expect(err.data).toEqual({ limit: new BigNumber(3) });
  });

  it('should throw an error if exempted entities are repeated', async () => {
    args = {
      type: TransferRestrictionType.Count,
      exemptedIdentities: ['someScopeId', 'someScopeId'],
      count,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
      mockContext,
      emptyStorage
    );

    let err;

    try {
      await prepareAddTransferRestriction.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe(
      'One or more of the passed exempted Identities are repeated or have the same Scope ID'
    );
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      args = {
        ticker,
        count,
        type: TransferRestrictionType.Count,
      };

      let proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
        mockContext,
        emptyStorage
      );
      let boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [
            TxTags.statistics.SetAssetTransferCompliance,
            TxTags.statistics.SetActiveAssetStats,
          ],
          portfolios: [],
        },
      });
      expect(boundFunc({ ...args, exemptedIdentities: ['someScopeId'] })).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [
            TxTags.statistics.SetAssetTransferCompliance,
            TxTags.statistics.SetEntitiesExempt,
            TxTags.statistics.SetActiveAssetStats,
          ],
          portfolios: [],
        },
      });

      proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
        mockContext,
        {
          ...emptyStorage,
          needStat: false,
        }
      );
      boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [TxTags.statistics.SetAssetTransferCompliance],
          portfolios: [],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should fetch, process and return shared data', async () => {
      const did = 'someDid';
      const mockAssetStats = dsMockUtils.createMockBTreeSet([]);
      const mockAssetCompliances = dsMockUtils.createMockBTreeSet([]);
      dsMockUtils.configureMocks({
        contextOptions: {
          did,
        },
      });
      dsMockUtils.createQueryStub('statistics', 'activeAssetStats', {
        returnValue: mockAssetStats,
      });

      dsMockUtils.createQueryStub('statistics', 'assetTransferCompliances', {
        returnValue: { requirements: mockAssetCompliances },
      });

      const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
        mockContext
      );
      const boundFunc = prepareStorage.bind(proc);

      const statStub = sinon
        .stub(utilsConversionModule, 'meshStatToStatisticsOpType')
        .returns(StatisticsOpType.Count);

      let result = await boundFunc({
        ticker: 'TICKER',
        type: TransferRestrictionType.Count,
        count: new BigNumber(1),
      } as AddTransferRestrictionParams);

      expect(result).toEqual({
        currentRestrictions: mockAssetCompliances,
        currentStats: mockAssetStats,
        needStat: true,
      });

      const mockCountBtree = dsMockUtils.createMockBTreeSet([rawCountCondition]);
      dsMockUtils.createQueryStub('statistics', 'assetTransferCompliances', {
        returnValue: { requirements: mockCountBtree },
      });
      const mockStatBtree = dsMockUtils.createMockBTreeSet([rawStatType]);
      const hasStub = mockStatBtree.has as sinon.SinonStub;
      hasStub.returns(true);
      dsMockUtils.createQueryStub('statistics', 'activeAssetStats', {
        returnValue: mockStatBtree,
      });

      result = await boundFunc({
        ticker: 'TICKER',
        type: TransferRestrictionType.Count,
        count: new BigNumber(1),
      } as AddTransferRestrictionParams);

      expect(result).toEqual({
        currentRestrictions: mockCountBtree,
        currentStats: mockStatBtree,
        needStat: false,
      });

      statStub.returns(StatisticsOpType.Balance);

      hasStub.returns(false);
      result = await boundFunc({
        ticker: 'TICKER',
        type: TransferRestrictionType.Count,
        count: new BigNumber(1),
      } as AddTransferRestrictionParams);

      expect(result).toEqual({
        currentRestrictions: mockCountBtree,
        currentStats: mockStatBtree,
        needStat: true,
      });
    });
  });
});
