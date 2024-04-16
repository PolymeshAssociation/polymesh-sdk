import { bool, u64 } from '@polkadot/types';
import * as utilsPublicConversionModule from '@polymeshassociation/polymesh-sdk/utils/conversion';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareConfidentialVenueFiltering,
  setConfidentialVenueFiltering,
} from '~/api/procedures/setConfidentialVenueFiltering';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MockCodec } from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import { RoleType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/ConfidentialVenue',
  require('~/testUtils/mocks/entities').mockConfidentialVenueModule(
    '~/api/entities/ConfidentialVenue'
  )
);

describe('setConfidentialVenueFiltering procedure', () => {
  let mockContext: Mocked<Context>;
  let venueFilteringMock: jest.Mock;
  const enabledAssetId = 'ENABLED';
  const disabledAssetId = 'DISABLED';
  let serializeConfidentialAssetIdSpy: jest.SpyInstance;
  let booleanToBoolSpy: jest.SpyInstance;
  let bigNumberToU64Spy: jest.SpyInstance;
  let rawFalse: bool;
  const venues: BigNumber[] = [new BigNumber(1)];
  let rawVenues: MockCodec<u64>[];

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    serializeConfidentialAssetIdSpy = jest.spyOn(
      utilsConversionModule,
      'serializeConfidentialAssetId'
    );
    booleanToBoolSpy = jest.spyOn(utilsPublicConversionModule, 'booleanToBool');
    bigNumberToU64Spy = jest.spyOn(utilsPublicConversionModule, 'bigNumberToU64');
    rawFalse = dsMockUtils.createMockBool(false);
  });

  beforeEach(() => {
    entityMockUtils.configureMocks();
    mockContext = dsMockUtils.getContextInstance();
    venueFilteringMock = dsMockUtils.createQueryMock('confidentialAsset', 'venueFiltering');
    rawVenues = venues.map(venue => dsMockUtils.createMockU64(venue));

    when(serializeConfidentialAssetIdSpy)
      .calledWith(enabledAssetId)
      .mockReturnValue(enabledAssetId);
    when(serializeConfidentialAssetIdSpy)
      .calledWith(disabledAssetId)
      .mockReturnValue(disabledAssetId);

    when(venueFilteringMock)
      .calledWith(enabledAssetId)
      .mockResolvedValue(dsMockUtils.createMockBool(true));
    when(venueFilteringMock)
      .calledWith(disabledAssetId)
      .mockResolvedValue(dsMockUtils.createMockBool(false));

    when(booleanToBoolSpy).calledWith(false, mockContext).mockReturnValue(rawFalse);
    when(bigNumberToU64Spy).calledWith(venues[0], mockContext).mockReturnValue(rawVenues[0]);
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

  describe('setConfidentialVenueFiltering', () => {
    it('the procedure method should be defined', () => {
      expect(setConfidentialVenueFiltering).toBeDefined();
    });

    it('calling it should return a new procedure', () => {
      const boundFunc = setConfidentialVenueFiltering.bind(mockContext);

      expect(boundFunc).not.toThrow();
      expect(procedureMockUtils.getInstance<Params, void>(mockContext)).toBeDefined();
    });
  });

  describe('prepareConfidentialVenueFiltering', () => {
    it('should return a setConfidentialVenueFiltering transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const setEnabled = false;
      const transaction = dsMockUtils.createTxMock('confidentialAsset', 'setVenueFiltering');

      const result = await prepareConfidentialVenueFiltering.call(proc, {
        assetId: enabledAssetId,
        enabled: setEnabled,
      });

      expect(result).toEqual({
        transactions: [
          {
            transaction,
            args: [enabledAssetId, rawFalse],
          },
        ],
        resolver: undefined,
      });
    });

    it('should return a allowVenues transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const transaction = dsMockUtils.createTxMock('confidentialAsset', 'allowVenues');

      const result = await prepareConfidentialVenueFiltering.call(proc, {
        assetId: enabledAssetId,
        allowedVenues: venues,
      });

      expect(result).toEqual({
        transactions: [
          {
            transaction,
            args: [enabledAssetId, rawVenues],
          },
        ],
        resolver: undefined,
      });
    });

    it('should return a disallowVenues transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const transaction = dsMockUtils.createTxMock('confidentialAsset', 'disallowVenues');

      const result = await prepareConfidentialVenueFiltering.call(proc, {
        assetId: enabledAssetId,
        disallowedVenues: venues,
      });

      expect(result).toEqual({
        transactions: [
          {
            transaction,
            args: [enabledAssetId, rawVenues],
          },
        ],
        resolver: undefined,
      });
    });

    it('should return empty transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      const result = await prepareConfidentialVenueFiltering.call(proc, {
        assetId: enabledAssetId,
        disallowedVenues: [],
        allowedVenues: [],
      });

      expect(result).toEqual({
        transactions: [],
        resolver: undefined,
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions for setConfidentialVenueFiltering', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args: Params = {
        assetId: enabledAssetId,
        enabled: true,
      };

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.ConfidentialAssetOwner, assetId: enabledAssetId }],
        permissions: {
          transactions: [TxTags.confidentialAsset.SetVenueFiltering],
          assets: [],
          portfolios: [],
        },
      });
    });

    it('should return the appropriate roles and permissions for allowVenues', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args: Params = {
        assetId: enabledAssetId,
        allowedVenues: venues,
      };

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.ConfidentialAssetOwner, assetId: enabledAssetId }],
        permissions: {
          transactions: [TxTags.confidentialAsset.AllowVenues],
          assets: [],
          portfolios: [],
        },
      });
    });

    it('should return the appropriate roles and permissions for disallowVenues', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args: Params = {
        assetId: enabledAssetId,
        disallowedVenues: venues,
      };

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.ConfidentialAssetOwner, assetId: enabledAssetId }],
        permissions: {
          transactions: [TxTags.confidentialAsset.DisallowVenues],
          assets: [],
          portfolios: [],
        },
      });
    });
  });
});
