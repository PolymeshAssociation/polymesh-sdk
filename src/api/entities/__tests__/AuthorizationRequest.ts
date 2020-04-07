import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { consumeAuthorizationRequests } from '~/api/procedures';
import { Entity, TransactionQueue } from '~/base';
import { Context } from '~/context';
import { polkadotMockUtils } from '~/testUtils/mocks';
import { Authorization, AuthorizationType } from '~/types';

import { AuthorizationRequest } from '../AuthorizationRequest';

describe('AuthorizationRequest class', () => {
  let context: Context;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  beforeEach(() => {
    context = polkadotMockUtils.getContextInstance();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('should extend entity', () => {
    expect(AuthorizationRequest.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign target did, issuer did, expiry and data to instance', () => {
      const targetDid = 'someDid';
      const issuerDid = 'otherDid';
      const expiry = new Date();
      const data = ('something' as unknown) as Authorization;
      const authRequest = new AuthorizationRequest(
        { targetDid, issuerDid, expiry, data, authId: new BigNumber(1) },
        context
      );

      expect(authRequest.targetDid).toBe(targetDid);
      expect(authRequest.issuerDid).toBe(issuerDid);
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

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: null,
          targetDid: 'someDid',
          issuerDid: 'otherDid',
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
          targetDid: 'someDid',
          issuerDid: 'otherDid',
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
