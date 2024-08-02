import {
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { ClaimCount } from '~/api/entities/Asset/Fungible/TransferRestrictions/ClaimCount';
import { ClaimPercentage } from '~/api/entities/Asset/Fungible/TransferRestrictions/ClaimPercentage';
import {
  Context,
  FungibleAsset,
  Namespace,
  NumberedPortfolio,
  PolymeshTransaction,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  AddCountTransferRestrictionParams,
  AddPercentageTransferRestrictionParams,
  ClaimType,
  CountTransferRestriction,
  PercentageTransferRestriction,
  SetClaimCountTransferRestrictionsParams,
  SetClaimPercentageTransferRestrictionsParams,
  SetCountTransferRestrictionsParams,
  SetPercentageTransferRestrictionsParams,
  StatType,
  TransferRestrictionType,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

import { Count } from '../Count';
import { Percentage } from '../Percentage';
import { TransferRestrictionBase } from '../TransferRestrictionBase';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('TransferRestrictionBase class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(TransferRestrictionBase.prototype instanceof Namespace).toBe(true);
  });

  describe('method: addRestriction', () => {
    let context: Context;
    let asset: FungibleAsset;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getFungibleAssetInstance();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure (count) with the correct arguments and context, and return the resulting transaction', async () => {
      const count = new Count(asset, context);

      const args: Omit<AddCountTransferRestrictionParams, 'type'> = {
        count: new BigNumber(3),
        exemptedIdentities: ['someScopeId'],
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<number>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { asset, ...args, type: TransferRestrictionType.Count },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await count.addRestriction({
        ...args,
      });

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the procedure (percentage) with the correct arguments and context, and return the resulting transaction', async () => {
      const percentage = new Percentage(asset, context);

      const args: Omit<AddPercentageTransferRestrictionParams, 'type'> = {
        percentage: new BigNumber(3),
        exemptedIdentities: ['someScopeId'],
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<number>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { asset, ...args, type: TransferRestrictionType.Percentage },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await percentage.addRestriction({
        ...args,
      });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: setRestrictions', () => {
    let context: Context;
    let asset: FungibleAsset;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getFungibleAssetInstance();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure (count) with the correct arguments and context, and return the resulting transaction', async () => {
      const count = new Count(asset, context);

      const args: Omit<SetCountTransferRestrictionsParams, 'type'> = {
        restrictions: [{ count: new BigNumber(3), exemptedIdentities: ['someScopeId'] }],
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<number>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { asset, ...args, type: TransferRestrictionType.Count },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await count.setRestrictions({
        ...args,
      });

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the procedure (percentage) with the correct arguments and context, and return the resulting transaction', async () => {
      const percentage = new Percentage(asset, context);

      const args: Omit<SetPercentageTransferRestrictionsParams, 'type'> = {
        restrictions: [{ percentage: new BigNumber(49), exemptedIdentities: ['someScopeId'] }],
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<number>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { asset, ...args, type: TransferRestrictionType.Percentage },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await percentage.setRestrictions({
        ...args,
      });

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the procedure (ClaimCount) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const did = 'someDid';
      const issuer = entityMockUtils.getIdentityInstance({ did });
      const count = new ClaimCount(asset, context);

      const args: Omit<SetClaimCountTransferRestrictionsParams, 'type'> = {
        restrictions: [
          {
            min: new BigNumber(10),
            issuer,
            claim: { type: ClaimType.Accredited, accredited: true },
            exemptedIdentities: ['someScopeId'],
          },
        ],
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<
        NumberedPortfolio[]
      >;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { asset, ...args, type: TransferRestrictionType.ClaimCount },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const transaction = await count.setRestrictions({
        ...args,
      });

      expect(transaction).toBe(expectedTransaction);
    });

    it('should prepare the procedure (ClaimPercentage) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const claimPercentage = new ClaimPercentage(asset, context);

      const args: Omit<SetClaimPercentageTransferRestrictionsParams, 'type'> = {
        restrictions: [],
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<
        NumberedPortfolio[]
      >;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { asset, ...args, type: TransferRestrictionType.ClaimPercentage },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const transaction = await claimPercentage.setRestrictions({
        ...args,
      });

      expect(transaction).toBe(expectedTransaction);
    });
  });

  describe('method: removeRestrictions', () => {
    let context: Context;
    let asset: FungibleAsset;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getFungibleAssetInstance();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure (count) with the correct arguments and context, and return the resulting transaction', async () => {
      const count = new Count(asset, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<number>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { asset, restrictions: [], type: TransferRestrictionType.Count },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await count.removeRestrictions();

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the procedure (percentage) with the correct arguments and context, and return the resulting transaction', async () => {
      const percentage = new Percentage(asset, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<number>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: {
              asset,
              restrictions: [],
              type: TransferRestrictionType.Percentage,
            },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await percentage.removeRestrictions();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: get', () => {
    let context: Context;
    let asset: FungibleAsset;
    let scopeId: string;
    let countRestriction: CountTransferRestriction;
    let percentageRestriction: PercentageTransferRestriction;
    let rawCountRestriction: PolymeshPrimitivesTransferComplianceTransferCondition;
    let rawPercentageRestriction: PolymeshPrimitivesTransferComplianceTransferCondition;
    let rawClaimCountRestriction: PolymeshPrimitivesTransferComplianceTransferCondition;
    let rawClaimPercentageRestriction: PolymeshPrimitivesTransferComplianceTransferCondition;
    const issuer = entityMockUtils.getIdentityInstance({ did: 'someDid' });
    const min = new BigNumber(10);
    const max = new BigNumber(20);

    beforeAll(() => {
      scopeId = 'someScopeId';
      countRestriction = {
        exemptedIds: [scopeId],
        count: new BigNumber(10),
      };
      percentageRestriction = {
        exemptedIds: [scopeId],
        percentage: new BigNumber(49),
      };
      rawCountRestriction = dsMockUtils.createMockTransferCondition({
        MaxInvestorCount: dsMockUtils.createMockU64(countRestriction.count),
      });
      rawPercentageRestriction = dsMockUtils.createMockTransferCondition({
        MaxInvestorOwnership: dsMockUtils.createMockPermill(
          percentageRestriction.percentage.multipliedBy(10000)
        ),
      });
      rawClaimCountRestriction = dsMockUtils.createMockTransferCondition({
        ClaimCount: [
          dsMockUtils.createMockStatisticsStatClaim({
            Accredited: dsMockUtils.createMockBool(true),
          }),
          dsMockUtils.createMockIdentityId('someDid'),
          dsMockUtils.createMockU64(min),
          dsMockUtils.createMockOption(dsMockUtils.createMockU64(max)),
        ],
      });
      rawClaimPercentageRestriction = dsMockUtils.createMockTransferCondition({
        ClaimOwnership: [
          dsMockUtils.createMockStatisticsStatClaim({
            Affiliate: dsMockUtils.createMockBool(true),
          }),
          dsMockUtils.createMockIdentityId('someDid'),
          dsMockUtils.createMockU64(min),
          dsMockUtils.createMockU64(max),
        ],
      });
    });

    beforeEach(() => {
      const maxStats = new BigNumber(5);
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getFungibleAssetInstance();
      dsMockUtils.setConstMock('statistics', 'maxStatsPerAsset', {
        returnValue: dsMockUtils.createMockU32(maxStats),
      });
      dsMockUtils.createQueryMock('statistics', 'assetTransferCompliances', {
        returnValue: {
          requirements: [
            rawCountRestriction,
            rawPercentageRestriction,
            rawClaimCountRestriction,
            rawClaimPercentageRestriction,
          ],
        },
      });
      dsMockUtils.createQueryMock('statistics', 'transferConditionExemptEntities', {
        entries: [[[null, dsMockUtils.createMockIdentityId(scopeId)], true]],
      });
      jest.spyOn(utilsConversionModule, 'u32ToBigNumber').mockClear().mockReturnValue(maxStats);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return all count transfer restrictions', async () => {
      const count = new Count(asset, context);
      const result = await count.get();

      expect(result).toEqual({
        restrictions: [countRestriction],
        availableSlots: new BigNumber(1),
      });
    });

    it('should return all percentage transfer restrictions', async () => {
      const percentage = new Percentage(asset, context);

      let result = await percentage.get();

      expect(result).toEqual({
        restrictions: [percentageRestriction],
        availableSlots: new BigNumber(1),
      });

      dsMockUtils.createQueryMock('statistics', 'transferConditionExemptEntities', {
        entries: [],
      });

      result = await percentage.get();

      expect(result).toEqual({
        restrictions: [
          {
            percentage: new BigNumber(49),
          },
        ],
        availableSlots: new BigNumber(1),
      });
    });

    it('should return all claimCount transfer restrictions', async () => {
      const claimCount = new ClaimCount(asset, context);

      const result = await claimCount.get();

      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          restrictions: [
            {
              min: new BigNumber(10),
              max: new BigNumber(20),
              claim: { type: ClaimType.Accredited, accredited: true },
              issuer,
              exemptedIds: ['someScopeId'],
            },
          ],
          availableSlots: new BigNumber(1),
        })
      );
    });

    it('should return all claimPercentage transfer restrictions', async () => {
      const claimPercentage = new ClaimPercentage(asset, context);

      const result = await claimPercentage.get();

      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          restrictions: [
            {
              min: '0.001',
              max: '0.002',
              claim: { type: ClaimType.Affiliate, affiliate: true },
              issuer,
              exemptedIds: ['someScopeId'],
            },
          ],
          availableSlots: new BigNumber(1),
        })
      );
    });
  });

  describe('method: enableStat', () => {
    let context: Context;
    let asset: FungibleAsset;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getFungibleAssetInstance();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure (count) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const count = new Count(asset, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<
        NumberedPortfolio[]
      >;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: {
              asset,
              count: new BigNumber(3),
              type: TransferRestrictionType.Count,
            },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const transaction = await count.enableStat({ count: new BigNumber(3) });

      expect(transaction).toBe(expectedTransaction);
    });

    it('should prepare the procedure (percentage) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const percentage = new Percentage(asset, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<
        NumberedPortfolio[]
      >;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: {
              asset,
              type: StatType.Balance,
            },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const transaction = await percentage.enableStat();

      expect(transaction).toBe(expectedTransaction);
    });
  });

  describe('method: disableStat', () => {
    let context: Context;
    let asset: FungibleAsset;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getFungibleAssetInstance();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure (count) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const count = new Count(asset, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<
        NumberedPortfolio[]
      >;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: {
              asset,
              type: StatType.Count,
            },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const transaction = await count.disableStat();

      expect(transaction).toBe(expectedTransaction);
    });

    it('should prepare the procedure (percentage) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const percentage = new Percentage(asset, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<
        NumberedPortfolio[]
      >;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: {
              asset,
              type: StatType.Balance,
            },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const transaction = await percentage.disableStat();

      expect(transaction).toBe(expectedTransaction);
    });

    it('should prepare the procedure (ClaimCount) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const claimCount = new ClaimCount(asset, context);
      const issuer = entityMockUtils.getIdentityInstance();

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<
        NumberedPortfolio[]
      >;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: {
              asset,
              type: StatType.ScopedCount,
              issuer,
              claimType: ClaimType.Jurisdiction,
            },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const transaction = await claimCount.disableStat({
        issuer,
        claimType: ClaimType.Jurisdiction,
      });

      expect(transaction).toBe(expectedTransaction);
    });

    it('should prepare the procedure (ClaimPercentage) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const claimPercentage = new ClaimPercentage(asset, context);
      const issuer = entityMockUtils.getIdentityInstance();

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<
        NumberedPortfolio[]
      >;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: {
              asset,
              type: StatType.ScopedBalance,
              issuer,
              claimType: ClaimType.Jurisdiction,
            },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const transaction = await claimPercentage.disableStat({
        issuer,
        claimType: ClaimType.Jurisdiction,
      });

      expect(transaction).toBe(expectedTransaction);
    });
  });

  describe('method: getStat', () => {
    let context: Context;
    let asset: FungibleAsset;

    let rawCountStatType: PolymeshPrimitivesStatisticsStatType;
    let rawPercentageStatType: PolymeshPrimitivesStatisticsStatType;
    let rawClaimCountStatType: PolymeshPrimitivesStatisticsStatType;
    let rawClaimPercentageStatType: PolymeshPrimitivesStatisticsStatType;

    let activeAssetStatsMock: jest.Mock;
    let issuerDid: PolymeshPrimitivesIdentityId;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      issuerDid = dsMockUtils.createMockIdentityId();
      asset = entityMockUtils.getFungibleAssetInstance();
      activeAssetStatsMock = dsMockUtils.createQueryMock('statistics', 'activeAssetStats');

      rawCountStatType = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.Count),
        claimIssuer: dsMockUtils.createMockOption(),
      });
      rawPercentageStatType = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.Balance),
        claimIssuer: dsMockUtils.createMockOption(),
      });
      rawClaimCountStatType = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.Count),
        claimIssuer: dsMockUtils.createMockOption([
          dsMockUtils.createMockClaimType(ClaimType.Affiliate),
          issuerDid,
        ]),
      });
      rawClaimPercentageStatType = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.ScopedBalance),
        claimIssuer: dsMockUtils.createMockOption([
          dsMockUtils.createMockClaimType(ClaimType.Accredited),
          issuerDid,
        ]),
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return the active stats status for (Count) when stats disabled', async () => {
      activeAssetStatsMock.mockResolvedValueOnce([]);
      const count = new Count(asset, context);

      const result = await count.getStat();

      expect(result).toEqual({
        isSet: false,
      });
    });

    it('should return the active stats status for (Count) when stats enabled', async () => {
      activeAssetStatsMock.mockResolvedValueOnce([rawCountStatType]);

      const count = new Count(asset, context);
      const result = await count.getStat();

      expect(result).toEqual({
        isSet: true,
      });
    });

    it('should return the active stats status for (Percentage) when stats disabled', async () => {
      activeAssetStatsMock.mockResolvedValueOnce([]);

      const percentage = new Percentage(asset, context);
      const result = await percentage.getStat();

      expect(result).toEqual({
        isSet: false,
      });
    });

    it('should return the active stats status for (Percentage) when stats enabled', async () => {
      activeAssetStatsMock.mockResolvedValueOnce([rawPercentageStatType]);
      const percentage = new Percentage(asset, context);

      const result = await percentage.getStat();

      expect(result).toEqual({
        isSet: true,
      });
    });

    it('should return the active stats status for (ClaimCount) when stats disabled', async () => {
      activeAssetStatsMock.mockResolvedValueOnce([]);
      const claimCount = new ClaimCount(asset, context);

      const result = await claimCount.getStat();

      expect(result).toEqual({
        isSet: false,
      });
    });

    it('should return the active stats status for (ClaimCount) when stats enabled', async () => {
      activeAssetStatsMock.mockResolvedValueOnce([rawClaimCountStatType]);
      const claimCount = new ClaimCount(asset, context);

      const result = await claimCount.getStat();

      expect(result.isSet).toBeTruthy();
      expect(result.claims).toBeDefined();

      const [claim] = result.claims || [];
      expect(claim.claimType).toEqual(ClaimType.Affiliate);
    });

    it('should return the active stats status for (ClaimPercentage) when stats disabled', async () => {
      activeAssetStatsMock.mockResolvedValueOnce([]);
      const claimPercentage = new ClaimPercentage(asset, context);

      const result = await claimPercentage.getStat();

      expect(result).toEqual({
        isSet: false,
      });
    });

    it('should return the active stats status for (ClaimPercentage) when stats enabled', async () => {
      activeAssetStatsMock.mockResolvedValueOnce([rawClaimPercentageStatType]);
      const claimPercentage = new ClaimPercentage(asset, context);

      const result = await claimPercentage.getStat();

      expect(result.isSet).toBeTruthy();
      expect(result.claims).toBeDefined();

      const [claim] = result.claims || [];
      expect(claim.claimType).toEqual(ClaimType.Accredited);
    });
  });
});
