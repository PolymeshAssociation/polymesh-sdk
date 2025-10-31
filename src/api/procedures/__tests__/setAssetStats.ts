import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesIdentityClaimClaimType,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesStatisticsStatUpdate,
} from '@polkadot/types/lookup';
import { BTreeSet } from '@polkadot/types-codec';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  prepareSetAssetStats,
  prepareStorage,
  SetAssetStatParams,
  SetAssetStatsStorage,
} from '~/api/procedures/setAssetStats';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ClaimType, CountryCode, FungibleAsset, StatType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('setAssetStats procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let assetId: string;
  let asset: FungibleAsset;
  let count: BigNumber;
  let balance: BigNumber;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let args: SetAssetStatParams;
  let rawStatType: PolymeshPrimitivesStatisticsStatType;
  let rawStatUpdate: PolymeshPrimitivesStatisticsStatUpdate;

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
  let statTypeToStatOpTypeSpy: jest.SpyInstance;
  let statUpdatesToBtreeStatUpdateSpy: jest.SpyInstance<
    BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>,
    [PolymeshPrimitivesStatisticsStatUpdate[], Context]
  >;
  let statUpdateBtreeSet: BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>;
  let emptyStatUpdateBtreeSet: BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>;
  let activeAssetStatsMock: jest.Mock;
  let assetStatToStatSpy: jest.SpyInstance;
  let countStatInputToStatUpdatesSpy: jest.SpyInstance;
  let balanceStatInputToStatUpdatesSpy: jest.SpyInstance;
  let claimCountStatInputToStatUpdatesSpy: jest.SpyInstance;
  let claimBalanceStatInputToStatUpdatesSpy: jest.SpyInstance;
  let statParamsToMeshStatTypeSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    mockContext = dsMockUtils.getContextInstance();
    assetId = '0x12341234123412341234123412341234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    count = new BigNumber(10);
    balance = new BigNumber(1000);
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    statisticsOpTypeToStatOpTypeSpy = jest.spyOn(
      utilsConversionModule,
      'statisticsOpTypeToStatType'
    ) as jest.SpyInstance<
      PolymeshPrimitivesStatisticsStatType,
      [
        {
          operationType: PolymeshPrimitivesStatisticsStatOpType;
          claimIssuer?: [PolymeshPrimitivesIdentityClaimClaimType, PolymeshPrimitivesIdentityId];
        },
        Context
      ]
    >;
    statUpdatesToBtreeStatUpdateSpy = jest.spyOn(
      utilsConversionModule,
      'statUpdatesToBtreeStatUpdate'
    );
    dsMockUtils.setConstMock('statistics', 'maxTransferConditionsPerAsset', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(3)),
    });
    assetStatToStatSpy = jest.spyOn(utilsConversionModule, 'assetStatToStat');
    activeAssetStatsMock = dsMockUtils.createQueryMock('statistics', 'activeAssetStats');
    statisticStatTypesToBtreeStatTypeSpy = jest.spyOn(
      utilsConversionModule,
      'statisticStatTypesToBtreeStatType'
    );
    statTypeToStatOpTypeSpy = jest.spyOn(utilsConversionModule, 'statTypeToStatOpType');
    statParamsToMeshStatTypeSpy = jest.spyOn(utilsConversionModule, 'statParamsToMeshStatType');
    countStatInputToStatUpdatesSpy = jest.spyOn(
      utilsConversionModule,
      'countStatInputToStatUpdates'
    );
    balanceStatInputToStatUpdatesSpy = jest.spyOn(
      utilsConversionModule,
      'balanceStatInputToStatUpdates'
    );
    claimCountStatInputToStatUpdatesSpy = jest.spyOn(
      utilsConversionModule,
      'claimCountStatInputToStatUpdates'
    );
    claimBalanceStatInputToStatUpdatesSpy = jest.spyOn(
      utilsConversionModule,
      'claimBalanceStatInputToStatUpdates'
    );
  });

  beforeEach(() => {
    dsMockUtils.createTxMock('statistics', 'setActiveAssetStats');
    dsMockUtils.createTxMock('statistics', 'batchUpdateAssetStats');

    rawStatType = dsMockUtils.createMockStatisticsStatType();
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    rawStatUpdate = dsMockUtils.createMockStatUpdate();
    statUpdateBtreeSet = dsMockUtils.createMockBtreeSet([rawStatUpdate]);
    emptyStatUpdateBtreeSet = dsMockUtils.createMockBtreeSet([]);

    when(statUpdatesToBtreeStatUpdateSpy)
      .calledWith([rawStatUpdate], mockContext)
      .mockReturnValue(statUpdateBtreeSet);
    when(statUpdatesToBtreeStatUpdateSpy)
      .calledWith([], mockContext)
      .mockReturnValue(emptyStatUpdateBtreeSet);

    statisticsOpTypeToStatOpTypeSpy.mockReturnValue(rawStatType);

    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);

    statTypeToStatOpTypeSpy.mockReturnValue(dsMockUtils.createMockStatisticsOpType());
    statParamsToMeshStatTypeSpy.mockReturnValue(rawStatType);
    statisticStatTypesToBtreeStatTypeSpy.mockImplementation(() => {
      const btreeSet = dsMockUtils.createMockBtreeSet([rawStatType]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return btreeSet as any;
    });

    // Default: return empty BTreeSet for all stat conversion functions
    countStatInputToStatUpdatesSpy.mockReturnValue(emptyStatUpdateBtreeSet);
    balanceStatInputToStatUpdatesSpy.mockReturnValue(emptyStatUpdateBtreeSet);
    claimCountStatInputToStatUpdatesSpy.mockReturnValue(emptyStatUpdateBtreeSet);
    claimBalanceStatInputToStatUpdatesSpy.mockReturnValue(emptyStatUpdateBtreeSet);

    // Default: no active stats
    activeAssetStatsMock.mockReturnValue(dsMockUtils.createMockBtreeSet([]));
    assetStatToStatSpy.mockReturnValue({ type: StatType.Count });
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

  describe('prepareStorage', () => {
    it('should query and return current active stats', async () => {
      const rawMockStats = [rawStatType];
      const mockBtreeSet = dsMockUtils.createMockBtreeSet(rawMockStats);
      activeAssetStatsMock.mockReturnValue(mockBtreeSet);

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext
      );

      const result = await prepareStorage.call(proc, { asset, stats: [] });

      expect(result).toEqual({
        currentStats: mockBtreeSet,
      });
      expect(activeAssetStatsMock).toHaveBeenCalledWith(rawAssetId);
    });
  });

  describe('prepareSetAssetStats', () => {
    it('should add Balance stat without value (no update transaction)', async () => {
      args = {
        stats: [{ type: StatType.Balance }],
        asset,
      };
      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

      const result = await prepareSetAssetStats.call(proc, args);

      expect(result.resolver).toBeUndefined();
      expect(result.transactions).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tx = result.transactions[0]!;
      expect(typeof tx.transaction).toBe('function');
      expect(tx.args).toHaveLength(2);
      expect(tx.args[0]).toBe(rawAssetId);
      expect(statisticStatTypesToBtreeStatTypeSpy).toHaveBeenCalledWith([rawStatType], mockContext);
      const btreeSet = tx.args[1] as BTreeSet<PolymeshPrimitivesStatisticsStatType>;
      expect(btreeSet).toBeDefined();
      expect(btreeSet.isEmpty).toBe(false);
      expect(btreeSet.size).toBe(1);
      expect(statParamsToMeshStatTypeSpy).toHaveBeenCalledWith(
        { type: StatType.Balance },
        mockContext
      );
    });

    it('should add Balance stat with value', async () => {
      args = {
        asset,
        stats: [
          {
            type: StatType.Balance,
            balance,
          },
        ],
      };

      balanceStatInputToStatUpdatesSpy.mockReturnValue(statUpdateBtreeSet);

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

      const result = await prepareSetAssetStats.call(proc, args);

      expect(result.resolver).toBeUndefined();
      expect(result.transactions).toHaveLength(2);

      // First transaction: SetActiveAssetStats
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tx0 = result.transactions[0]!;
      expect(typeof tx0.transaction).toBe('function');
      expect(tx0.args).toHaveLength(2);
      expect(tx0.args[0]).toBe(rawAssetId);
      // Verify the BTreeSet of stat types was created and passed
      expect(statisticStatTypesToBtreeStatTypeSpy).toHaveBeenCalledWith([rawStatType], mockContext);
      const btreeSet = tx0.args[1] as BTreeSet<PolymeshPrimitivesStatisticsStatType>;
      expect(btreeSet).toBeDefined();
      expect(btreeSet.isEmpty).toBe(false);
      expect(btreeSet.size).toBe(1);

      // Second transaction: BatchUpdateAssetStats
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tx1 = result.transactions[1]!;
      expect(typeof tx1.transaction).toBe('function');
      expect(tx1.args).toHaveLength(3);
      expect(tx1.args[0]).toBe(rawAssetId);
      expect(tx1.args[1]).toBe(rawStatType);
      expect(tx1.args[2]).toBe(statUpdateBtreeSet);

      // Verify conversion functions were called with correct parameters
      expect(balanceStatInputToStatUpdatesSpy).toHaveBeenCalledWith(
        { balance, type: StatType.Balance },
        mockContext
      );
      expect(statParamsToMeshStatTypeSpy).toHaveBeenCalledWith(
        { type: StatType.Balance, balance },
        mockContext
      );
    });

    it('should add Count stat without value', async () => {
      args = {
        stats: [{ type: StatType.Count }],
        asset,
      };
      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

      const result = await prepareSetAssetStats.call(proc, args);

      expect(result.resolver).toBeUndefined();
      expect(result.transactions).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tx = result.transactions[0]!;
      expect(typeof tx.transaction).toBe('function');
      expect(tx.args).toHaveLength(2);
      expect(tx.args[0]).toBe(rawAssetId);
      // args[1] should be the BTreeSet returned by statisticStatTypesToBtreeStatType
      expect(statisticStatTypesToBtreeStatTypeSpy).toHaveBeenCalledWith([rawStatType], mockContext);
      // Verify it's a BTreeSet with the stat type (not empty - we're activating the stat)
      const btreeSet = tx.args[1] as BTreeSet<PolymeshPrimitivesStatisticsStatType>;
      expect(btreeSet).toBeDefined();
      expect(btreeSet.isEmpty).toBe(false);
      expect(btreeSet.size).toBe(1);
      expect(statParamsToMeshStatTypeSpy).toHaveBeenCalledWith(
        { type: StatType.Count },
        mockContext
      );
    });

    it('should add Count stat with value', async () => {
      args = {
        asset,
        stats: [
          {
            type: StatType.Count,
            count,
          },
        ],
      };

      countStatInputToStatUpdatesSpy.mockReturnValue(statUpdateBtreeSet);

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

      const result = await prepareSetAssetStats.call(proc, args);

      expect(result.resolver).toBeUndefined();
      expect(result.transactions).toHaveLength(2);

      // First transaction: SetActiveAssetStats
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tx0 = result.transactions[0]!;
      expect(typeof tx0.transaction).toBe('function');
      expect(tx0.args).toHaveLength(2);
      expect(tx0.args[0]).toBe(rawAssetId);
      const btreeSet = tx0.args[1] as BTreeSet<PolymeshPrimitivesStatisticsStatType>;
      expect(btreeSet).toBeDefined();
      expect(btreeSet.isEmpty).toBe(false);
      expect(btreeSet.size).toBe(1);

      // Second transaction: BatchUpdateAssetStats
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tx1 = result.transactions[1]!;
      expect(typeof tx1.transaction).toBe('function');
      expect(tx1.args).toHaveLength(3);
      expect(tx1.args[0]).toBe(rawAssetId);
      expect(tx1.args[1]).toBe(rawStatType);
      expect(tx1.args[2]).toBe(statUpdateBtreeSet);

      // Verify conversion functions were called
      expect(statisticStatTypesToBtreeStatTypeSpy).toHaveBeenCalledWith([rawStatType], mockContext);
      expect(countStatInputToStatUpdatesSpy).toHaveBeenCalledWith(
        { type: StatType.Count, count },
        mockContext
      );
      expect(statParamsToMeshStatTypeSpy).toHaveBeenCalledWith(
        { type: StatType.Count, count },
        mockContext
      );
    });

    it('should add ScopedCount stat with value', async () => {
      const issuer = entityMockUtils.getIdentityInstance();

      args = {
        asset,
        stats: [
          {
            type: StatType.ScopedCount,
            issuer,
            claimType: ClaimType.Accredited,
            value: {
              accredited: new BigNumber(1),
              nonAccredited: new BigNumber(2),
            },
          },
        ],
      };

      claimCountStatInputToStatUpdatesSpy.mockReturnValue(statUpdateBtreeSet);

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

      const result = await prepareSetAssetStats.call(proc, args);

      expect(result.resolver).toBeUndefined();
      expect(result.transactions).toHaveLength(2);

      // First transaction: SetActiveAssetStats
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tx0 = result.transactions[0]!;
      expect(typeof tx0.transaction).toBe('function');
      expect(tx0.args).toHaveLength(2);
      expect(tx0.args[0]).toBe(rawAssetId);
      const btreeSet = tx0.args[1] as BTreeSet<PolymeshPrimitivesStatisticsStatType>;
      expect(btreeSet).toBeDefined();
      expect(btreeSet.isEmpty).toBe(false);
      expect(btreeSet.size).toBe(1);

      // Second transaction: BatchUpdateAssetStats
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tx1 = result.transactions[1]!;
      expect(typeof tx1.transaction).toBe('function');
      expect(tx1.args).toHaveLength(3);
      expect(tx1.args[0]).toBe(rawAssetId);
      expect(tx1.args[1]).toBe(rawStatType);
      expect(tx1.args[2]).toBe(statUpdateBtreeSet);

      // Verify conversion functions were called
      expect(claimCountStatInputToStatUpdatesSpy).toHaveBeenCalledWith(
        {
          type: StatType.ScopedCount,
          issuer,
          claimType: ClaimType.Accredited,
          value: {
            accredited: new BigNumber(1),
            nonAccredited: new BigNumber(2),
          },
        },
        mockContext
      );
    });

    it('should add ScopedBalance stat with value', async () => {
      const issuer = entityMockUtils.getIdentityInstance();

      args = {
        asset,
        stats: [
          {
            type: StatType.ScopedBalance,
            issuer,
            claimType: ClaimType.Accredited,
            value: {
              accredited: new BigNumber(100),
              nonAccredited: new BigNumber(200),
            },
          },
        ],
      };

      claimBalanceStatInputToStatUpdatesSpy.mockReturnValue(statUpdateBtreeSet);

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

      const result = await prepareSetAssetStats.call(proc, args);

      expect(result.resolver).toBeUndefined();
      expect(result.transactions).toHaveLength(2);

      // First transaction: SetActiveAssetStats
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tx0 = result.transactions[0]!;
      expect(typeof tx0.transaction).toBe('function');
      expect(tx0.args).toHaveLength(2);
      expect(tx0.args[0]).toBe(rawAssetId);
      const btreeSet = tx0.args[1] as BTreeSet<PolymeshPrimitivesStatisticsStatType>;
      expect(btreeSet).toBeDefined();
      expect(btreeSet.isEmpty).toBe(false);
      expect(btreeSet.size).toBe(1);

      // Second transaction: BatchUpdateAssetStats
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tx1 = result.transactions[1]!;
      expect(typeof tx1.transaction).toBe('function');
      expect(tx1.args).toHaveLength(3);
      expect(tx1.args[0]).toBe(rawAssetId);
      expect(tx1.args[1]).toBe(rawStatType);
      expect(tx1.args[2]).toBe(statUpdateBtreeSet);

      // Verify conversion functions were called
      expect(claimBalanceStatInputToStatUpdatesSpy).toHaveBeenCalledWith(
        {
          type: StatType.ScopedBalance,
          issuer,
          claimType: ClaimType.Accredited,
          value: {
            accredited: new BigNumber(100),
            nonAccredited: new BigNumber(200),
          },
        },
        mockContext
      );
    });

    it('should not call SetActiveAssetStats when stats have not changed', async () => {
      const currentStatsMock = dsMockUtils.createMockBtreeSet([
        rawStatType,
      ]) as unknown as BTreeSet<PolymeshPrimitivesStatisticsStatType>;

      args = {
        stats: [{ type: StatType.Balance, balance }],
        asset,
      };

      statisticStatTypesToBtreeStatTypeSpy.mockImplementationOnce(() => {
        // Return same content as currentStatsMock so hashes match
        const btreeSet = dsMockUtils.createMockBtreeSet([rawStatType]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return btreeSet as any;
      });

      jest
        .spyOn(utilsConversionModule, 'balanceStatInputToStatUpdates')
        .mockReturnValue(statUpdateBtreeSet);

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: currentStatsMock,
        }
      );

      const result = await prepareSetAssetStats.call(proc, args);

      // Should only have the batch update, not SetActiveAssetStats
      // because hash comparison detects that stats content is the same
      expect(result.resolver).toBeUndefined();
      expect(result.transactions).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tx = result.transactions[0]!;
      expect(typeof tx.transaction).toBe('function');
      expect(tx.args).toHaveLength(3);
      expect(tx.args[0]).toBe(rawAssetId);
      expect(tx.args[1]).toBe(rawStatType);
      expect(tx.args[2]).toBe(statUpdateBtreeSet);
    });

    it('should handle jurisdiction-based scoped count stats', async () => {
      const issuer = entityMockUtils.getIdentityInstance();
      args = {
        asset,
        stats: [
          {
            type: StatType.ScopedCount,
            issuer,
            claimType: ClaimType.Jurisdiction,
            value: [
              { countryCode: CountryCode.Us, count: new BigNumber(5) },
              { countryCode: CountryCode.Ca, count: new BigNumber(3) },
            ],
          },
        ],
      };

      jest
        .spyOn(utilsConversionModule, 'claimCountStatInputToStatUpdates')
        .mockReturnValue(statUpdateBtreeSet);

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

      const result = await prepareSetAssetStats.call(proc, args);

      expect(result.resolver).toBeUndefined();
      expect(result.transactions).toHaveLength(2);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tx0 = result.transactions[0]!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tx1 = result.transactions[1]!;
      expect(typeof tx0.transaction).toBe('function');
      expect(tx0.args).toHaveLength(2);
      expect(tx0.args[0]).toBe(rawAssetId);
      expect(typeof tx1.transaction).toBe('function');
      expect(tx1.args).toHaveLength(3);
      expect(tx1.args[0]).toBe(rawAssetId);
    });

    it('should handle Affiliate claim type for ScopedBalance in prepareSetAssetStats', async () => {
      const issuer = entityMockUtils.getIdentityInstance();
      args = {
        asset,
        stats: [
          {
            type: StatType.ScopedBalance,
            issuer,
            claimType: ClaimType.Affiliate,
            value: {
              affiliate: new BigNumber(500),
              nonAffiliate: new BigNumber(1500),
            },
          },
        ],
      };

      jest
        .spyOn(utilsConversionModule, 'claimBalanceStatInputToStatUpdates')
        .mockReturnValue(statUpdateBtreeSet);

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

      const result = await prepareSetAssetStats.call(proc, args);

      expect(result.resolver).toBeUndefined();
      expect(result.transactions).toHaveLength(2);
    });

    it('should handle Affiliate claim type for ScopedCount in prepareSetAssetStats', async () => {
      const issuer = entityMockUtils.getIdentityInstance();
      args = {
        asset,
        stats: [
          {
            type: StatType.ScopedCount,
            issuer,
            claimType: ClaimType.Affiliate,
            value: {
              affiliate: new BigNumber(10),
              nonAffiliate: new BigNumber(20),
            },
          },
        ],
      };

      jest
        .spyOn(utilsConversionModule, 'claimCountStatInputToStatUpdates')
        .mockReturnValue(statUpdateBtreeSet);

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

      const result = await prepareSetAssetStats.call(proc, args);

      expect(result.resolver).toBeUndefined();
      expect(result.transactions).toHaveLength(2);
    });

    it('should handle Jurisdiction claim type for ScopedBalance in prepareSetAssetStats', async () => {
      const issuer = entityMockUtils.getIdentityInstance();
      args = {
        asset,
        stats: [
          {
            type: StatType.ScopedBalance,
            issuer,
            claimType: ClaimType.Jurisdiction,
            value: [
              { countryCode: CountryCode.Us, balance: new BigNumber(1000) },
              { countryCode: CountryCode.Gb, balance: new BigNumber(2000) },
            ],
          },
        ],
      };

      jest
        .spyOn(utilsConversionModule, 'claimBalanceStatInputToStatUpdates')
        .mockReturnValue(statUpdateBtreeSet);

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

      const result = await prepareSetAssetStats.call(proc, args);

      expect(result.resolver).toBeUndefined();
      expect(result.transactions).toHaveLength(2);
    });

    it('should handle stats with no value (undefined count)', async () => {
      args = {
        asset,
        stats: [{ type: StatType.Count }],
      };

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

      const result = await prepareSetAssetStats.call(proc, args);

      // Should only have SetActiveAssetStats, no BatchUpdateAssetStats
      expect(result.resolver).toBeUndefined();
      expect(result.transactions).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tx = result.transactions[0]!;
      expect(typeof tx.transaction).toBe('function');
      expect(tx.args).toHaveLength(2);
      expect(tx.args[0]).toBe(rawAssetId);
      // args[1] should be the BTreeSet returned by statisticStatTypesToBtreeStatType
      const btreeSet = tx.args[1] as BTreeSet<PolymeshPrimitivesStatisticsStatType>;
      expect(btreeSet).toBeDefined();
      expect(btreeSet.isEmpty).toBe(false);
      expect(btreeSet.size).toBe(1);
    });

    it('should handle scoped stats with no value', async () => {
      const issuer = entityMockUtils.getIdentityInstance();
      args = {
        asset,
        stats: [
          {
            type: StatType.ScopedCount,
            issuer,
            claimType: ClaimType.Accredited,
          },
        ],
      };

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

      const result = await prepareSetAssetStats.call(proc, args);

      // Should only have SetActiveAssetStats, no BatchUpdateAssetStats
      expect(result.resolver).toBeUndefined();
      expect(result.transactions).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tx = result.transactions[0]!;
      expect(typeof tx.transaction).toBe('function');
      expect(tx.args).toHaveLength(2);
      expect(tx.args[0]).toBe(rawAssetId);
      // args[1] should be the BTreeSet returned by statisticStatTypesToBtreeStatType
      const btreeSet = tx.args[1] as BTreeSet<PolymeshPrimitivesStatisticsStatType>;
      expect(btreeSet).toBeDefined();
      expect(btreeSet.isEmpty).toBe(false);
      expect(btreeSet.size).toBe(1);
    });

    it('should throw an error when stats are unchanged and no values are provided', () => {
      const currentStatsMock = dsMockUtils.createMockBtreeSet([
        rawStatType,
      ]) as unknown as BTreeSet<PolymeshPrimitivesStatisticsStatType>;

      args = {
        asset,
        stats: [{ type: StatType.Balance }],
      };

      statisticStatTypesToBtreeStatTypeSpy.mockImplementationOnce(() => {
        // Return same content as currentStatsMock so hashes match
        const btreeSet = dsMockUtils.createMockBtreeSet([rawStatType]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return btreeSet as any;
      });

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: currentStatsMock,
        }
      );

      expect(() => prepareSetAssetStats.call(proc, args)).toThrow(
        'The supplied stat types are already set and no new values were provided'
      );
    });
  });

  describe('getAuthorization', () => {
    it('should return appropriate permissions when adding new stats with values', () => {
      args = {
        asset,
        stats: [
          {
            count,
            type: StatType.Count,
          },
        ],
      };

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );
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
    });

    it('should return only SetActiveAssetStats when adding stats without values', () => {
      args = {
        asset,
        stats: [{ type: StatType.Balance }],
      };

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [asset],
          transactions: [TxTags.statistics.SetActiveAssetStats],
          portfolios: [],
        },
      });
    });

    it('should return only BatchUpdateAssetStats when stats unchanged but values provided', () => {
      const currentStatsMock = dsMockUtils.createMockBtreeSet([
        rawStatType,
      ]) as unknown as BTreeSet<PolymeshPrimitivesStatisticsStatType>;

      args = {
        asset,
        stats: [{ type: StatType.Balance, balance: new BigNumber(1000) }],
      };

      statisticStatTypesToBtreeStatTypeSpy.mockImplementationOnce(() => {
        // Return same content as currentStatsMock so hashes match
        const btreeSet = dsMockUtils.createMockBtreeSet([rawStatType]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return btreeSet as any;
      });

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: currentStatsMock,
        }
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [asset],
          transactions: [TxTags.statistics.BatchUpdateAssetStats],
          portfolios: [],
        },
      });
    });

    it('should return no transactions when stats unchanged and no values provided', () => {
      const currentStatsMock = dsMockUtils.createMockBtreeSet([
        rawStatType,
      ]) as unknown as BTreeSet<PolymeshPrimitivesStatisticsStatType>;

      args = {
        asset,
        stats: [{ type: StatType.Balance }],
      };

      statisticStatTypesToBtreeStatTypeSpy.mockImplementationOnce(() => {
        // Return same content as currentStatsMock so hashes match
        const btreeSet = dsMockUtils.createMockBtreeSet([rawStatType]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return btreeSet as any;
      });

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: currentStatsMock,
        }
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [asset],
          transactions: [],
          portfolios: [],
        },
      });
    });

    it('should handle scoped stats correctly', () => {
      const issuer = entityMockUtils.getIdentityInstance();
      const currentStatsMock = dsMockUtils.createMockBtreeSet([
        rawStatType,
      ]) as unknown as BTreeSet<PolymeshPrimitivesStatisticsStatType>;

      args = {
        asset,
        stats: [
          {
            type: StatType.ScopedCount,
            issuer,
            claimType: ClaimType.Accredited,
            value: {
              accredited: new BigNumber(1),
              nonAccredited: new BigNumber(2),
            },
          },
        ],
      };

      statisticStatTypesToBtreeStatTypeSpy.mockImplementationOnce(() => {
        // Return same content as currentStatsMock so hashes match
        const btreeSet = dsMockUtils.createMockBtreeSet([rawStatType]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return btreeSet as any;
      });

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: currentStatsMock,
        }
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [asset],
          transactions: [TxTags.statistics.BatchUpdateAssetStats],
          portfolios: [],
        },
      });
    });

    it('should handle ScopedBalance stats with values in getAuthorization', () => {
      const issuer = entityMockUtils.getIdentityInstance();
      const currentStatsMock = dsMockUtils.createMockBtreeSet([
        rawStatType,
      ]) as unknown as BTreeSet<PolymeshPrimitivesStatisticsStatType>;

      args = {
        asset,
        stats: [
          {
            type: StatType.ScopedBalance,
            issuer,
            claimType: ClaimType.Accredited,
            value: {
              accredited: new BigNumber(1000),
              nonAccredited: new BigNumber(2000),
            },
          },
        ],
      };

      statisticStatTypesToBtreeStatTypeSpy.mockImplementationOnce(() => {
        // Return same content as currentStatsMock so hashes match
        const btreeSet = dsMockUtils.createMockBtreeSet([rawStatType]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return btreeSet as any;
      });

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: currentStatsMock,
        }
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [asset],
          transactions: [TxTags.statistics.BatchUpdateAssetStats],
          portfolios: [],
        },
      });
    });

    it('should handle Affiliate claim type for ScopedBalance', () => {
      const issuer = entityMockUtils.getIdentityInstance();

      args = {
        asset,
        stats: [
          {
            type: StatType.ScopedBalance,
            issuer,
            claimType: ClaimType.Affiliate,
            value: {
              affiliate: new BigNumber(500),
              nonAffiliate: new BigNumber(1500),
            },
          },
        ],
      };

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

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
    });

    it('should handle Jurisdiction claim type for ScopedBalance', () => {
      const issuer = entityMockUtils.getIdentityInstance();

      args = {
        asset,
        stats: [
          {
            type: StatType.ScopedBalance,
            issuer,
            claimType: ClaimType.Jurisdiction,
            value: [
              { countryCode: CountryCode.Us, balance: new BigNumber(1000) },
              { countryCode: CountryCode.Gb, balance: new BigNumber(2000) },
            ],
          },
        ],
      };

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

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
    });

    it('should handle Affiliate claim type for ScopedCount', () => {
      const issuer = entityMockUtils.getIdentityInstance();

      args = {
        asset,
        stats: [
          {
            type: StatType.ScopedCount,
            issuer,
            claimType: ClaimType.Affiliate,
            value: {
              affiliate: new BigNumber(10),
              nonAffiliate: new BigNumber(20),
            },
          },
        ],
      };

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

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
    });

    it('should handle stats without values (no count)', () => {
      args = {
        asset,
        stats: [{ type: StatType.Count }],
      };

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [asset],
          transactions: [TxTags.statistics.SetActiveAssetStats],
          portfolios: [],
        },
      });
    });

    it('should handle scoped stats without values', () => {
      const issuer = entityMockUtils.getIdentityInstance();

      args = {
        asset,
        stats: [
          {
            type: StatType.ScopedCount,
            issuer,
            claimType: ClaimType.Accredited,
          },
        ],
      };

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [asset],
          transactions: [TxTags.statistics.SetActiveAssetStats],
          portfolios: [],
        },
      });
    });

    it('should throw error for unknown stat types', () => {
      args = {
        asset,
        stats: [
          // @ts-expect-error Testing defensive code path
          { type: 'UnknownType' },
        ],
      };

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void, SetAssetStatsStorage>(
        mockContext,
        {
          currentStats: dsMockUtils.createMockBtreeSet([]),
        }
      );

      const boundFunc = getAuthorization.bind(proc);

      expect(() => boundFunc(args)).toThrow('Unsupported stat type');
    });
  });
});
