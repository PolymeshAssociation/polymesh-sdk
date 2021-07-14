import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { AuthorizationRequest, Context, Entity, Identity, TransactionQueue } from '~/internal';
import { dsMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Authorization, AuthorizationType, SignerType } from '~/types';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('AuthorizationRequest class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  test('should extend Entity', () => {
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

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await authorizationRequest.accept();

      expect(queue).toBe(expectedQueue);
    });

    test('should prepare the consumeJoinIdentityAuthorization procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: null,
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: {
            type: AuthorizationType.JoinIdentity,
            value: {
              tokens: null,
              transactions: null,
              transactionGroups: [],
              portfolios: null,
            },
          },
        },
        context
      );

      const args = {
        authRequest: authorizationRequest,
        accept: true,
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await authorizationRequest.accept();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: remove', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the consumeAuthorizationRequest procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await authorizationRequest.remove();

      expect(queue).toBe(expectedQueue);
    });

    test('should prepare the consumeJoinIdentityAuthorization procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: null,
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: {
            type: AuthorizationType.JoinIdentity,
            value: {
              tokens: null,
              transactions: null,
              transactionGroups: [],
              portfolios: null,
            },
          },
        },
        context
      );

      const args = {
        authRequest: authorizationRequest,
        accept: false,
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await authorizationRequest.remove();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: isExpired', () => {
    test('should return whether the request has expired', () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: new Date('10/14/1987 UTC'),
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: { type: AuthorizationType.NoData },
        },
        context
      );
      expect(authorizationRequest.isExpired()).toBe(true);

      authorizationRequest.expiry = null;
      expect(authorizationRequest.isExpired()).toBe(false);
    });
  });

  describe('method: toJson', () => {
    test('should return a human readable version of the entity', () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: new Date('10/14/1987 UTC'),
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: { type: AuthorizationType.NoData },
        },
        context
      );
      expect(authorizationRequest.toJson()).toEqual({
        id: '1',
        expiry: '1987-10-14T00:00:00.000Z',
        target: {
          type: SignerType.Identity,
          value: 'someDid',
        },
        issuer: 'otherDid',
        data: { type: AuthorizationType.NoData },
      });
    });
  });
});
