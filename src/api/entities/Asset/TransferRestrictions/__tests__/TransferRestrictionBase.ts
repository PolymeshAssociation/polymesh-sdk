import { PolymeshPrimitivesTransferComplianceTransferCondition } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Asset, Context, Namespace, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  AddCountTransferRestrictionParams,
  AddPercentageTransferRestrictionParams,
  CountTransferRestriction,
  PercentageTransferRestriction,
  SetCountTransferRestrictionsParams,
  SetPercentageTransferRestrictionsParams,
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

    it('should prepare the procedure (count) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const count = new Count(asset, context);

      const args: Omit<AddCountTransferRestrictionParams, 'type'> = {
        count: new BigNumber(3),
        exemptedIdentities: ['someScopeId'],
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<number>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: asset.ticker, ...args, type: TransferRestrictionType.Count },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await count.addRestriction({
        ...args,
      });

      expect(queue).toBe(expectedQueue);
    });

    it('should prepare the procedure (percentage) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const percentage = new Percentage(asset, context);

      const args: Omit<AddPercentageTransferRestrictionParams, 'type'> = {
        percentage: new BigNumber(3),
        exemptedIdentities: ['someScopeId'],
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<number>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: asset.ticker, ...args, type: TransferRestrictionType.Percentage },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await percentage.addRestriction({
        ...args,
      });

      expect(queue).toBe(expectedQueue);
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

    it('should prepare the procedure (count) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const count = new Count(asset, context);

      const args: Omit<SetCountTransferRestrictionsParams, 'type'> = {
        restrictions: [{ count: new BigNumber(3), exemptedIdentities: ['someScopeId'] }],
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<number>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: asset.ticker, ...args, type: TransferRestrictionType.Count },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await count.setRestrictions({
        ...args,
      });

      expect(queue).toBe(expectedQueue);
    });

    it('should prepare the procedure (percentage) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const percentage = new Percentage(asset, context);

      const args: Omit<SetPercentageTransferRestrictionsParams, 'type'> = {
        restrictions: [{ percentage: new BigNumber(49), exemptedIdentities: ['someScopeId'] }],
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<number>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: asset.ticker, ...args, type: TransferRestrictionType.Percentage },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await percentage.setRestrictions({
        ...args,
      });

      expect(queue).toBe(expectedQueue);
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

    it('should prepare the procedure (count) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const count = new Count(asset, context);

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<number>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: asset.ticker, restrictions: [], type: TransferRestrictionType.Count },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await count.removeRestrictions();

      expect(queue).toBe(expectedQueue);
    });

    it('should prepare the procedure (percentage) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const percentage = new Percentage(asset, context);

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<number>;

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
        .resolves(expectedQueue);

      const queue = await percentage.removeRestrictions();

      expect(queue).toBe(expectedQueue);
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
    });

    beforeEach(() => {
      const maxStats = new BigNumber(2);
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getAssetInstance();
      dsMockUtils.setConstMock('statistics', 'maxStatsPerAsset', {
        returnValue: dsMockUtils.createMockU32(maxStats),
      });
      dsMockUtils.createQueryStub('statistics', 'assetTransferCompliances', {
        returnValue: { requirements: [rawCountRestriction, rawPercentageRestriction] },
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
  });
});
