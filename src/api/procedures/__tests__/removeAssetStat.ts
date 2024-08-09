import {
  PolymeshPrimitivesAssetAssetID,
  PolymeshPrimitivesStatisticsStat2ndKey,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesStatisticsStatUpdate,
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
  FungibleAsset,
  RemoveAssetStatParams,
  StatClaimType,
  StatType,
  TxTags,
} from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('removeAssetStat procedure', () => {
  const did = 'someDid';
  let mockContext: Mocked<Context>;
  let getAssetIdForStatsSpy: jest.SpyInstance;
  let assetId: string;
  let asset: FungibleAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetID;
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
  let queryMultiMock: jest.Mock;
  let queryMultiResult: [
    BTreeSet<PolymeshPrimitivesStatisticsStatType>,
    PolymeshPrimitivesTransferComplianceAssetTransferCompliance
  ];

  let setActiveAssetStats: PolymeshTx<
    [PolymeshPrimitivesAssetAssetID, PolymeshPrimitivesTransferComplianceTransferCondition]
  >;
  let statUpdatesToBtreeStatUpdateSpy: jest.SpyInstance<
    BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>,
    [PolymeshPrimitivesStatisticsStatUpdate[], Context]
  >;
  let statisticsOpTypeToStatTypeSpy: jest.SpyInstance;
  let createStat2ndKeySpy: jest.SpyInstance<
    PolymeshPrimitivesStatisticsStat2ndKey,
    [
      type: 'NoClaimStat' | StatClaimType,
      context: Context,
      claimStat?: CountryCode | 'yes' | 'no' | undefined
    ]
  >;
  let rawStatUpdateBtree: BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>;
  let statisticStatTypesToBtreeStatTypeSpy: jest.SpyInstance<
    BTreeSet<PolymeshPrimitivesStatisticsStatType>,
    [PolymeshPrimitivesStatisticsStatType[], Context]
  >;
  let statSpy: jest.SpyInstance;
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
    assetId = '0x1234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    getAssetIdForStatsSpy = jest.spyOn(utilsInternalModule, 'getAssetIdForStats');
    createStat2ndKeySpy = jest.spyOn(utilsConversionModule, 'createStat2ndKey');
    statUpdatesToBtreeStatUpdateSpy = jest.spyOn(
      utilsConversionModule,
      'statUpdatesToBtreeStatUpdate'
    );
    dsMockUtils.setConstMock('statistics', 'maxTransferConditionsPerAsset', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(3)),
    });

    statisticsOpTypeToStatTypeSpy = jest.spyOn(utilsConversionModule, 'statisticsOpTypeToStatType');
    statSpy = jest.spyOn(utilsConversionModule, 'meshStatToStatType');
    statisticStatTypesToBtreeStatTypeSpy = jest.spyOn(
      utilsConversionModule,
      'statisticStatTypesToBtreeStatType'
    );
    // queryMulti is mocked for the results, but query still needs to be mocked to avoid dereference on undefined
    dsMockUtils.createQueryMock('statistics', 'activeAssetStats');
    queryMultiMock = dsMockUtils.getQueryMultiMock();
  });

  beforeEach(() => {
    statSpy.mockReturnValue(StatType.Balance);
    mockRemoveTarget = dsMockUtils.createMockStatisticsStatType();
    mockRemoveTargetEqSub = mockRemoveTarget.eq as jest.Mock;
    setActiveAssetStats = dsMockUtils.createTxMock('statistics', 'setActiveAssetStats');

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
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
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

    when(createStat2ndKeySpy)
      .calledWith('NoClaimStat', mockContext, undefined)
      .mockReturnValue(raw2ndKey);
    statisticsOpTypeToStatTypeSpy.mockReturnValue(mockRemoveTarget);

    when(statUpdatesToBtreeStatUpdateSpy)
      .calledWith([rawStatUpdate], mockContext)
      .mockReturnValue(rawStatUpdateBtree);
    queryMultiResult = [dsMockUtils.createMockBTreeSet([]), fakeCurrentRequirements];
    queryMultiMock.mockReturnValue(queryMultiResult);

    when(getAssetIdForStatsSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
    statisticStatTypesToBtreeStatTypeSpy.mockReturnValue(emptyStatTypeBtreeSet);
    args = {
      type: StatType.Balance,
      asset,
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
    queryMultiMock.mockResolvedValue([statBtreeSet, { requirements: [] }]);
    const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void>(mockContext);

    let result = await prepareRemoveAssetStat.call(proc, args);

    expect(result).toEqual({
      transaction: setActiveAssetStats,
      args: [rawAssetId, emptyStatTypeBtreeSet],
      resolver: undefined,
    });

    args = {
      type: StatType.ScopedCount,
      asset,
      issuer: entityMockUtils.getIdentityInstance(),
      claimType: ClaimType.Affiliate,
    };

    result = await prepareRemoveAssetStat.call(proc, args);

    expect(result).toEqual({
      transaction: setActiveAssetStats,
      args: [rawAssetId, emptyStatTypeBtreeSet],
      resolver: undefined,
    });
  });

  it('should throw if the stat is not set', async () => {
    queryMultiMock.mockResolvedValue([statBtreeSet, { requirements: [] }]);
    const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Cannot remove a stat that is not enabled for this Asset',
    });

    await expect(prepareRemoveAssetStat.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if the stat is being used', async () => {
    const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void>(mockContext);
    queryMultiMock.mockResolvedValue([
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

    statSpy.mockReturnValue(StatType.Count);

    args = {
      asset,
      type: StatType.Count,
    };
    await expect(prepareRemoveAssetStat.call(proc, args)).rejects.toThrowError(expectedError);

    args = {
      asset,
      type: StatType.ScopedCount,
      issuer: entityMockUtils.getIdentityInstance({ did }),
      claimType: ClaimType.Accredited,
    };

    await expect(prepareRemoveAssetStat.call(proc, args)).rejects.toThrowError(expectedError);
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      args = {
        asset,
        type: StatType.Count,
      };

      const proc = procedureMockUtils.getInstance<RemoveAssetStatParams, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ id: assetId })],
          transactions: [TxTags.statistics.SetActiveAssetStats],
          portfolios: [],
        },
      });
    });
  });
});
