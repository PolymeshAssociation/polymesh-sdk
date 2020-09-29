import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { AuthorizationRequest, Entity, Identity } from '~/api/entities';
import { acceptJoinIdentityAuthorization, consumeAuthorizationRequests } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import { dsMockUtils } from '~/testUtils/mocks';
import { Authorization, AuthorizationType } from '~/types';

describe('AuthorizationRequest class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should extend entity', () => {
    expect(AuthorizationRequest.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign target did, issuer did, expiry and data to instance', () => {
      const targetDid = 'someDid';
      const issuerDid = 'otherDid';
      const targetIdentity = new Identity({ did: targetDid }, context);
      const issuerIdentity = new Identity({ did: issuerDid }, context);
      const expiry = new Date();
      const data = ('something' as unknown) as Authorization;
      const authRequest = new AuthorizationRequest(
        { target: targetIdentity, issuer: issuerIdentity, expiry, data, authId: new BigNumber(1) },
        context
      );

      expect(authRequest.target).toEqual(targetIdentity);
      expect(authRequest.issuer).toEqual(issuerIdentity);
      expect(authRequest.expiry).toBe(expiry);
      expect(authRequest.data).toBe(data);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(AuthorizationRequest.isUniqueIdentifiers({ authId: new BigNumber(1) })).toBe(true);
      expect(AuthorizationRequest.isUniqueIdentifiers({})).toBe(false);
      expect(AuthorizationRequest.isUniqueIdentifiers({ authId: 3 })).toBe(false);
    });
  });

  describe('method: accept', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the consumeAuthorizationRequests procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: null,
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: { type: AuthorizationType.NoData },
        },
        context
      );

      const args = {
        accept: true,
        authRequests: [authorizationRequest],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(consumeAuthorizationRequests, 'prepare')
        .withArgs({ ...args }, context)
        .resolves(expectedQueue);

      const queue = await authorizationRequest.accept();

      expect(queue).toBe(expectedQueue);
    });

    test('should prepare the acceptJoinIdentityAuthorization procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: null,
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: { type: AuthorizationType.JoinIdentity, value: [] },
        },
        context
      );

      const args = {
        authRequest: authorizationRequest,
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(acceptJoinIdentityAuthorization, 'prepare')
        .withArgs({ ...args }, context)
        .resolves(expectedQueue);

      const queue = await authorizationRequest.accept();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: remove', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: null,
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: { type: AuthorizationType.NoData },
        },
        context
      );

      const args = {
        accept: false,
        authRequests: [authorizationRequest],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(consumeAuthorizationRequests, 'prepare')
        .withArgs({ ...args }, context)
        .resolves(expectedQueue);

      const queue = await authorizationRequest.remove();

      expect(queue).toBe(expectedQueue);
    });
  });
});
