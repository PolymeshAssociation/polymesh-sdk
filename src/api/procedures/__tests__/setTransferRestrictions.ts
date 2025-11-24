import { BTreeSet, u64 } from '@polkadot/types';
import { Permill } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareSetTransferRestrictions,
  prepareStorage,
  setTransferRestrictions,
  SetTransferRestrictionsStorage,
} from '~/api/procedures/setTransferRestrictions';
import { Context, PolymeshError, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  AssetStat,
  ClaimType,
  CountryCode,
  ErrorCode,
  FungibleAsset,
  Identity,
  StatType,
  TransferRestrictionType,
  TxTags,
} from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as internalUtils from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('setTransferRestrictions procedure', () => {
  let mockContext: Mocked<Context>;
  let transferRestrictionToPolymeshTransferConditionSpy: jest.SpyInstance;
  let assertStatSetSpy: jest.SpyInstance;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let complianceConditionsToBtreeSetSpy: jest.SpyInstance<
    BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>,
    [PolymeshPrimitivesTransferComplianceTransferCondition[], Context]
  >;
  let assetId: string;
  let asset: FungibleAsset;
  let count: BigNumber;
  let percentage: BigNumber;
  let min: BigNumber;
  let max: BigNumber;
  let claimPercentageMin: BigNumber;
  let claimPercentageMax: BigNumber;
  let issuer: Identity;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let rawCount: u64;
  let rawPercentage: Permill;
  let rawCountRestriction: PolymeshPrimitivesTransferComplianceTransferCondition;
  let rawPercentageRestriction: PolymeshPrimitivesTransferComplianceTransferCondition;
  let rawClaimCountRestriction: PolymeshPrimitivesTransferComplianceTransferCondition;
  let rawClaimPercentageRestriction: PolymeshPrimitivesTransferComplianceTransferCondition;
  let rawConditionsBtreeSet: BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
  let setAssetTransferComplianceTransaction: PolymeshTx<
    [PolymeshPrimitivesAssetAssetId, PolymeshPrimitivesTransferComplianceTransferCondition]
  >;
  let mockStats: BTreeSet;
  let currentStats: AssetStat[];
  let storage: SetTransferRestrictionsStorage;

  const getProc = (): Procedure<Params, void, SetTransferRestrictionsStorage> =>
    procedureMockUtils.getInstance<Params, void, SetTransferRestrictionsStorage>(
      mockContext,
      storage
    );

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    transferRestrictionToPolymeshTransferConditionSpy = jest.spyOn(
      utilsConversionModule,
      'transferRestrictionToPolymeshTransferCondition'
    );
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    complianceConditionsToBtreeSetSpy = jest.spyOn(
      utilsConversionModule,
      'complianceConditionsToBtreeSet'
    );
    assertStatSetSpy = jest.spyOn(internalUtils, 'assertStatIsSet');
  });

  beforeEach(() => {
    assetId = '12341234-1234-1234-1234-123412341234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    count = new BigNumber(10);
    percentage = new BigNumber(49);
    min = new BigNumber(10);
    max = new BigNumber(20);
    claimPercentageMin = new BigNumber(5);
    claimPercentageMax = new BigNumber(15);
    issuer = entityMockUtils.getIdentityInstance({ did: 'issuerDid' });

    currentStats = [
      { type: StatType.Count },
      { type: StatType.Balance },
      {
        type: StatType.ScopedCount,
        claimIssuer: {
          issuer,
          claimType: ClaimType.Accredited,
        },
      },
      {
        type: StatType.ScopedCount,
        claimIssuer: {
          issuer,
          claimType: ClaimType.Affiliate,
        },
      },
      {
        type: StatType.ScopedCount,
        claimIssuer: {
          issuer,
          claimType: ClaimType.Jurisdiction,
        },
      },
      {
        type: StatType.ScopedBalance,
        claimIssuer: {
          issuer,
          claimType: ClaimType.Accredited,
        },
      },
      {
        type: StatType.ScopedBalance,
        claimIssuer: {
          issuer,
          claimType: ClaimType.Affiliate,
        },
      },
      {
        type: StatType.ScopedBalance,
        claimIssuer: {
          issuer,
          claimType: ClaimType.Jurisdiction,
        },
      },
    ];

    storage = { currentStats };

    mockStats = dsMockUtils.createMockBtreeSet([
      dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.Count),
        claimIssuer: dsMockUtils.createMockOption(),
      }),
    ]);

    dsMockUtils.createQueryMock('statistics', 'activeAssetStats', {
      returnValue: mockStats,
    });

    setAssetTransferComplianceTransaction = dsMockUtils.createTxMock(
      'statistics',
      'setAssetTransferCompliance'
    );

    mockContext = dsMockUtils.getContextInstance();

    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    rawCount = dsMockUtils.createMockU64(count);
    rawPercentage = dsMockUtils.createMockPermill(percentage.multipliedBy(10000));
    rawCountRestriction = dsMockUtils.createMockTransferCondition({
      MaxInvestorCount: rawCount,
      isMaxInvestorCount: true,
    });
    rawPercentageRestriction = dsMockUtils.createMockTransferCondition({
      MaxInvestorOwnership: rawPercentage,
      isMaxInvestorOwnership: true,
    });
    rawClaimCountRestriction = dsMockUtils.createMockTransferCondition({
      ClaimCount: [
        dsMockUtils.createMockStatisticsStatClaim({ Accredited: dsMockUtils.createMockBool(true) }),
        dsMockUtils.createMockIdentityId('issuerDid'),
        rawCount,
        dsMockUtils.createMockOption(),
      ],
      isClaimCount: true,
    });
    const rawMinPermill = dsMockUtils.createMockPermill(claimPercentageMin.multipliedBy(10000));
    const rawMaxPermill = dsMockUtils.createMockPermill(claimPercentageMax.multipliedBy(10000));
    rawClaimPercentageRestriction = dsMockUtils.createMockTransferCondition({
      ClaimOwnership: [
        dsMockUtils.createMockStatisticsStatClaim({ Accredited: dsMockUtils.createMockBool(true) }),
        dsMockUtils.createMockIdentityId('issuerDid'),
        rawMinPermill,
        rawMaxPermill,
      ],
      isClaimOwnership: true,
    });
    rawConditionsBtreeSet = dsMockUtils.createMockBtreeSet([
      rawCountRestriction,
      rawPercentageRestriction,
    ]) as BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;

    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
    when(complianceConditionsToBtreeSetSpy)
      .calledWith([rawCountRestriction, rawPercentageRestriction], mockContext)
      .mockReturnValue(rawConditionsBtreeSet);
    assertStatSetSpy.mockImplementation(() => undefined);
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

  describe('prepareSetTransferRestrictions', () => {
    it('should prepare a transaction with count restrictions', async () => {
      const proc = getProc();
      const args: Params = {
        asset,
        restrictions: [
          {
            count,
            type: TransferRestrictionType.Count,
          },
          {
            min: new BigNumber(2),
            max: new BigNumber(10),
            issuer,
            claim: { type: ClaimType.Accredited, accredited: false },
            type: TransferRestrictionType.ClaimCount,
          },
        ],
      };

      when(transferRestrictionToPolymeshTransferConditionSpy)
        .calledWith({ type: TransferRestrictionType.Count, value: count }, mockContext)
        .mockReturnValue(rawCountRestriction);

      const singleConditionBtreeSet = dsMockUtils.createMockBtreeSet([
        rawCountRestriction,
      ]) as BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
      when(complianceConditionsToBtreeSetSpy)
        .calledWith([rawCountRestriction], mockContext)
        .mockReturnValue(singleConditionBtreeSet);

      const result = await prepareSetTransferRestrictions.call(proc, args);

      expect(result).toEqual({
        transaction: setAssetTransferComplianceTransaction,
        args: [rawAssetId, singleConditionBtreeSet],
        resolver: undefined,
      });
    });

    it('should prepare a transaction with percentage restrictions', async () => {
      const proc = getProc();
      const args: Params = {
        asset,
        restrictions: [
          {
            percentage,
            type: TransferRestrictionType.Percentage,
          },
        ],
      };

      when(transferRestrictionToPolymeshTransferConditionSpy)
        .calledWith({ type: TransferRestrictionType.Percentage, value: percentage }, mockContext)
        .mockReturnValue(rawPercentageRestriction);

      const singleConditionBtreeSet = dsMockUtils.createMockBtreeSet([
        rawPercentageRestriction,
      ]) as BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
      when(complianceConditionsToBtreeSetSpy)
        .calledWith([rawPercentageRestriction], mockContext)
        .mockReturnValue(singleConditionBtreeSet);

      const result = await prepareSetTransferRestrictions.call(proc, args);

      expect(result).toEqual({
        transaction: setAssetTransferComplianceTransaction,
        args: [rawAssetId, singleConditionBtreeSet],
        resolver: undefined,
      });
    });

    it('should prepare a transaction with claim percentage restrictions', async () => {
      const proc = getProc();
      const accreditedClaim = { type: ClaimType.Accredited, accredited: true } as const;
      const args: Params = {
        asset,
        restrictions: [
          {
            min: claimPercentageMin,
            max: claimPercentageMax,
            issuer,
            claim: accreditedClaim,
            type: TransferRestrictionType.ClaimPercentage,
          },
        ],
      };

      when(transferRestrictionToPolymeshTransferConditionSpy)
        .calledWith(
          {
            type: TransferRestrictionType.ClaimPercentage,
            value: {
              min: claimPercentageMin,
              max: claimPercentageMax,
              claim: accreditedClaim,
              issuer,
            },
          },
          mockContext
        )
        .mockReturnValue(rawClaimPercentageRestriction);

      const claimPercentageConditionBtreeSet = dsMockUtils.createMockBtreeSet([
        rawClaimPercentageRestriction,
      ]) as BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
      when(complianceConditionsToBtreeSetSpy)
        .calledWith([rawClaimPercentageRestriction], mockContext)
        .mockReturnValue(claimPercentageConditionBtreeSet);

      const result = await prepareSetTransferRestrictions.call(proc, args);

      expect(result).toEqual({
        transaction: setAssetTransferComplianceTransaction,
        args: [rawAssetId, claimPercentageConditionBtreeSet],
        resolver: undefined,
      });
    });

    it('should prepare a transaction with multiple restrictions', async () => {
      const proc = getProc();
      const args: Params = {
        asset,
        restrictions: [
          {
            count,
            type: TransferRestrictionType.Count,
          },
          {
            percentage,
            type: TransferRestrictionType.Percentage,
          },
        ],
      };

      when(transferRestrictionToPolymeshTransferConditionSpy)
        .calledWith({ type: TransferRestrictionType.Count, value: count }, mockContext)
        .mockReturnValue(rawCountRestriction);
      when(transferRestrictionToPolymeshTransferConditionSpy)
        .calledWith({ type: TransferRestrictionType.Percentage, value: percentage }, mockContext)
        .mockReturnValue(rawPercentageRestriction);

      const result = await prepareSetTransferRestrictions.call(proc, args);

      expect(result).toEqual({
        transaction: setAssetTransferComplianceTransaction,
        args: [rawAssetId, rawConditionsBtreeSet],
        resolver: undefined,
      });
    });

    it('should not throw an error for duplicate ClaimType.Accredited restrictions with different values', async () => {
      const proc = getProc();
      const args: Params = {
        asset,
        restrictions: [
          {
            min,
            max,
            issuer,
            claim: {
              type: ClaimType.Accredited,
              accredited: true,
            } as const,
            type: TransferRestrictionType.ClaimCount,
          },
          {
            min,
            max,
            issuer,
            claim: {
              type: ClaimType.Accredited,
              accredited: false,
            } as const,
            type: TransferRestrictionType.ClaimCount,
          },
        ],
      };

      when(transferRestrictionToPolymeshTransferConditionSpy)
        .calledWith(expect.any(Object), mockContext)
        .mockReturnValue(rawClaimCountRestriction);

      const multipleConditionsBtreeSet = dsMockUtils.createMockBtreeSet([
        rawClaimCountRestriction,
        rawClaimCountRestriction,
      ]) as BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
      when(complianceConditionsToBtreeSetSpy)
        .calledWith([rawClaimCountRestriction, rawClaimCountRestriction], mockContext)
        .mockReturnValue(multipleConditionsBtreeSet);

      const result = await prepareSetTransferRestrictions.call(proc, args);

      expect(result).toEqual({
        transaction: setAssetTransferComplianceTransaction,
        args: [rawAssetId, multipleConditionsBtreeSet],
        resolver: undefined,
      });
    });

    it('should throw an error for duplicate ClaimType.Accredited restrictions with same values', async () => {
      const proc = getProc();
      const args: Params = {
        asset,
        restrictions: [
          {
            min,
            max,
            issuer,
            claim: {
              type: ClaimType.Accredited,
              accredited: true,
            } as const,
            type: TransferRestrictionType.ClaimCount,
          },
          {
            min,
            max,
            issuer,
            claim: {
              type: ClaimType.Accredited,
              accredited: true,
            } as const,
            type: TransferRestrictionType.ClaimCount,
          },
        ],
      };

      try {
        await prepareSetTransferRestrictions.call(proc, args);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolymeshError);
        expect((error as PolymeshError).message).toBe('Duplicate restriction found in input');
        expect((error as PolymeshError).code).toBe(ErrorCode.ValidationError);
        expect((error as PolymeshError).data).toEqual({
          restriction: args.restrictions[1],
        });
      }
    });

    it('should not throw an error for duplicate ClaimType.Affiliate restrictions with different values', async () => {
      const proc = getProc();
      const args: Params = {
        asset,
        restrictions: [
          {
            min,
            max,
            issuer,
            claim: {
              type: ClaimType.Affiliate,
              affiliate: true,
            } as const,
            type: TransferRestrictionType.ClaimCount,
          },
          {
            min,
            max,
            issuer,
            claim: {
              type: ClaimType.Affiliate,
              affiliate: false,
            } as const,
            type: TransferRestrictionType.ClaimCount,
          },
        ],
      };

      when(transferRestrictionToPolymeshTransferConditionSpy)
        .calledWith(expect.any(Object), mockContext)
        .mockReturnValue(rawClaimCountRestriction);

      const multipleConditionsBtreeSet = dsMockUtils.createMockBtreeSet([
        rawClaimCountRestriction,
        rawClaimCountRestriction,
      ]) as BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
      when(complianceConditionsToBtreeSetSpy)
        .calledWith([rawClaimCountRestriction, rawClaimCountRestriction], mockContext)
        .mockReturnValue(multipleConditionsBtreeSet);

      const result = await prepareSetTransferRestrictions.call(proc, args);

      expect(result).toEqual({
        transaction: setAssetTransferComplianceTransaction,
        args: [rawAssetId, multipleConditionsBtreeSet],
        resolver: undefined,
      });
    });

    it('should throw an error for duplicate ClaimType.Affiliate restrictions with same values', async () => {
      const proc = getProc();
      const args: Params = {
        asset,
        restrictions: [
          {
            min,
            max,
            issuer,
            claim: {
              type: ClaimType.Affiliate,
              affiliate: true,
            } as const,
            type: TransferRestrictionType.ClaimCount,
          },
          {
            min,
            max,
            issuer,
            claim: {
              type: ClaimType.Affiliate,
              affiliate: true,
            } as const,
            type: TransferRestrictionType.ClaimCount,
          },
        ],
      };

      try {
        await prepareSetTransferRestrictions.call(proc, args);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolymeshError);
        expect((error as PolymeshError).message).toBe('Duplicate restriction found in input');
        expect((error as PolymeshError).code).toBe(ErrorCode.ValidationError);
        expect((error as PolymeshError).data).toEqual({
          restriction: args.restrictions[1],
        });
      }
    });

    it('should throw an error for duplicate Jurisdiction restrictions with same country code', async () => {
      const proc = getProc();
      const args: Params = {
        asset,
        restrictions: [
          {
            min,
            max,
            issuer,
            claim: {
              type: ClaimType.Jurisdiction,
              countryCode: CountryCode.Us,
            } as const,
            type: TransferRestrictionType.ClaimCount,
          },
          {
            min,
            max,
            issuer,
            claim: {
              type: ClaimType.Jurisdiction,
              countryCode: CountryCode.Us,
            } as const,
            type: TransferRestrictionType.ClaimCount,
          },
        ],
      };

      try {
        await prepareSetTransferRestrictions.call(proc, args);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolymeshError);
        expect((error as PolymeshError).message).toBe('Duplicate restriction found in input');
        expect((error as PolymeshError).code).toBe(ErrorCode.ValidationError);
        expect((error as PolymeshError).data).toEqual({
          restriction: args.restrictions[1],
        });
      }
    });

    it('should throw an error for duplicate Jurisdiction restrictions with undefined country code', async () => {
      const proc = getProc();
      const args: Params = {
        asset,
        restrictions: [
          {
            min,
            max,
            issuer,
            claim: {
              type: ClaimType.Jurisdiction,
              countryCode: undefined,
            } as const,
            type: TransferRestrictionType.ClaimCount,
          },
          {
            min,
            max,
            issuer,
            claim: {
              type: ClaimType.Jurisdiction,
              countryCode: undefined,
            } as const,
            type: TransferRestrictionType.ClaimCount,
          },
        ],
      };

      try {
        await prepareSetTransferRestrictions.call(proc, args);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolymeshError);
        expect((error as PolymeshError).message).toBe('Duplicate restriction found in input');
        expect((error as PolymeshError).code).toBe(ErrorCode.ValidationError);
        expect((error as PolymeshError).data).toEqual({
          restriction: args.restrictions[1],
        });
      }
    });

    it('should not throw an error for different Jurisdiction restrictions with different country codes', async () => {
      const proc = getProc();
      const args: Params = {
        asset,
        restrictions: [
          {
            min,
            max,
            issuer,
            claim: {
              type: ClaimType.Jurisdiction,
              countryCode: CountryCode.Us,
            } as const,
            type: TransferRestrictionType.ClaimCount,
          },
          {
            min,
            max,
            issuer,
            claim: {
              type: ClaimType.Jurisdiction,
              countryCode: CountryCode.Ca,
            } as const,
            type: TransferRestrictionType.ClaimCount,
          },
        ],
      };

      when(transferRestrictionToPolymeshTransferConditionSpy)
        .calledWith(expect.any(Object), mockContext)
        .mockReturnValue(rawClaimCountRestriction);

      const multipleConditionsBtreeSet = dsMockUtils.createMockBtreeSet([
        rawClaimCountRestriction,
        rawClaimCountRestriction,
      ]) as BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
      when(complianceConditionsToBtreeSetSpy)
        .calledWith([rawClaimCountRestriction, rawClaimCountRestriction], mockContext)
        .mockReturnValue(multipleConditionsBtreeSet);

      const result = await prepareSetTransferRestrictions.call(proc, args);

      expect(result).toEqual({
        transaction: setAssetTransferComplianceTransaction,
        args: [rawAssetId, multipleConditionsBtreeSet],
        resolver: undefined,
      });
    });

    it('should not throw an error for different ClaimType restrictions', async () => {
      const proc = getProc();
      const args: Params = {
        asset,
        restrictions: [
          {
            min,
            max,
            issuer,
            claim: {
              type: ClaimType.Accredited,
              accredited: true,
            } as const,
            type: TransferRestrictionType.ClaimCount,
          },
          {
            min,
            max,
            issuer,
            claim: {
              type: ClaimType.Affiliate,
              affiliate: true,
            } as const,
            type: TransferRestrictionType.ClaimCount,
          },
        ],
      };

      when(transferRestrictionToPolymeshTransferConditionSpy)
        .calledWith(expect.any(Object), mockContext)
        .mockReturnValue(rawClaimCountRestriction);

      const multipleConditionsBtreeSet = dsMockUtils.createMockBtreeSet([
        rawClaimCountRestriction,
        rawClaimCountRestriction,
      ]) as BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
      when(complianceConditionsToBtreeSetSpy)
        .calledWith([rawClaimCountRestriction, rawClaimCountRestriction], mockContext)
        .mockReturnValue(multipleConditionsBtreeSet);

      const result = await prepareSetTransferRestrictions.call(proc, args);

      expect(result).toEqual({
        transaction: setAssetTransferComplianceTransaction,
        args: [rawAssetId, multipleConditionsBtreeSet],
        resolver: undefined,
      });
    });

    it('should not throw an error for non-ClaimCount restriction types', async () => {
      const proc = getProc();
      const args: Params = {
        asset,
        restrictions: [
          {
            count,
            type: TransferRestrictionType.Count,
          },
          {
            count: new BigNumber(20),
            type: TransferRestrictionType.Count,
          },
        ],
      };

      when(transferRestrictionToPolymeshTransferConditionSpy)
        .calledWith(expect.any(Object), mockContext)
        .mockReturnValue(rawCountRestriction);

      const multipleConditionsBtreeSet = dsMockUtils.createMockBtreeSet([
        rawCountRestriction,
        rawCountRestriction,
      ]) as BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
      when(complianceConditionsToBtreeSetSpy)
        .calledWith([rawCountRestriction, rawCountRestriction], mockContext)
        .mockReturnValue(multipleConditionsBtreeSet);

      const result = await prepareSetTransferRestrictions.call(proc, args);

      expect(result).toEqual({
        transaction: setAssetTransferComplianceTransaction,
        args: [rawAssetId, multipleConditionsBtreeSet],
        resolver: undefined,
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = getProc();
      const args: Params = {
        asset,
        restrictions: [
          {
            count,
            type: TransferRestrictionType.Count,
          },
        ],
      };

      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ id: assetId })],
          transactions: [TxTags.statistics.SetAssetTransferCompliance],
          portfolios: [],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should retrieve current stats from the chain', async () => {
      const convertedStat = { type: StatType.Count } as AssetStat;
      const assetStatToStatSpy = jest
        .spyOn(utilsConversionModule, 'assetStatToStat')
        .mockReturnValue(convertedStat);

      const rawStatType = dsMockUtils.createMockStatisticsStatType();
      const rawStats = dsMockUtils.createMockBtreeSet([rawStatType]);
      dsMockUtils.createQueryMock('statistics', 'activeAssetStats', {
        returnValue: rawStats,
      });

      const proc = getProc();
      const result = await prepareStorage.call(proc, { asset, restrictions: [] });

      expect(result).toEqual({ currentStats: [convertedStat] });
      expect(assetStatToStatSpy).toHaveBeenCalledWith(rawStatType, mockContext);

      assetStatToStatSpy.mockRestore();
    });
  });

  describe('setTransferRestrictions', () => {
    it('should create a Procedure instance', () => {
      const procedure = setTransferRestrictions();
      expect(procedure).toBeInstanceOf(Procedure);
    });
  });
});
