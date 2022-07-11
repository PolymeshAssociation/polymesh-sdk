import {
  PolymeshPrimitivesStatisticsStat2ndKey,
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesStatisticsStatUpdate,
  PolymeshPrimitivesTicker,
  PolymeshPrimitivesTransferComplianceAssetTransferCompliance,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import { BTreeSet } from '@polkadot/types-codec';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { getAuthorization, prepareRemoveAssetStat } from '~/api/procedures/removeAssetStat';
import { Context, PolymeshError, RemoveAssetStatParams } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ClaimType, CountryCode, ErrorCode, StatClaimType, TxTags } from '~/types';
import { PolymeshTx, StatisticsOpType, StatType, TickerKey } from '~/types/internal';
import { Mutable } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('removeAssetStat procedure', () => {
  const did = 'someDid';
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
  let rawCountCondition: PolymeshPrimitivesTransferComplianceTransferCondition;
  let rawPercentageCondition: PolymeshPrimitivesTransferComplianceTransferCondition;
  let rawClaimCountCondition: PolymeshPrimitivesTransferComplianceTransferCondition;
  let queryMultiStub: sinon.SinonStub;
  let queryMultiResult: [
    BTreeSet<PolymeshPrimitivesStatisticsStatType>,
    PolymeshPrimitivesTransferComplianceAssetTransferCompliance
  ];

  let addTransactionStub: sinon.SinonStub;
  let setActiveAssetStats: PolymeshTx<
    [PolymeshPrimitivesTicker, PolymeshPrimitivesTransferComplianceTransferCondition]
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
  let rawStatUpdateBtree: BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>;
  let statisticStatTypesToBtreeStatTypeStub: sinon.SinonStub<
    [PolymeshPrimitivesStatisticsStatType[], Context],
    BTreeSet<PolymeshPrimitivesStatisticsStatType>
  >;
  let statStub: sinon.SinonStub;
  let emptyStatTypeBtreeSet: BTreeSet<PolymeshPrimitivesStatisticsStatType>;
  let statBtreeSet: BTreeSet<PolymeshPrimitivesStatisticsStatType>;

  const fakeCurrentRequirements: PolymeshPrimitivesTransferComplianceAssetTransferCompliance =
    dsMockUtils.createMockAssetTransferCompliance({
      paused: dsMockUtils.createMockBool(false),
      requirements:
        dsMockUtils.createMockBTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>([
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
              dsMockUtils.createMockIdentityId(did),
              dsMockUtils.createMockU64(new BigNumber(20)),
              dsMockUtils.createMockOption(),
            ],
          }),
        ]),
    });

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    mockContext = dsMockUtils.getContextInstance();
    ticker = 'TICKER';
    stringToTickerKeyStub = sinon.stub(utilsConversionModule, 'stringToTickerKey');
    createStat2ndKeyStub = sinon.stub(utilsConversionModule, 'createStat2ndKey');
    statUpdatesToBtreeStatUpdateStub = sinon.stub(
      utilsConversionModule,
      'statUpdatesToBtreeStatUpdate'
    );
    dsMockUtils.setConstMock('statistics', 'maxTransferConditionsPerAsset', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(3)),
    });
    statStub = sinon.stub(utilsConversionModule, 'meshStatToStatisticsOpType');
    statisticStatTypesToBtreeStatTypeStub = sinon.stub(
      utilsConversionModule,
      'statisticStatTypesToBtreeStatType'
    );
    // queryMulti is mocked for the results, but query still needs to be stubbed to avoid dereference on undefined
    dsMockUtils.createQueryStub('statistics', 'activeAssetStats');
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

    rawCountCondition = dsMockUtils.createMockTransferCondition({
      MaxInvestorCount: dsMockUtils.createMockU64(new BigNumber(10)),
    });
    rawPercentageCondition = dsMockUtils.createMockTransferCondition({
      MaxInvestorOwnership: dsMockUtils.createMockU64(new BigNumber(10)),
    });
    rawClaimCountCondition = dsMockUtils.createMockTransferCondition({
      ClaimCount: [
        dsMockUtils.createMockStatisticsStatClaim({
          Accredited: dsMockUtils.createMockBool(true),
        }),
        dsMockUtils.createMockIdentityId(did),
        dsMockUtils.createMockU64(),
        dsMockUtils.createMockOption(),
      ],
    });

    createStat2ndKeyStub.withArgs('NoClaimStat', mockContext, undefined).returns(raw2ndKey);

    statUpdatesToBtreeStatUpdateStub
      .withArgs([rawStatUpdate], mockContext)
      .returns(rawStatUpdateBtree);
    queryMultiStub = dsMockUtils.getQueryMultiStub();
    queryMultiResult = [dsMockUtils.createMockBTreeSet([]), fakeCurrentRequirements];
    queryMultiStub.returns(queryMultiResult);

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

  it('should add a setAssetStats transaction to the queue', async () => {
    (rawCountStatType.eq as sinon.SinonStub).returns(true);
    queryMultiStub.returns([statBtreeSet, fakeCurrentRequirements]);
    const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void>(mockContext);

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
    // queryMultiResult = [emptyStatTypeBtreeSet, fakeCurrentRequirements];
    queryMultiStub.returns([emptyStatTypeBtreeSet, { requirements: [] }]);
    const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Cannot remove a stat that is not enabled for this Asset',
    });

    return expect(prepareRemoveAssetStat.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if the stat is being used', async () => {
    const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void>(mockContext);

    (queryMultiResult[1].requirements as Mutable<
      BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>
    >) = dsMockUtils.createMockBTreeSet([
      rawCountCondition,
      rawPercentageCondition,
      rawClaimCountCondition,
    ]);

    queryMultiStub.returns(queryMultiResult);

    statStub.returns(StatisticsOpType.Balance);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message:
        'The statistic cannot be removed because a TransferRestriction is currently using it',
    });

    await expect(prepareRemoveAssetStat.call(proc, args)).rejects.toThrowError(expectedError);

    statStub.returns(StatisticsOpType.Count);

    args = {
      ticker: 'TICKER',
      type: StatType.Count,
    };
    await expect(prepareRemoveAssetStat.call(proc, args)).rejects.toThrowError(expectedError);

    statStub.returns(StatisticsOpType.ClaimCount);
    args = {
      ticker: 'TICKER',
      type: StatType.ScopedCount,
      claimIssuer: {
        issuer: entityMockUtils.getIdentityInstance({ did }),
        claimType: ClaimType.Accredited,
      },
    };
    await expect(prepareRemoveAssetStat.call(proc, args)).rejects.toThrowError(expectedError);
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      args = {
        ticker,
        type: StatType.Count,
      };

      const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void>(mockContext);
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
});
