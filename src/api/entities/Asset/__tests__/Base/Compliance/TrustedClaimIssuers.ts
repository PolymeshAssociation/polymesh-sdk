import {
  PolymeshPrimitivesConditionTrustedIssuer,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import { when } from 'jest-when';

import { Context, FungibleAsset, Namespace, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { ModifyAssetTrustedClaimIssuersAddSetParams } from '~/types';
import { TrustedClaimIssuerOperation } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

import { TrustedClaimIssuers } from '../../../Base/Compliance/TrustedClaimIssuers';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('TrustedClaimIssuers class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(TrustedClaimIssuers.prototype instanceof Namespace).toBe(true);
  });

  describe('method: set', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance();
      const trustedClaimIssuers = new TrustedClaimIssuers(asset, context);

      const args: ModifyAssetTrustedClaimIssuersAddSetParams = {
        claimIssuers: [
          { identity: entityMockUtils.getIdentityInstance({ did: 'someDid' }), trustedFor: null },
          { identity: entityMockUtils.getIdentityInstance({ did: 'otherDid' }), trustedFor: null },
        ],
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { ticker: asset.ticker, ...args, operation: TrustedClaimIssuerOperation.Set },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await trustedClaimIssuers.set({
        ...args,
      });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: add', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance();
      const trustedClaimIssuers = new TrustedClaimIssuers(asset, context);

      const args: ModifyAssetTrustedClaimIssuersAddSetParams = {
        claimIssuers: [
          { identity: entityMockUtils.getIdentityInstance({ did: 'someDid' }), trustedFor: null },
          { identity: entityMockUtils.getIdentityInstance({ did: 'otherDid' }), trustedFor: null },
        ],
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { ticker: asset.ticker, ...args, operation: TrustedClaimIssuerOperation.Add },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await trustedClaimIssuers.add({
        ...args,
      });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: remove', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance();
      const trustedClaimIssuers = new TrustedClaimIssuers(asset, context);

      const args = {
        claimIssuers: ['someDid', 'otherDid'],
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { ticker: asset.ticker, ...args, operation: TrustedClaimIssuerOperation.Remove },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await trustedClaimIssuers.remove({
        ...args,
      });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: get', () => {
    let ticker: string;
    let rawTicker: PolymeshPrimitivesTicker;
    let stringToTickerSpy: jest.SpyInstance;
    let context: Context;
    let asset: FungibleAsset;
    let expectedDids: string[];
    let claimIssuers: PolymeshPrimitivesConditionTrustedIssuer[];

    let trustedClaimIssuerMock: jest.Mock;

    let trustedClaimIssuers: TrustedClaimIssuers;

    beforeAll(() => {
      ticker = 'test';
      rawTicker = dsMockUtils.createMockTicker(ticker);
      stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getFungibleAssetInstance({ ticker });

      expectedDids = ['someDid', 'otherDid', 'yetAnotherDid'];

      claimIssuers = [];

      expectedDids.forEach(did => {
        claimIssuers.push(
          dsMockUtils.createMockTrustedIssuer({
            issuer: dsMockUtils.createMockIdentityId(did),
            trustedFor: dsMockUtils.createMockTrustedFor('Any'),
          })
        );
      });

      when(stringToTickerSpy).calledWith(ticker, context).mockReturnValue(rawTicker);
      trustedClaimIssuerMock = dsMockUtils.createQueryMock(
        'complianceManager',
        'trustedClaimIssuer'
      );

      trustedClaimIssuers = new TrustedClaimIssuers(asset, context);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the current default trusted claim issuers', async () => {
      when(trustedClaimIssuerMock).calledWith(rawTicker).mockResolvedValue(claimIssuers);

      const result = await trustedClaimIssuers.get();

      expect(result).toEqual(
        expectedDids.map(did => ({ identity: expect.objectContaining({ did }), trustedFor: null }))
      );
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';

      when(trustedClaimIssuerMock)
        .calledWith(rawTicker, expect.any(Function))
        .mockImplementation((_, cbFunc) => {
          cbFunc(claimIssuers);
          return unsubCallback;
        });

      const callback = jest.fn();

      const result = await trustedClaimIssuers.get(callback);

      expect(result).toBe(unsubCallback);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining(
          expectedDids.map(did => ({
            identity: expect.objectContaining({ did }),
            trustedFor: null,
          }))
        )
      );
    });
  });
});
