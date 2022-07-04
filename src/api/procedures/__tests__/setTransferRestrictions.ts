import { u64, u128 } from '@polkadot/types';
import { Permill } from '@polkadot/types/interfaces';
import {
  BTreeSetIdentityId,
  BTreeSetStatType,
  BTreeSetStatUpdate,
  BTreeSetTransferCondition,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesStatisticsStat2ndKey,
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesStatisticsStatUpdate,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { ScopeId, Ticker, TransferCondition } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  prepareSetTransferRestrictions,
  prepareStorage,
  SetTransferRestrictionsParams,
  Storage,
} from '~/api/procedures/setTransferRestrictions';
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

describe('setTransferRestrictions procedure', () => {
  let mockContext: Mocked<Context>;
  let transferRestrictionToTransferManagerStub: sinon.SinonStub<
    [TransferRestriction, Context],
    TransferCondition
  >;
  let stringToTickerKeyStub: sinon.SinonStub<[string, Context], TickerKey>;
  let stringToScopeIdStub: sinon.SinonStub<[string, Context], ScopeId>;
  let scopeIdsToBtreeSetStub: sinon.SinonStub<
    [PolymeshPrimitivesIdentityId[], Context],
    BTreeSetIdentityId
  >;
  let statisticsOpTypeToStatOpTypeStub: sinon.SinonStub<
    [StatisticsOpType, Context],
    PolymeshPrimitivesStatisticsStatOpType
  >;
  let batchUpdateAssetStatsTransaction: PolymeshTx<
    [Ticker, PolymeshPrimitivesStatisticsStatType, BTreeSetStatUpdate[]]
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
    BTreeSetStatUpdate
  >;
  let complianceConditionsToBtreeSetStub: sinon.SinonStub<
    [PolymeshPrimitivesTransferComplianceTransferCondition[], Context],
    BTreeSetTransferCondition
  >;

  let createStat2ndKeyStub: sinon.SinonStub<[Context], PolymeshPrimitivesStatisticsStat2ndKey>;
  let ticker: string;
  let count: BigNumber;
  let percentage: BigNumber;
  let maxInvestorRestriction: TransferRestriction;
  let maxOwnershipRestriction: TransferRestriction;
  let exemptedDid: string;
  let rawTicker: Ticker;
  let rawCount: u64;
  let rawPercentage: Permill;
  let rawCountRestriction: TransferCondition;
  let rawPercentageRestriction: TransferCondition;
  let rawScopeId: ScopeId;
  let rawStatType: PolymeshPrimitivesStatisticsStatType;
  let rawStatUpdate: PolymeshPrimitivesStatisticsStatUpdate;
  let args: SetTransferRestrictionsParams;
  let raw2ndKey: PolymeshPrimitivesStatisticsStat2ndKey;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    transferRestrictionToTransferManagerStub = sinon.stub(
      utilsConversionModule,
      'transferRestrictionToPolymeshTransferCondition'
    );
    stringToTickerKeyStub = sinon.stub(utilsConversionModule, 'stringToTickerKey');
    stringToScopeIdStub = sinon.stub(utilsConversionModule, 'stringToScopeId');
    scopeIdsToBtreeSetStub = sinon.stub(utilsConversionModule, 'scopeIdsToBtreeSetIdentityId');
    statisticsOpTypeToStatOpTypeStub = sinon.stub(
      utilsConversionModule,
      'statisticsOpTypeToStatOpType'
    );
    statisticsOpTypeToStatTypeStub = sinon.stub(
      utilsConversionModule,
      'statisticsOpTypeToStatType'
    );
    statUpdateStub = sinon.stub(utilsConversionModule, 'statUpdate');
    createStat2ndKeyStub = sinon.stub(utilsConversionModule, 'createStat2ndKey');
    statUpdatesToBtreeStatUpdateStub = sinon.stub(
      utilsConversionModule,
      'statUpdatesToBtreeStatUpdate'
    );
    complianceConditionsToBtreeSetStub = sinon.stub(
      utilsConversionModule,
      'complianceConditionsToBtreeSet'
    );
    ticker = 'TICKER';
    count = new BigNumber(10);
    percentage = new BigNumber(49);
    maxInvestorRestriction = { type: TransferRestrictionType.Count, value: count };
    maxOwnershipRestriction = { type: TransferRestrictionType.Percentage, value: percentage };
    exemptedDid = 'exemptedDid';
  });

  let setAssetTransferComplianceTransaction: PolymeshTx<[Ticker, TransferCondition]>;
  let setEntitiesExemptTransaction: PolymeshTx<
    [
      boolean,
      { asset: { Ticker: Ticker }; op: PolymeshPrimitivesStatisticsStatOpType },
      BTreeSetIdentityId
    ]
  >;
  let setActiveAssetStatsTransaction: PolymeshTx<[Ticker, BTreeSetStatType]>;

  beforeEach(() => {
    args = {
      ticker,
      restrictions: [{ count }],
      type: TransferRestrictionType.Count,
    };
    dsMockUtils.setConstMock('statistics', 'maxTransferConditionsPerAsset', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(3)),
    });

    setAssetTransferComplianceTransaction = dsMockUtils.createTxStub(
      'statistics',
      'setAssetTransferCompliance'
    );
    setEntitiesExemptTransaction = dsMockUtils.createTxStub('statistics', 'setEntitiesExempt');
    setActiveAssetStatsTransaction = dsMockUtils.createTxStub('statistics', 'setActiveAssetStats');
    batchUpdateAssetStatsTransaction = dsMockUtils.createTxStub(
      'statistics',
      'batchUpdateAssetStats'
    );

    mockContext = dsMockUtils.getContextInstance();

    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawCount = dsMockUtils.createMockU64(count);
    rawPercentage = dsMockUtils.createMockPermill(percentage.multipliedBy(10000));
    rawCountRestriction = dsMockUtils.createMockTransferCondition({ MaxInvestorCount: rawCount });
    rawPercentageRestriction = dsMockUtils.createMockTransferCondition({
      MaxInvestorOwnership: rawPercentage,
    });
    rawScopeId = dsMockUtils.createMockScopeId(exemptedDid);
    rawStatType = dsMockUtils.createMockStatistics();
    raw2ndKey = dsMockUtils.createMock2ndKey();

    transferRestrictionToTransferManagerStub
      .withArgs(maxInvestorRestriction, mockContext)
      .returns(rawCountRestriction);
    transferRestrictionToTransferManagerStub
      .withArgs(maxOwnershipRestriction, mockContext)
      .returns(rawPercentageRestriction);
    stringToTickerKeyStub.withArgs(ticker, mockContext).returns({ Ticker: rawTicker });
    stringToScopeIdStub.withArgs(exemptedDid, mockContext).returns(rawScopeId);
    statUpdatesToBtreeStatUpdateStub
      .withArgs([rawStatUpdate], mockContext)
      .returns([rawStatUpdate] as BTreeSetStatUpdate);
    complianceConditionsToBtreeSetStub
      .withArgs([rawCountRestriction], mockContext)
      .returns([rawCountRestriction] as BTreeSetTransferCondition);
    complianceConditionsToBtreeSetStub
      .withArgs([rawPercentageRestriction], mockContext)
      .returns([rawPercentageRestriction] as BTreeSetTransferCondition);
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

  it('should add a setTransferRestrictions transaction to the batch', async () => {
    let proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [rawPercentageRestriction],
        occupiedSlots: new BigNumber(0),
        needStat: false,
        currentStats: [] as unknown as BTreeSetStatType,
      }
    );

    let result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [{ Ticker: rawTicker }, [rawCountRestriction]],
        },
      ],
      resolver: new BigNumber(1),
    });

    proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [rawCountRestriction],
        occupiedSlots: new BigNumber(0),
        needStat: false,
        currentStats: [] as unknown as BTreeSetStatType,
      }
    );

    args = {
      ticker,
      restrictions: [{ percentage }],
      type: TransferRestrictionType.Percentage,
    };

    result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [{ Ticker: rawTicker }, [rawPercentageRestriction]],
        },
      ],
      resolver: new BigNumber(1),
    });
  });

  it('should add exempted identities if they were given', async () => {
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [],
        occupiedSlots: new BigNumber(0),
        needStat: false,
        currentStats: [] as unknown as BTreeSetStatType,
      }
    );

    const exemptedDids = ['0x1000', '0x2000', '0x3000'];
    const op = 'Count';

    scopeIdsToBtreeSetStub.returns(exemptedDids as unknown as BTreeSetIdentityId);

    statisticsOpTypeToStatOpTypeStub
      .withArgs(StatisticsOpType.Count, mockContext)
      .returns(op as unknown as PolymeshPrimitivesStatisticsStatOpType);

    args = {
      ticker,
      restrictions: [{ count, exemptedIdentities: exemptedDids }],
      type: TransferRestrictionType.Count,
    };

    const result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [{ Ticker: rawTicker }, [rawCountRestriction]],
        },
        {
          transaction: setEntitiesExemptTransaction,
          feeMultiplier: new BigNumber(3),
          args: [true, { asset: { Ticker: rawTicker }, op }, exemptedDids],
        },
      ],
      resolver: new BigNumber(1),
    });
  });

  it('should remove restrictions by adding a setTransferRestriction transaction to the batch', async () => {
    args = {
      type: TransferRestrictionType.Count,
      restrictions: [],
      ticker,
    };

    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [rawCountRestriction],
        occupiedSlots: new BigNumber(0),
        needStat: false,
        currentStats: [] as unknown as BTreeSetStatType,
      }
    );
    complianceConditionsToBtreeSetStub
      .withArgs([], mockContext)
      .returns([] as unknown as BTreeSetTransferCondition);

    const result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [{ Ticker: rawTicker }, []],
        },
      ],
      resolver: new BigNumber(0),
    });
  });

  it('should throw an error if attempting to add restrictions that already exist', async () => {
    let proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [rawCountRestriction],
        occupiedSlots: new BigNumber(0),
        needStat: false,
        currentStats: [] as unknown as BTreeSetStatType,
      }
    );

    let err;

    try {
      await prepareSetTransferRestrictions.call(proc, {
        ticker,
        restrictions: [{ count }],
        type: TransferRestrictionType.Count,
      });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('The supplied restrictions are already in place');

    proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [rawPercentageRestriction],
        occupiedSlots: new BigNumber(0),
        needStat: false,
        currentStats: [] as unknown as BTreeSetStatType,
      }
    );

    try {
      await prepareSetTransferRestrictions.call(proc, {
        ticker,
        restrictions: [{ percentage }],
        type: TransferRestrictionType.Percentage,
      });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('The supplied restrictions are already in place');
  });

  it('should throw an error if attempting to remove an empty restriction list', async () => {
    args = {
      ticker,
      restrictions: [],
      type: TransferRestrictionType.Count,
    };
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [],
        occupiedSlots: new BigNumber(0),
        needStat: false,
        currentStats: [] as unknown as BTreeSetStatType,
      }
    );
    let err;
    try {
      await prepareSetTransferRestrictions.call(proc, args);
    } catch (error) {
      err = error;
    }
    expect(err.message).toBe('There are no restrictions to remove');
  });

  it('should throw an error if attempting to add more restrictions than there are slots available', async () => {
    args = {
      ticker,
      restrictions: [{ count }, { count: new BigNumber(2) }],
      type: TransferRestrictionType.Count,
    };

    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [rawCountRestriction],
        occupiedSlots: new BigNumber(3),
        needStat: false,
        currentStats: [] as unknown as BTreeSetStatType,
      }
    );

    let err;

    try {
      await prepareSetTransferRestrictions.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe(
      'Cannot set more Transfer Restrictions than there are slots available'
    );
    expect(err.data).toEqual({ availableSlots: new BigNumber(0) });
  });

  it("should add a setActiveAssetStats transaction if a needed stat isn't set", async () => {
    dsMockUtils.createQueryStub('asset', 'balanceOf', {
      returnValue: ['one', 'two', 'three'],
    });

    statisticsOpTypeToStatTypeStub.returns(rawStatType);
    createStat2ndKeyStub.withArgs(mockContext).returns(raw2ndKey);
    rawStatUpdate = dsMockUtils.createMockStatUpdate();
    statUpdateStub.returns(rawStatUpdate);
    statUpdatesToBtreeStatUpdateStub
      .withArgs([rawStatUpdate], mockContext)
      .returns([rawStatUpdate] as BTreeSetStatUpdate);

    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [],
        occupiedSlots: new BigNumber(0),
        needStat: true,
        currentStats: [] as unknown as BTreeSetStatType,
      }
    );

    let result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setActiveAssetStatsTransaction,
          args: [{ Ticker: rawTicker }, [rawStatType]],
        },
        {
          transaction: batchUpdateAssetStatsTransaction,
          args: [{ Ticker: rawTicker }, rawStatType, [rawStatUpdate]],
        },
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [{ Ticker: rawTicker }, [rawCountRestriction]],
        },
      ],
      resolver: new BigNumber(1),
    });

    args = {
      ticker,
      restrictions: [{ percentage }],
      type: TransferRestrictionType.Percentage,
    };

    result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setActiveAssetStatsTransaction,
          args: [{ Ticker: rawTicker }, [rawStatType, rawStatType]],
        },
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [{ Ticker: rawTicker }, [rawPercentageRestriction]],
        },
      ],
      resolver: new BigNumber(1),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      let proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
        mockContext,
        {
          currentRestrictions: [],
          occupiedSlots: new BigNumber(0),
          needStat: false,
          currentStats: [] as unknown as BTreeSetStatType,
        }
      );

      let boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [TxTags.statistics.SetAssetTransferCompliance],
          portfolios: [],
        },
      });

      args.restrictions = [{ count, exemptedIdentities: ['0x1000'] }];

      proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
        mockContext,
        {
          currentRestrictions: [],
          occupiedSlots: new BigNumber(0),
          needStat: true,
          currentStats: [] as unknown as BTreeSetStatType,
        }
      );

      boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
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
    });
  });

  describe('prepareStorage', () => {
    let identityScopeId: string;

    let rawIdentityScopeId: ScopeId;

    const getCountStub = sinon.stub();
    const getPercentageStub = sinon.stub();

    beforeAll(() => {
      identityScopeId = 'someScopeId';

      rawIdentityScopeId = dsMockUtils.createMockScopeId(identityScopeId);
    });

    beforeEach(() => {
      stringToScopeIdStub.withArgs(identityScopeId, mockContext).returns(rawIdentityScopeId);

      getCountStub.resolves({
        restrictions: [{ count }],
        availableSlots: new BigNumber(1),
      });
      getPercentageStub.resolves({
        restrictions: [{ percentage }],
        availableSlots: new BigNumber(1),
      });
      entityMockUtils.configureMocks({
        identityOptions: {
          getScopeId: identityScopeId,
        },
        assetOptions: {
          transferRestrictionsCountGet: getCountStub,
          transferRestrictionsPercentageGet: getPercentageStub,
        },
      });

      dsMockUtils.createQueryStub('statistics', 'activeAssetStats', {
        returnValue: [],
      });
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should fetch, process and return shared data', async () => {
      const proc = procedureMockUtils.getInstance<
        SetTransferRestrictionsParams,
        BigNumber,
        Storage
      >(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      args = {
        ticker,
        type: TransferRestrictionType.Count,
        restrictions: [
          {
            count,
          },
        ],
      };

      let result = await boundFunc(args);

      expect(result).toEqual({
        currentRestrictions: [rawCountRestriction],
        occupiedSlots: new BigNumber(1),
        currentStats: [],
        needStat: true,
      });

      args = {
        ticker,
        type: TransferRestrictionType.Percentage,
        restrictions: [
          {
            percentage,
          },
        ],
      };

      result = await boundFunc(args);

      expect(result).toEqual({
        currentRestrictions: [rawPercentageRestriction],
        occupiedSlots: new BigNumber(1),
        currentStats: [],
        needStat: true,
      });

      args.restrictions = [];

      getCountStub.resolves({ restrictions: [{ count }], availableSlots: 1 });

      result = await boundFunc(args);

      getCountStub.resolves({
        restrictions: [{ count, exemptedIds: [exemptedDid] }],
        availableSlots: 1,
      });

      expect(result).toEqual({
        currentRestrictions: [rawPercentageRestriction],
        occupiedSlots: new BigNumber(1),
        needStat: true,
        currentStats: [],
      });
    });

    it('should detect when an asset stat does not need to be made', async () => {
      const mockCountStat = [{ type: StatisticsOpType.Count }];
      const mockBalanceStat = [{ type: StatisticsOpType.Balance }];
      dsMockUtils.createQueryStub('statistics', 'activeAssetStats', {
        returnValue: [mockCountStat, mockBalanceStat],
      });

      const proc = procedureMockUtils.getInstance<
        SetTransferRestrictionsParams,
        BigNumber,
        Storage
      >(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const statStub = sinon
        .stub(utilsConversionModule, 'meshStatToStatisticsOpType')
        .returns(StatisticsOpType.Count);

      let result = await boundFunc(args);

      expect(result).toEqual({
        currentRestrictions: [rawCountRestriction],
        occupiedSlots: new BigNumber(1),
        needStat: false,
        currentStats: [mockCountStat, mockBalanceStat],
      });

      statStub.returns(StatisticsOpType.Balance);

      result = await boundFunc(args);

      expect(result).toEqual({
        currentRestrictions: [rawCountRestriction],
        occupiedSlots: new BigNumber(1),
        needStat: true,
        currentStats: [mockCountStat, mockBalanceStat],
      });
    });
  });
});
