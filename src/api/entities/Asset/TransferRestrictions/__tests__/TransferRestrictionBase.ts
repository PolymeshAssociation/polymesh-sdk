import { PolymeshPrimitivesTransferComplianceTransferCondition } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { ClaimCount } from '~/api/entities/Asset/TransferRestrictions/ClaimCount';
import { ClaimPercentage } from '~/api/entities/Asset/TransferRestrictions/ClaimPercentage';
import { Asset, Context, Namespace, NumberedPortfolio, PolymeshTransaction } from '~/internal';
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
    procedureMockUtils.initMocks();
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
    let asset: Asset;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getAssetInstance();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should prepare the procedure (count) with the correct arguments and context, and return the resulting transaction', async () => {
      const count = new Count(asset, context);

      const args: Omit<AddCountTransferRestrictionParams, 'type'> = {
        count: new BigNumber(3),
        exemptedIdentities: ['someScopeId'],
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<number>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: asset.ticker, ...args, type: TransferRestrictionType.Count },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedTransaction);

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

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: asset.ticker, ...args, type: TransferRestrictionType.Percentage },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedTransaction);

      const tx = await percentage.addRestriction({
        ...args,
      });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: setRestrictions', () => {
    let context: Context;
    let asset: Asset;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getAssetInstance();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should prepare the procedure (count) with the correct arguments and context, and return the resulting transaction', async () => {
      const count = new Count(asset, context);

      const args: Omit<SetCountTransferRestrictionsParams, 'type'> = {
        restrictions: [{ count: new BigNumber(3), exemptedIdentities: ['someScopeId'] }],
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<number>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: asset.ticker, ...args, type: TransferRestrictionType.Count },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedTransaction);

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

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: asset.ticker, ...args, type: TransferRestrictionType.Percentage },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedTransaction);

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

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: asset.ticker, ...args, type: TransferRestrictionType.ClaimCount },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedTransaction);

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

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: asset.ticker, ...args, type: TransferRestrictionType.ClaimPercentage },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedTransaction);

      const transaction = await claimPercentage.setRestrictions({
        ...args,
      });

      expect(transaction).toBe(expectedTransaction);
    });
  });

  describe('method: removeRestrictions', () => {
    let context: Context;
    let asset: Asset;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getAssetInstance();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should prepare the procedure (count) with the correct arguments and context, and return the resulting transaction', async () => {
      const count = new Count(asset, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<number>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: asset.ticker, restrictions: [], type: TransferRestrictionType.Count },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedTransaction);

      const tx = await count.removeRestrictions();

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the procedure (percentage) with the correct arguments and context, and return the resulting transaction', async () => {
      const percentage = new Percentage(asset, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<number>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: {
              ticker: asset.ticker,
              restrictions: [],
              type: TransferRestrictionType.Percentage,
            },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedTransaction);

      const tx = await percentage.removeRestrictions();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: get', () => {
    let context: Context;
    let asset: Asset;
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
      const maxStats = new BigNumber(2);
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getAssetInstance();
      dsMockUtils.setConstMock('statistics', 'maxStatsPerAsset', {
        returnValue: dsMockUtils.createMockU32(maxStats),
      });
      dsMockUtils.createQueryStub('statistics', 'assetTransferCompliances', {
        returnValue: {
          requirements: [
            rawCountRestriction,
            rawPercentageRestriction,
            rawClaimCountRestriction,
            rawClaimPercentageRestriction,
          ],
        },
      });
      dsMockUtils.createQueryStub('statistics', 'transferConditionExemptEntities', {
        entries: [[[null, dsMockUtils.createMockScopeId(scopeId)], true]],
      });
      sinon.stub(utilsConversionModule, 'u32ToBigNumber').returns(maxStats);
    });

    afterEach(() => {
      sinon.restore();
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

      dsMockUtils.createQueryStub('statistics', 'transferConditionExemptEntities', {
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
    let asset: Asset;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getAssetInstance();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should prepare the procedure (count) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const count = new Count(asset, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<
        NumberedPortfolio[]
      >;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: {
              ticker: asset.ticker,
              count: new BigNumber(3),
              type: TransferRestrictionType.Count,
            },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedTransaction);

      const transaction = await count.enableStat({ count: new BigNumber(3) });

      expect(transaction).toBe(expectedTransaction);
    });

    it('should prepare the procedure (percentage) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const percentage = new Percentage(asset, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<
        NumberedPortfolio[]
      >;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: {
              ticker: asset.ticker,
              type: StatType.Balance,
            },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedTransaction);

      const transaction = await percentage.enableStat();

      expect(transaction).toBe(expectedTransaction);
    });
  });

  describe('method: disableStat', () => {
    let context: Context;
    let asset: Asset;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getAssetInstance();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should prepare the procedure (count) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const count = new Count(asset, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<
        NumberedPortfolio[]
      >;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: {
              ticker: asset.ticker,
              type: StatType.Count,
            },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedTransaction);

      const transaction = await count.disableStat();

      expect(transaction).toBe(expectedTransaction);
    });

    it('should prepare the procedure (percentage) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const percentage = new Percentage(asset, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<
        NumberedPortfolio[]
      >;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: {
              ticker: asset.ticker,
              type: StatType.Balance,
            },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedTransaction);

      const transaction = await percentage.disableStat();

      expect(transaction).toBe(expectedTransaction);
    });

    it('should prepare the procedure (ClaimCount) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const claimCount = new ClaimCount(asset, context);
      const issuer = entityMockUtils.getIdentityInstance();

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<
        NumberedPortfolio[]
      >;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: {
              ticker: asset.ticker,
              type: StatType.ScopedCount,
              issuer,
              claimType: ClaimType.Jurisdiction,
            },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedTransaction);

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

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: {
              ticker: asset.ticker,
              type: StatType.ScopedBalance,
              issuer,
              claimType: ClaimType.Jurisdiction,
            },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedTransaction);

      const transaction = await claimPercentage.disableStat({
        issuer,
        claimType: ClaimType.Jurisdiction,
      });

      expect(transaction).toBe(expectedTransaction);
    });
  });
});
