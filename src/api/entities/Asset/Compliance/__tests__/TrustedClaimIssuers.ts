import { Ticker, TrustedIssuer } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  Asset,
  Context,
  DefaultTrustedClaimIssuer,
  ModifyAssetTrustedClaimIssuersAddSetParams,
  Namespace,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { TrustedClaimIssuer } from '~/types';
import { TrustedClaimIssuerOperation } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

import { TrustedClaimIssuers } from '../TrustedClaimIssuers';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
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

  test('should extend namespace', () => {
    expect(TrustedClaimIssuers.prototype instanceof Namespace).toBe(true);
  });

  describe('method: set', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getAssetInstance();
      const trustedClaimIssuers = new TrustedClaimIssuers(asset, context);

      const args: ModifyAssetTrustedClaimIssuersAddSetParams = {
        claimIssuers: [
          { identity: entityMockUtils.getIdentityInstance({ did: 'someDid' }), trustedFor: null },
          { identity: entityMockUtils.getIdentityInstance({ did: 'otherDid' }), trustedFor: null },
        ],
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<Asset>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: asset.ticker, ...args, operation: TrustedClaimIssuerOperation.Set },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await trustedClaimIssuers.set({
        ...args,
      });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: add', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getAssetInstance();
      const trustedClaimIssuers = new TrustedClaimIssuers(asset, context);

      const args: ModifyAssetTrustedClaimIssuersAddSetParams = {
        claimIssuers: [
          { identity: entityMockUtils.getIdentityInstance({ did: 'someDid' }), trustedFor: null },
          { identity: entityMockUtils.getIdentityInstance({ did: 'otherDid' }), trustedFor: null },
        ],
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<Asset>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: asset.ticker, ...args, operation: TrustedClaimIssuerOperation.Add },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await trustedClaimIssuers.add({
        ...args,
      });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: remove', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getAssetInstance();
      const trustedClaimIssuers = new TrustedClaimIssuers(asset, context);

      const args = {
        claimIssuers: ['someDid', 'otherDid'],
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<Asset>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: asset.ticker, ...args, operation: TrustedClaimIssuerOperation.Remove },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await trustedClaimIssuers.remove({
        ...args,
      });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: get', () => {
    let ticker: string;
    let rawTicker: Ticker;
    let stringToTickerStub: sinon.SinonStub;
    let context: Context;
    let asset: Asset;
    let expectedDids: string[];
    let expectedTrustedClaimIssuers: TrustedClaimIssuer<true>[];
    let claimIssuers: TrustedIssuer[];

    let trustedClaimIssuerStub: sinon.SinonStub;

    let trustedClaimIssuers: TrustedClaimIssuers;

    beforeAll(() => {
      ticker = 'test';
      rawTicker = dsMockUtils.createMockTicker(ticker);
      stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getAssetInstance({ ticker });

      expectedDids = ['someDid', 'otherDid', 'yetAnotherDid'];

      expectedTrustedClaimIssuers = [];
      claimIssuers = [];

      expectedDids.forEach(did => {
        expectedTrustedClaimIssuers.push({
          identity: new DefaultTrustedClaimIssuer({ did, ticker }, context),
          trustedFor: null,
        });
        claimIssuers.push(
          dsMockUtils.createMockTrustedIssuer({
            issuer: dsMockUtils.createMockIdentityId(did),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            trusted_for: dsMockUtils.createMockTrustedFor('Any'),
          })
        );
      });

      stringToTickerStub.withArgs(ticker, context).returns(rawTicker);
      trustedClaimIssuerStub = dsMockUtils.createQueryStub(
        'complianceManager',
        'trustedClaimIssuer'
      );

      trustedClaimIssuers = new TrustedClaimIssuers(asset, context);
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should return the current default trusted claim issuers', async () => {
      trustedClaimIssuerStub.withArgs(rawTicker).resolves(claimIssuers);

      const result = await trustedClaimIssuers.get();

      expect(result).toEqual(expectedTrustedClaimIssuers);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';

      trustedClaimIssuerStub.withArgs(rawTicker).callsFake((_, cbFunc) => {
        cbFunc(claimIssuers);
        return unsubCallback;
      });

      const callback = sinon.stub();

      const result = await trustedClaimIssuers.get(callback);

      expect(result).toBe(unsubCallback);
      sinon.assert.calledWithExactly(callback, expectedTrustedClaimIssuers);
    });
  });
});
