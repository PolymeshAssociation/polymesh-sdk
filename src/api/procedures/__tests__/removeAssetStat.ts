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
import { when } from 'jest-when';

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
  let stringToTickerKeyStub: jest.SpyInstance<TickerKey, [string, Context]>;
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
  let mockRemoveTargetEqSub: jest.Mock;
  let queryMultiStub: jest.Mock;
  let queryMultiResult: [
    BTreeSet<PolymeshPrimitivesStatisticsStatType>,
    PolymeshPrimitivesTransferComplianceAssetTransferCompliance
  ];

  let setActiveAssetStats: PolymeshTx<
    [PolymeshPrimitivesTicker, PolymeshPrimitivesTransferComplianceTransferCondition]
  >;
  let statUpdatesToBtreeStatUpdateStub: jest.SpyInstance<
    BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>,
    [PolymeshPrimitivesStatisticsStatUpdate[], Context]
  >;
  let statisticsOpTypeToStatTypeStub: jest.SpyInstance;
  let createStat2ndKeyStub: jest.SpyInstance<
    PolymeshPrimitivesStatisticsStat2ndKey,
    [
      type: 'NoClaimStat' | StatClaimType,
      context: Context,
      claimStat?: CountryCode | 'yes' | 'no' | undefined
    ]
  >;
  let rawStatUpdateBtree: BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>;
  let statisticStatTypesToBtreeStatTypeStub: jest.SpyInstance<
    BTreeSet<PolymeshPrimitivesStatisticsStatType>,
    [PolymeshPrimitivesStatisticsStatType[], Context]
  >;
  let statStub: jest.SpyInstance;
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
    stringToTickerKeyStub = jest.spyOn(utilsConversionModule, 'stringToTickerKey');
    createStat2ndKeyStub = jest.spyOn(utilsConversionModule, 'createStat2ndKey');
    statUpdatesToBtreeStatUpdateStub = jest.spyOn(
      utilsConversionModule,
      'statUpdatesToBtreeStatUpdate'
    );
    dsMockUtils.setConstMock('statistics', 'maxTransferConditionsPerAsset', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(3)),
    });

    statisticsOpTypeToStatTypeStub = jest.spyOn(
      utilsConversionModule,
      'statisticsOpTypeToStatType'
    );
    statStub = jest.spyOn(utilsConversionModule, 'meshStatToStatType');
    statisticStatTypesToBtreeStatTypeStub = jest.spyOn(
      utilsConversionModule,
      'statisticStatTypesToBtreeStatType'
    );
    // queryMulti is mocked for the results, but query still needs to be stubbed to avoid dereference on undefined
    dsMockUtils.createQueryStub('statistics', 'activeAssetStats');
    queryMultiStub = dsMockUtils.getQueryMultiStub();
  });

  beforeEach(() => {
    statStub.mockReturnValue(StatType.Balance);
    mockRemoveTarget = dsMockUtils.createMockStatisticsStatType();
    mockRemoveTargetEqSub = mockRemoveTarget.eq as jest.Mock;
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

    when(createStat2ndKeyStub)
      .calledWith('NoClaimStat', mockContext, undefined)
      .mockReturnValue(raw2ndKey);
    statisticsOpTypeToStatTypeStub.mockReturnValue(mockRemoveTarget);

    when(statUpdatesToBtreeStatUpdateStub)
      .calledWith([rawStatUpdate], mockContext)
      .mockReturnValue(rawStatUpdateBtree);
    queryMultiResult = [dsMockUtils.createMockBTreeSet([]), fakeCurrentRequirements];
    queryMultiStub.mockReturnValue(queryMultiResult);

    when(stringToTickerKeyStub)
      .calledWith(ticker, mockContext)
      .mockReturnValue({ Ticker: rawTicker });
    statisticStatTypesToBtreeStatTypeStub.mockReturnValue(emptyStatTypeBtreeSet);
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
    jest.restoreAllMocks();
  });

  it('should add a setAssetStats transaction to the queue', async () => {
    mockRemoveTargetEqSub.mockReturnValue(true);
    queryMultiStub.mockResolvedValue([statBtreeSet, { requirements: [] }]);
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
    queryMultiStub.mockResolvedValue([statBtreeSet, { requirements: [] }]);
    const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Cannot remove a stat that is not enabled for this Asset',
    });

    await expect(prepareRemoveAssetStat.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if the stat is being used', async () => {
    const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void>(mockContext);
    queryMultiStub.mockResolvedValue([
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

    statStub.mockReturnValue(StatType.Count);

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
