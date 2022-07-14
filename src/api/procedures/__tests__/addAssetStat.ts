import {
  PolymeshPrimitivesIdentityClaimClaimType,
  PolymeshPrimitivesIdentityId,
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

import { getAuthorization, prepareAddAssetStat } from '~/api/procedures/addAssetStat';
import { AddAssetStatParams, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ClaimType, CountryCode, ErrorCode, StatClaimType, StatType, TxTags } from '~/types';
import { PolymeshTx, StatisticsOpType, TickerKey } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('addAssetStat procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerKeyStub: sinon.SinonStub<[string, Context], TickerKey>;
  let ticker: string;
  let count: BigNumber;
  let rawTicker: PolymeshPrimitivesTicker;
  let args: AddAssetStatParams;
  let rawStatType: PolymeshPrimitivesStatisticsStatType;
  let rawStatBtreeSet: BTreeSet<PolymeshPrimitivesStatisticsStatType>;
  let rawStatUpdate: PolymeshPrimitivesStatisticsStatUpdate;
  let raw2ndKey: PolymeshPrimitivesStatisticsStat2ndKey;

  let addBatchTransactionStub: sinon.SinonStub;
  let setActiveAssetStatsTxStub: PolymeshTx<
    [PolymeshPrimitivesTicker, PolymeshPrimitivesTransferComplianceTransferCondition]
  >;
  let batchUpdateAssetStatsTxStub: PolymeshTx<
    [
      PolymeshPrimitivesTicker,
      PolymeshPrimitivesStatisticsStatType,
      BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>
    ]
  >;
  let statisticsOpTypeToStatOpTypeStub: sinon.SinonStub<
    [
      {
        op: PolymeshPrimitivesStatisticsStatOpType;
        claimIssuer?: [PolymeshPrimitivesIdentityClaimClaimType, PolymeshPrimitivesIdentityId];
      },
      Context
    ],
    PolymeshPrimitivesStatisticsStatType
  >;
  let statisticStatTypesToBtreeStatTypeStub: sinon.SinonStub<
    [PolymeshPrimitivesStatisticsStatType[], Context],
    BTreeSet<PolymeshPrimitivesStatisticsStatType>
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
  let statUpdateBtreeSet: BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>;
  let activeAssetStatsStub: sinon.SinonStub;
  let statStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    mockContext = dsMockUtils.getContextInstance();
    ticker = 'TICKER';
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
    activeAssetStatsStub.returns(dsMockUtils.createMockBTreeSet([]));
    statisticStatTypesToBtreeStatTypeStub = sinon.stub(
      utilsConversionModule,
      'statisticStatTypesToBtreeStatType'
    );
  });

  beforeEach(() => {
    statStub.returns(StatisticsOpType.Balance);
    addBatchTransactionStub = procedureMockUtils.getAddBatchTransactionStub();
    setActiveAssetStatsTxStub = dsMockUtils.createTxStub('statistics', 'setActiveAssetStats');
    batchUpdateAssetStatsTxStub = dsMockUtils.createTxStub('statistics', 'batchUpdateAssetStats');

    rawStatType = dsMockUtils.createMockStatisticsStatType();
    rawStatBtreeSet = dsMockUtils.createMockBTreeSet([rawStatType]);
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawStatUpdate = dsMockUtils.createMockStatUpdate();
    statUpdateBtreeSet = dsMockUtils.createMockBTreeSet([rawStatUpdate]);

    createStat2ndKeyStub.withArgs('NoClaimStat', mockContext, undefined).returns(raw2ndKey);
    statUpdatesToBtreeStatUpdateStub
      .withArgs([rawStatUpdate], mockContext)
      .returns(statUpdateBtreeSet);
    statisticsOpTypeToStatOpTypeStub.returns(rawStatType);

    stringToTickerKeyStub.withArgs(ticker, mockContext).returns({ Ticker: rawTicker });
    statisticStatTypesToBtreeStatTypeStub.returns(rawStatBtreeSet);
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
    const proc = procedureMockUtils.getInstance<AddAssetStatParams, void>(mockContext, {});

    await prepareAddAssetStat.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub.firstCall, {
      transactions: [
        {
          transaction: setActiveAssetStatsTxStub,
          args: [{ Ticker: rawTicker }, rawStatBtreeSet],
        },
      ],
    });

    args = {
      type: StatType.Count,
      ticker,
      count,
    };

    sinon.stub(utilsConversionModule, 'countStatInputToStatUpdates').returns(statUpdateBtreeSet);
    await prepareAddAssetStat.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub.secondCall, {
      transactions: [
        {
          transaction: setActiveAssetStatsTxStub,
          args: [{ Ticker: rawTicker }, rawStatBtreeSet],
        },
        {
          transaction: batchUpdateAssetStatsTxStub,
          args: [{ Ticker: rawTicker }, rawStatType, statUpdateBtreeSet],
        },
      ],
    });

    args = {
      type: StatType.ScopedCount,
      ticker,
      claimIssuer: {
        issuer: entityMockUtils.getIdentityInstance(),
        claimType: ClaimType.Accredited,
        value: {
          accredited: new BigNumber(1),
          nonAccredited: new BigNumber(2),
        },
      },
    };

    sinon
      .stub(utilsConversionModule, 'claimCountStatInputToStatUpdates')
      .returns(statUpdateBtreeSet);
    await prepareAddAssetStat.call(proc, args);
    sinon.assert.calledWith(addBatchTransactionStub.thirdCall, {
      transactions: [
        {
          transaction: setActiveAssetStatsTxStub,
          args: [{ Ticker: rawTicker }, rawStatBtreeSet],
        },
        {
          transaction: batchUpdateAssetStatsTxStub,
          args: [{ Ticker: rawTicker }, rawStatType, statUpdateBtreeSet],
        },
      ],
    });
  });

  it('should throw an error if the appropriate stat is not set', () => {
    const proc = procedureMockUtils.getInstance<AddAssetStatParams, void>(mockContext, {});
    args = {
      type: StatType.Balance,
      ticker,
    };

    activeAssetStatsStub.returns([rawStatType]);

    statStub.returns(StatisticsOpType.Balance);

    const expectedError = new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'Stat is already enabled',
    });

    return expect(prepareAddAssetStat.call(proc, args)).rejects.toThrowError(expectedError);
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      args = {
        ticker,
        count,
        type: StatType.Count,
      };

      const proc = procedureMockUtils.getInstance<AddAssetStatParams, void>(mockContext);
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
});
