import BigNumber from 'bignumber.js';

import { Entity } from '~/base';
import { Context } from '~/context';
import { polkadotMockUtils } from '~/testUtils/mocks';
import { Authorization } from '~/types';

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
});
