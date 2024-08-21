import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { BaseAsset, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { createMockBTreeSet, MockContext } from '~/testUtils/mocks/dataSources';
import { tuple } from '~/types/utils';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('BaseAsset class', () => {
  let assetId: string;
  let context: MockContext;
  let mediatorDid: string;
  let asset: BaseAsset;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    assetId = '0x1234';
    asset = new BaseAsset({ assetId }, context);

    mediatorDid = 'someDid';

    dsMockUtils.createQueryMock('asset', 'mandatoryMediators', {
      returnValue: createMockBTreeSet([dsMockUtils.createMockIdentityId(mediatorDid)]),
    });
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('method: setVenueFiltering', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const enabled = true;

      const args = {
        enabled,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<BaseAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await asset.setVenueFiltering(args);

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the procedure and return the resulting transaction for allowingVenues', async () => {
      const venues = [new BigNumber(1), new BigNumber(2)];

      const args = {
        allowedVenues: venues,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<BaseAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await asset.setVenueFiltering(args);

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the procedure and return the resulting transaction for disallowingVenues', async () => {
      const venues = [new BigNumber(1), new BigNumber(2)];

      const args = {
        disallowedVenues: venues,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<BaseAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await asset.setVenueFiltering(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getVenueFilteringDetails', () => {
    it('should return venue filtering details for the asset', async () => {
      dsMockUtils.createQueryMock('settlement', 'venueFiltering', {
        returnValue: dsMockUtils.createMockBool(true),
      });
      dsMockUtils.createQueryMock('settlement', 'venueAllowList', {
        entries: [
          tuple(
            [dsMockUtils.createMockAssetId(assetId), dsMockUtils.createMockU64(new BigNumber(1))],
            dsMockUtils.createMockBool(true)
          ),
        ],
      });

      const result = await asset.getVenueFilteringDetails();

      expect(result).toEqual({
        isEnabled: true,
        allowedVenues: expect.arrayContaining([expect.objectContaining({ id: new BigNumber(1) })]),
      });
    });
  });

  describe('method: linkTicker', () => {
    it('should call the procedure and return the result', async () => {
      const ticker = 'SOME_TICKER';
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<BaseAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, ticker }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await asset.linkTicker({ ticker });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: exists', () => {
    it('should return whether the BaseAsset exists', async () => {
      dsMockUtils.createQueryMock('asset', 'securityTokens', {
        size: new BigNumber(10),
      });

      dsMockUtils.createQueryMock('nft', 'collectionAsset', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(0)),
      });

      let result = await asset.exists();

      expect(result).toBe(true);

      dsMockUtils.createQueryMock('nft', 'collectionAsset', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(2)),
      });

      result = await asset.exists();

      expect(result).toBe(false);

      dsMockUtils.createQueryMock('asset', 'securityTokens', {
        size: new BigNumber(0),
      });

      dsMockUtils.createQueryMock('nft', 'collectionAsset', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(0)),
      });

      result = await asset.exists();

      expect(result).toBe(false);
    });
  });
});
