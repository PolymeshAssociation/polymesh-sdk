import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  Account,
  AuthorizationRequest,
  Context,
  Entity,
  Identity,
  PolymeshTransaction,
} from '~/internal';
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

  it('should extend Entity', () => {
    expect(AuthorizationRequest.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    it('should assign target did, issuer did, expiry and data to instance', () => {
      const targetDid = 'someDid';
      const issuerDid = 'otherDid';
      const targetIdentity = new Identity({ did: targetDid }, context);
      const issuerIdentity = new Identity({ did: issuerDid }, context);
      const expiry = new Date();
      const data = 'something' as unknown as Authorization;
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
    it('should return true if the object conforms to the interface', () => {
      expect(AuthorizationRequest.isUniqueIdentifiers({ authId: new BigNumber(1) })).toBe(true);
      expect(AuthorizationRequest.isUniqueIdentifiers({})).toBe(false);
      expect(AuthorizationRequest.isUniqueIdentifiers({ authId: 3 })).toBe(false);
    });
  });

  describe('method: accept', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the consumeAuthorizationRequests procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: null,
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: { type: AuthorizationType.TransferTicker, value: 'TICKER' },
        },
        context
      );

      const args = {
        accept: true,
        authRequests: [authorizationRequest],
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await authorizationRequest.accept();

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the consumeJoinOrRotateAuthorization procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: null,
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: {
            type: AuthorizationType.JoinIdentity,
            value: {
              assets: null,
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

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await authorizationRequest.accept();

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the consumeJoinOrRotateAuthorization procedure with a RotatePrimaryKeyToSecondary auth and return the resulting transaction', async () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: null,
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: {
            type: AuthorizationType.RotatePrimaryKeyToSecondary,
            value: {
              assets: null,
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

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await authorizationRequest.accept();

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the consumeAddMultiSigSignerAuthorization procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: null,
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: {
            type: AuthorizationType.AddMultiSigSigner,
            value: 'someAddress',
          },
        },
        context
      );

      const args = {
        authRequest: authorizationRequest,
        accept: true,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await authorizationRequest.accept();

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the consumeAddRelayerPayingKeyAuthorization procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: null,
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: {
            type: AuthorizationType.AddRelayerPayingKey,
            value: {
              beneficiary: new Account({ address: 'beneficiary' }, context),
              subsidizer: new Account({ address: 'subsidizer' }, context),
              allowance: new BigNumber(100),
            },
          },
        },
        context
      );

      const args = {
        authRequest: authorizationRequest,
        accept: true,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await authorizationRequest.accept();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: remove', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the consumeAuthorizationRequest procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: null,
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: { type: AuthorizationType.RotatePrimaryKey },
        },
        context
      );

      const args = {
        accept: false,
        authRequests: [authorizationRequest],
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await authorizationRequest.remove();

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the consumeJoinOrRotateAuthorization procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: null,
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: {
            type: AuthorizationType.JoinIdentity,
            value: {
              assets: null,
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

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await authorizationRequest.remove();

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the consumeAddMultiSigSignerAuthorization procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: null,
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: {
            type: AuthorizationType.AddMultiSigSigner,
            value: 'someAddress',
          },
        },
        context
      );

      const args = {
        authRequest: authorizationRequest,
        accept: false,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await authorizationRequest.remove();

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the consumeRotatePrimaryKeyToSecondary procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: null,
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: {
            type: AuthorizationType.RotatePrimaryKeyToSecondary,
            value: {
              assets: null,
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

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await authorizationRequest.remove();

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the consumeAddRelayerPayingKeyAuthorization procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: null,
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: {
            type: AuthorizationType.AddRelayerPayingKey,
            value: {
              beneficiary: new Account({ address: 'beneficiary' }, context),
              subsidizer: new Account({ address: 'subsidizer' }, context),
              allowance: new BigNumber(100),
            },
          },
        },
        context
      );

      const args = {
        authRequest: authorizationRequest,
        accept: false,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await authorizationRequest.remove();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: isExpired', () => {
    it('should return whether the request has expired', () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: new Date('10/14/1987 UTC'),
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: { type: AuthorizationType.RotatePrimaryKey },
        },
        context
      );
      expect(authorizationRequest.isExpired()).toBe(true);

      authorizationRequest.expiry = null;
      expect(authorizationRequest.isExpired()).toBe(false);
    });
  });

  describe('method: exists', () => {
    it('should return whether the request exists', async () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: new Date('10/14/1987 UTC'),
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: { type: AuthorizationType.RotatePrimaryKey },
        },
        context
      );

      dsMockUtils.createQueryMock('identity', 'authorizations', {
        returnValue: dsMockUtils.createMockOption(),
      });
      await expect(authorizationRequest.exists()).resolves.toBe(false);

      dsMockUtils.createQueryMock('identity', 'authorizations', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockAuthorization({
            authId: new BigNumber(1),
            authorizationData: dsMockUtils.createMockAuthorizationData('RotatePrimaryKey'),
            authorizedBy: 'someDid',
            expiry: dsMockUtils.createMockOption(),
          })
        ),
      });
      return expect(authorizationRequest.exists()).resolves.toBe(true);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      const authorizationRequest = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          expiry: new Date('10/14/1987 UTC'),
          target: new Identity({ did: 'someDid' }, context),
          issuer: new Identity({ did: 'otherDid' }, context),
          data: { type: AuthorizationType.RotatePrimaryKey },
        },
        context
      );
      expect(authorizationRequest.toHuman()).toEqual({
        id: '1',
        expiry: '1987-10-14T00:00:00.000Z',
        target: {
          type: SignerType.Identity,
          value: 'someDid',
        },
        issuer: 'otherDid',
        data: { type: AuthorizationType.RotatePrimaryKey },
      });
    });
  });
});
