import {
  PolymeshPrimitivesStatisticsStat2ndKey,
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
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  ClaimType,
  CountryCode,
  ErrorCode,
  RemoveAssetStatParams,
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
  let mockRemoveTarget: PolymeshPrimitivesStatisticsStatType;
  let mockRemoveTargetEqSub: sinon.SinonStub;
  let queryMultiStub: sinon.SinonStub;
  let queryMultiResult: [
    BTreeSet<PolymeshPrimitivesStatisticsStatType>,
    PolymeshPrimitivesTransferComplianceAssetTransferCompliance
  ];

  let setActiveAssetStats: PolymeshTx<
    [PolymeshPrimitivesTicker, PolymeshPrimitivesTransferComplianceTransferCondition]
  >;
  let statUpdatesToBtreeStatUpdateStub: sinon.SinonStub<
    [PolymeshPrimitivesStatisticsStatUpdate[], Context],
    BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>
  >;
  let statisticsOpTypeToStatTypeStub: sinon.SinonStub;
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

    statisticsOpTypeToStatTypeStub = sinon.stub(
      utilsConversionModule,
      'statisticsOpTypeToStatType'
    );
    statStub = sinon.stub(utilsConversionModule, 'meshStatToStatType');
    statisticStatTypesToBtreeStatTypeStub = sinon.stub(
      utilsConversionModule,
      'statisticStatTypesToBtreeStatType'
    );
    // queryMulti is mocked for the results, but query still needs to be stubbed to avoid dereference on undefined
    dsMockUtils.createQueryStub('statistics', 'activeAssetStats');
    queryMultiStub = dsMockUtils.getQueryMultiStub();
  });

  beforeEach(() => {
    statStub.returns(StatType.Balance);
    mockRemoveTarget = dsMockUtils.createMockStatisticsStatType();
    mockRemoveTargetEqSub = mockRemoveTarget.eq as sinon.SinonStub;
    setActiveAssetStats = dsMockUtils.createTxStub('statistics', 'setActiveAssetStats');

    rawCountStatType = dsMockUtils.createMockStatisticsStatType();
    rawBalanceStatType = dsMockUtils.createMockStatisticsStatType({
      op: dsMockUtils.createMockStatisticsOpType(StatType.Balance),
      claimIssuer: dsMockUtils.createMockOption(),
    });
    rawClaimCountStatType = dsMockUtils.createMockStatisticsStatType({
      op: dsMockUtils.createMockStatisticsOpType(StatType.ScopedCount),
      claimIssuer: dsMockUtils.createMockOption([
        dsMockUtils.createMockClaimType(),
        dsMockUtils.createMockIdentityId(),
      ]),
    });
    statBtreeSet = dsMockUtils.createMockBTreeSet([
      rawCountStatType,
      rawBalanceStatType,
      rawClaimCountStatType,
    ]);
    emptyStatTypeBtreeSet = dsMockUtils.createMockBTreeSet([]);
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
    statisticsOpTypeToStatTypeStub.returns(mockRemoveTarget);

    statUpdatesToBtreeStatUpdateStub
      .withArgs([rawStatUpdate], mockContext)
      .returns(rawStatUpdateBtree);
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
    mockRemoveTargetEqSub.returns(true);
    queryMultiStub.resolves([statBtreeSet, { requirements: [] }]);
    const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void>(mockContext);

    let result = await prepareRemoveAssetStat.call(proc, args);

    expect(result).toEqual({
      transaction: setActiveAssetStats,
      args: [{ Ticker: rawTicker }, emptyStatTypeBtreeSet],
      resolver: undefined,
    });

    args = {
      type: StatType.ScopedCount,
      ticker,
      issuer: entityMockUtils.getIdentityInstance(),
      claimType: ClaimType.Affiliate,
    };

    result = await prepareRemoveAssetStat.call(proc, args);

    expect(result).toEqual({
      transaction: setActiveAssetStats,
      args: [{ Ticker: rawTicker }, emptyStatTypeBtreeSet],
      resolver: undefined,
    });
  });

  it('should throw if the stat is not set', async () => {
    queryMultiStub.resolves([statBtreeSet, { requirements: [] }]);
    const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Cannot remove a stat that is not enabled for this Asset',
    });

    await expect(prepareRemoveAssetStat.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if the stat is being used', async () => {
    const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void>(mockContext);
    queryMultiStub.resolves([
      statBtreeSet,
      {
        requirements: dsMockUtils.createMockBTreeSet([
          rawCountCondition,
          rawPercentageCondition,
          rawClaimCountCondition,
        ]),
      },
    ]);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message:
        'The statistic cannot be removed because a Transfer Restriction is currently using it',
    });

    await expect(prepareRemoveAssetStat.call(proc, args)).rejects.toThrowError(expectedError);

    statStub.returns(StatType.Count);

    args = {
      ticker: 'TICKER',
      type: StatType.Count,
    };
    await expect(prepareRemoveAssetStat.call(proc, args)).rejects.toThrowError(expectedError);

    args = {
      ticker: 'TICKER',
      type: StatType.ScopedCount,
      issuer: entityMockUtils.getIdentityInstance({ did }),
      claimType: ClaimType.Accredited,
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
