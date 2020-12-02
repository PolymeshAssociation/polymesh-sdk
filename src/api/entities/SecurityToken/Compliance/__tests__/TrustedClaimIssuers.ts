import { Ticker, TrustedIssuer } from 'polymesh-types/types';
import sinon from 'sinon';

import { ModifyTokenTrustedClaimIssuersAddSetParams } from '~/api/procedures/modifyTokenTrustedClaimIssuers';
import {
  Context,
  DefaultTrustedClaimIssuer,
  modifyTokenTrustedClaimIssuers,
  Namespace,
  SecurityToken,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { TrustedClaimIssuerOperation } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

import { TrustedClaimIssuers } from '../TrustedClaimIssuers';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('TrustedClaimIssuers class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
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
      const token = entityMockUtils.getSecurityTokenInstance();
      const trustedClaimIssuers = new TrustedClaimIssuers(token, context);

      const args: ModifyTokenTrustedClaimIssuersAddSetParams = {
        claimIssuers: [
          { identity: entityMockUtils.getIdentityInstance({ did: 'someDid' }), trustedFor: null },
          { identity: entityMockUtils.getIdentityInstance({ did: 'otherDid' }), trustedFor: null },
        ],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(modifyTokenTrustedClaimIssuers, 'prepare')
        .withArgs(
          { ticker: token.ticker, ...args, operation: TrustedClaimIssuerOperation.Set },
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
      const token = entityMockUtils.getSecurityTokenInstance();
      const trustedClaimIssuers = new TrustedClaimIssuers(token, context);

      const args: ModifyTokenTrustedClaimIssuersAddSetParams = {
        claimIssuers: [
          { identity: entityMockUtils.getIdentityInstance({ did: 'someDid' }), trustedFor: null },
          { identity: entityMockUtils.getIdentityInstance({ did: 'otherDid' }), trustedFor: null },
        ],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(modifyTokenTrustedClaimIssuers, 'prepare')
        .withArgs(
          { ticker: token.ticker, ...args, operation: TrustedClaimIssuerOperation.Add },
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
      const token = entityMockUtils.getSecurityTokenInstance();
      const trustedClaimIssuers = new TrustedClaimIssuers(token, context);

      const args = {
        claimIssuers: ['someDid', 'otherDid'],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(modifyTokenTrustedClaimIssuers, 'prepare')
        .withArgs(
          { ticker: token.ticker, ...args, operation: TrustedClaimIssuerOperation.Remove },
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
    let token: SecurityToken;
    let expectedDids: string[];
    let expectedTrustedClaimIssuers: DefaultTrustedClaimIssuer[];
    let claimIssuers: TrustedIssuer[];

    let trustedClaimIssuerStub: sinon.SinonStub;

    let trustedClaimIssuers: TrustedClaimIssuers;

    beforeAll(() => {
      ticker = 'test';
      rawTicker = dsMockUtils.createMockTicker(ticker);
      stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
      context = dsMockUtils.getContextInstance();
      token = entityMockUtils.getSecurityTokenInstance({ ticker });

      expectedDids = ['someDid', 'otherDid', 'yetAnotherDid'];

      expectedTrustedClaimIssuers = [];
      claimIssuers = [];

      expectedDids.forEach(did => {
        expectedTrustedClaimIssuers.push(
          new DefaultTrustedClaimIssuer({ did, ticker, trustedFor: null }, context)
        );
        claimIssuers.push(
          dsMockUtils.createMockTrustedIssuer({
            issuer: dsMockUtils.createMockIdentityId(did),
            // eslint-disable-next-line @typescript-eslint/camelcase
            trusted_for: dsMockUtils.createMockTrustedFor('Any'),
          })
        );
      });

      stringToTickerStub.withArgs(ticker, context).returns(rawTicker);
      trustedClaimIssuerStub = dsMockUtils.createQueryStub(
        'complianceManager',
        'trustedClaimIssuer'
      );

      trustedClaimIssuers = new TrustedClaimIssuers(token, context);
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
