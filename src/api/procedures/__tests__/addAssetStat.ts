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
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  AddAssetStatParams,
  ClaimType,
  CountryCode,
  ErrorCode,
  StatClaimType,
  StatType,
  TxTags,
} from '~/types';
import { PolymeshTx, TickerKey } from '~/types/internal';
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
    statStub = sinon.stub(utilsConversionModule, 'meshStatToStatType');
    activeAssetStatsStub = dsMockUtils.createQueryStub('statistics', 'activeAssetStats');
    activeAssetStatsStub.returns(dsMockUtils.createMockBTreeSet([]));
    statisticStatTypesToBtreeStatTypeStub = sinon.stub(
      utilsConversionModule,
      'statisticStatTypesToBtreeStatType'
    );
  });

  beforeEach(() => {
    statStub.returns(StatType.Balance);
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

    let result = await prepareAddAssetStat.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setActiveAssetStatsTxStub,
          args: [{ Ticker: rawTicker }, rawStatBtreeSet],
        },
      ],
      resolver: undefined,
    });

    args = {
      type: StatType.Count,
      ticker,
      count,
    };

    sinon.stub(utilsConversionModule, 'countStatInputToStatUpdates').returns(statUpdateBtreeSet);
    result = await prepareAddAssetStat.call(proc, args);

    expect(result).toEqual({
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
      resolver: undefined,
    });

    args = {
      type: StatType.ScopedCount,
      ticker,
      issuer: entityMockUtils.getIdentityInstance(),
      claimType: ClaimType.Accredited,
      value: {
        accredited: new BigNumber(1),
        nonAccredited: new BigNumber(2),
      },
    };

    sinon
      .stub(utilsConversionModule, 'claimCountStatInputToStatUpdates')
      .returns(statUpdateBtreeSet);

    result = await prepareAddAssetStat.call(proc, args);

    expect(result).toEqual({
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
      resolver: undefined,
    });
  });

  it('should throw an error if the appropriate stat is not set', () => {
    const proc = procedureMockUtils.getInstance<AddAssetStatParams, void>(mockContext, {});
    args = {
      type: StatType.Balance,
      ticker,
    };

    activeAssetStatsStub.returns([rawStatType]);

    statStub.returns(StatType.Balance);

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
