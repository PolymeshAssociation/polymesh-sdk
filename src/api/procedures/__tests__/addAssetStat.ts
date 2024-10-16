import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesIdentityClaimClaimType,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesStatisticsStat2ndKey,
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesStatisticsStatUpdate,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import { BTreeSet } from '@polkadot/types-codec';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { getAuthorization, prepareAddAssetStat } from '~/api/procedures/addAssetStat';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  AddAssetStatParams,
  ClaimType,
  CountryCode,
  ErrorCode,
  FungibleAsset,
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

describe('addAssetStat procedure', () => {
  let mockContext: Mocked<Context>;
  let getAssetIdForStatsSpy: jest.SpyInstance;
  let assetId: string;
  let asset: FungibleAsset;
  let count: BigNumber;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let args: AddAssetStatParams;
  let rawStatType: PolymeshPrimitivesStatisticsStatType;
  let rawStatBtreeSet: BTreeSet<PolymeshPrimitivesStatisticsStatType>;
  let rawStatUpdate: PolymeshPrimitivesStatisticsStatUpdate;
  let raw2ndKey: PolymeshPrimitivesStatisticsStat2ndKey;

  let setActiveAssetStatsTxMock: PolymeshTx<
    [PolymeshPrimitivesAssetAssetId, PolymeshPrimitivesTransferComplianceTransferCondition]
  >;
  let batchUpdateAssetStatsTxMock: PolymeshTx<
    [
      PolymeshPrimitivesAssetAssetId,
      PolymeshPrimitivesStatisticsStatType,
      BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>
    ]
  >;
  let statisticsOpTypeToStatOpTypeSpy: jest.SpyInstance<
    PolymeshPrimitivesStatisticsStatType,
    [
      {
        operationType: PolymeshPrimitivesStatisticsStatOpType;
        claimIssuer?: [PolymeshPrimitivesIdentityClaimClaimType, PolymeshPrimitivesIdentityId];
      },
      Context
    ]
  >;
  let statisticStatTypesToBtreeStatTypeSpy: jest.SpyInstance<
    BTreeSet<PolymeshPrimitivesStatisticsStatType>,
    [PolymeshPrimitivesStatisticsStatType[], Context]
  >;
  let statUpdatesToBtreeStatUpdateSpy: jest.SpyInstance<
    BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>,
    [PolymeshPrimitivesStatisticsStatUpdate[], Context]
  >;
  let createStat2ndKeySpy: jest.SpyInstance<
    PolymeshPrimitivesStatisticsStat2ndKey,
    [
      type: 'NoClaimStat' | StatClaimType,
      context: Context,
      claimStat?: CountryCode | 'yes' | 'no' | undefined
    ]
  >;
  let statUpdateBtreeSet: BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>;
  let activeAssetStatsMock: jest.Mock;
  let statSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    mockContext = dsMockUtils.getContextInstance();
    assetId = '0x1234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    count = new BigNumber(10);
    getAssetIdForStatsSpy = jest.spyOn(utilsInternalModule, 'getAssetIdForStats');
    createStat2ndKeySpy = jest.spyOn(utilsConversionModule, 'createStat2ndKey');
    statisticsOpTypeToStatOpTypeSpy = jest.spyOn(
      utilsConversionModule,
      'statisticsOpTypeToStatType'
    );
    statUpdatesToBtreeStatUpdateSpy = jest.spyOn(
      utilsConversionModule,
      'statUpdatesToBtreeStatUpdate'
    );
    dsMockUtils.setConstMock('statistics', 'maxTransferConditionsPerAsset', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(3)),
    });
    statSpy = jest.spyOn(utilsConversionModule, 'meshStatToStatType');
    activeAssetStatsMock = dsMockUtils.createQueryMock('statistics', 'activeAssetStats');
    activeAssetStatsMock.mockReturnValue(dsMockUtils.createMockBTreeSet([]));
    statisticStatTypesToBtreeStatTypeSpy = jest.spyOn(
      utilsConversionModule,
      'statisticStatTypesToBtreeStatType'
    );
  });

  beforeEach(() => {
    statSpy.mockReturnValue(StatType.Balance);
    setActiveAssetStatsTxMock = dsMockUtils.createTxMock('statistics', 'setActiveAssetStats');
    batchUpdateAssetStatsTxMock = dsMockUtils.createTxMock('statistics', 'batchUpdateAssetStats');

    rawStatType = dsMockUtils.createMockStatisticsStatType();
    rawStatBtreeSet = dsMockUtils.createMockBTreeSet([rawStatType]);
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    rawStatUpdate = dsMockUtils.createMockStatUpdate();
    statUpdateBtreeSet = dsMockUtils.createMockBTreeSet([rawStatUpdate]);

    when(createStat2ndKeySpy)
      .calledWith('NoClaimStat', mockContext, undefined)
      .mockReturnValue(raw2ndKey);
    when(statUpdatesToBtreeStatUpdateSpy)
      .calledWith([rawStatUpdate], mockContext)
      .mockReturnValue(statUpdateBtreeSet);
    statisticsOpTypeToStatOpTypeSpy.mockReturnValue(rawStatType);

    when(getAssetIdForStatsSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
    statisticStatTypesToBtreeStatTypeSpy.mockReturnValue(rawStatBtreeSet);
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

  it('should add an setAssetStats transaction to the queue', async () => {
    args = {
      type: StatType.Balance,
      asset,
    };
    const proc = procedureMockUtils.getInstance<AddAssetStatParams, void>(mockContext, {});

    let result = await prepareAddAssetStat.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setActiveAssetStatsTxMock,
          args: [rawAssetId, rawStatBtreeSet],
        },
      ],
      resolver: undefined,
    });

    args = {
      type: StatType.Count,
      asset,
      count,
    };

    jest
      .spyOn(utilsConversionModule, 'countStatInputToStatUpdates')
      .mockReturnValue(statUpdateBtreeSet);
    result = await prepareAddAssetStat.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setActiveAssetStatsTxMock,
          args: [rawAssetId, rawStatBtreeSet],
        },
        {
          transaction: batchUpdateAssetStatsTxMock,
          args: [rawAssetId, rawStatType, statUpdateBtreeSet],
        },
      ],
      resolver: undefined,
    });

    args = {
      type: StatType.ScopedCount,
      asset,
      issuer: entityMockUtils.getIdentityInstance(),
      claimType: ClaimType.Accredited,
      value: {
        accredited: new BigNumber(1),
        nonAccredited: new BigNumber(2),
      },
    };

    jest
      .spyOn(utilsConversionModule, 'claimCountStatInputToStatUpdates')
      .mockReturnValue(statUpdateBtreeSet);

    result = await prepareAddAssetStat.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setActiveAssetStatsTxMock,
          args: [rawAssetId, rawStatBtreeSet],
        },
        {
          transaction: batchUpdateAssetStatsTxMock,
          args: [rawAssetId, rawStatType, statUpdateBtreeSet],
        },
      ],
      resolver: undefined,
    });
  });

  it('should throw an error if the appropriate stat is not set', () => {
    const proc = procedureMockUtils.getInstance<AddAssetStatParams, void>(mockContext, {});
    args = {
      type: StatType.Balance,
      asset,
    };

    activeAssetStatsMock.mockReturnValue([rawStatType]);

    statSpy.mockReturnValue(StatType.Balance);

    const expectedError = new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'Stat is already enabled',
    });

    return expect(prepareAddAssetStat.call(proc, args)).rejects.toThrowError(expectedError);
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      args = {
        asset,
        count,
        type: StatType.Count,
      };

      const proc = procedureMockUtils.getInstance<AddAssetStatParams, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [asset],
          transactions: [
            TxTags.statistics.SetActiveAssetStats,
            TxTags.statistics.BatchUpdateAssetStats,
          ],
          portfolios: [],
        },
      });
      expect(boundFunc({ asset, type: StatType.Balance })).toEqual({
        permissions: {
          assets: [asset],
          transactions: [TxTags.statistics.SetActiveAssetStats],
          portfolios: [],
        },
      });
    });
  });
});
