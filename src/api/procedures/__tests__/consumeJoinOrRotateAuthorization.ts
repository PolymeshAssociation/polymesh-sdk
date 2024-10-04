import { bool, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  ConsumeJoinOrRotateAuthorizationParams,
  getAuthorization,
  prepareConsumeJoinOrRotateAuthorization,
  prepareStorage,
  Storage,
} from '~/api/procedures/consumeJoinOrRotateAuthorization';
import {
  Account,
  AuthorizationRequest,
  Context,
  Identity,
  KnownPermissionGroup,
  PolymeshError,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, AuthorizationType, ErrorCode, Signer, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('consumeJoinOrRotateAuthorization procedure', () => {
  let mockContext: Mocked<Context>;
  let targetAddress: string;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;
  let booleanToBoolSpy: jest.SpyInstance<bool, [boolean, Context]>;
  let rawTrue: bool;
  let rawFalse: bool;
  let authId: BigNumber;
  let rawAuthId: u64;

  let targetAccount: Account;

  beforeAll(() => {
    targetAddress = 'someAddress';
    dsMockUtils.initMocks({
      contextOptions: {
        signingAddress: targetAddress,
      },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    booleanToBoolSpy = jest.spyOn(utilsConversionModule, 'booleanToBool');
    authId = new BigNumber(1);
    rawAuthId = dsMockUtils.createMockU64(authId);
    rawTrue = dsMockUtils.createMockBool(true);
    rawFalse = dsMockUtils.createMockBool(false);

    jest.spyOn(utilsConversionModule, 'addressToKey').mockImplementation();
  });

  beforeEach(() => {
    dsMockUtils.createQueryMock('identity', 'authorizations', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockAuthorization({
          authorizationData: dsMockUtils.createMockAuthorizationData('RotatePrimaryKey'),
          authId: new BigNumber(1),
          authorizedBy: 'someDid',
          expiry: dsMockUtils.createMockOption(),
        })
      ),
    });
    mockContext = dsMockUtils.getContextInstance();
    when(bigNumberToU64Spy).calledWith(authId, mockContext).mockReturnValue(rawAuthId);
    when(booleanToBoolSpy).calledWith(true, mockContext).mockReturnValue(rawTrue);
    when(booleanToBoolSpy).calledWith(false, mockContext).mockReturnValue(rawFalse);

    targetAccount = entityMockUtils.getAccountInstance({ address: targetAddress });
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

  it('should throw an error if the Authorization Request is expired', () => {
    const proc = procedureMockUtils.getInstance<
      ConsumeJoinOrRotateAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      actingAccount: targetAccount,
      calledByTarget: true,
    });

    const target = targetAccount;

    return expect(
      prepareConsumeJoinOrRotateAuthorization.call(proc, {
        authRequest: new AuthorizationRequest(
          {
            target,
            issuer: entityMockUtils.getIdentityInstance(),
            authId,
            expiry: new Date('10/14/1987'),
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
          mockContext
        ),
        accept: true,
      })
    ).rejects.toThrow('The Authorization Request has expired');
  });

  it('should throw an error if the target Account is already part of an Identity', () => {
    const proc = procedureMockUtils.getInstance<
      ConsumeJoinOrRotateAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      actingAccount: targetAccount,
      calledByTarget: true,
    });

    const target = entityMockUtils.getAccountInstance({
      address: targetAddress,
      getIdentity: entityMockUtils.getIdentityInstance({ isEqual: false }),
    });

    return expect(
      prepareConsumeJoinOrRotateAuthorization.call(proc, {
        authRequest: new AuthorizationRequest(
          {
            target,
            issuer: entityMockUtils.getIdentityInstance(),
            authId,
            expiry: null,
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
          mockContext
        ),
        accept: true,
      })
    ).rejects.toThrow('The target Account already has an associated Identity');
  });

  it('should return a joinIdentityAsKey transaction spec if the target is an Account', async () => {
    const proc = procedureMockUtils.getInstance<
      ConsumeJoinOrRotateAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      actingAccount: targetAccount,
      calledByTarget: true,
    });

    const transaction = dsMockUtils.createTxMock('identity', 'joinIdentityAsKey');

    const issuer = entityMockUtils.getIdentityInstance();
    const target = entityMockUtils.getAccountInstance({
      address: 'someAddress',
      getIdentity: null,
    });

    const result = await prepareConsumeJoinOrRotateAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target,
          issuer,
          authId,
          expiry: null,
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
        mockContext
      ),
      accept: true,
    });

    expect(result).toEqual({
      transaction,
      paidForBy: issuer,
      args: [rawAuthId],
      resolver: undefined,
    });
  });

  it('should return a rotatePrimaryKeyToSecondary transaction spec if the target is an Account', async () => {
    const proc = procedureMockUtils.getInstance<
      ConsumeJoinOrRotateAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      actingAccount: targetAccount,
      calledByTarget: true,
    });

    const transaction = dsMockUtils.createTxMock('identity', 'rotatePrimaryKeyToSecondary');

    const issuer = entityMockUtils.getIdentityInstance();
    const target = entityMockUtils.getAccountInstance({
      address: 'someAddress',
      getIdentity: null,
    });

    const result = await prepareConsumeJoinOrRotateAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target,
          issuer,
          authId,
          expiry: null,
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
        mockContext
      ),
      accept: true,
    });

    expect(result).toEqual({
      transaction,
      paidForBy: issuer,
      args: [rawAuthId, null],
      resolver: undefined,
    });
  });

  it('should return an acceptPrimaryKey transaction spec if called with RotatePrimaryKey', async () => {
    const proc = procedureMockUtils.getInstance<
      ConsumeJoinOrRotateAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      actingAccount: targetAccount,
      calledByTarget: true,
    });

    const transaction = dsMockUtils.createTxMock('identity', 'acceptPrimaryKey');

    const issuer = entityMockUtils.getIdentityInstance();
    const target = entityMockUtils.getAccountInstance({
      address: 'someAddress',
      getIdentity: null,
    });

    const result = await prepareConsumeJoinOrRotateAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target,
          issuer,
          authId,
          expiry: null,
          data: {
            type: AuthorizationType.RotatePrimaryKey,
          },
        },
        mockContext
      ),
      accept: true,
    });

    expect(result).toEqual({
      transaction,
      paidForBy: issuer,
      args: [rawAuthId, null],
      resolver: undefined,
    });
  });

  it('should throw if called with an Authorization that is not JoinIdentity, RotatePrimaryKeyToSecondary or RotatePrimaryKey', async () => {
    const proc = procedureMockUtils.getInstance<
      ConsumeJoinOrRotateAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      actingAccount: targetAccount,
      calledByTarget: true,
    });

    const issuer = entityMockUtils.getIdentityInstance();
    const target = entityMockUtils.getAccountInstance({
      address: 'someAddress',
      getIdentity: null,
    });

    let error;
    try {
      await prepareConsumeJoinOrRotateAuthorization.call(proc, {
        authRequest: new AuthorizationRequest(
          {
            target,
            issuer,
            authId,
            expiry: null,
            data: {
              type: AuthorizationType.BecomeAgent,
              value: {} as KnownPermissionGroup,
            },
          },
          mockContext
        ),
        accept: true,
      });
    } catch (err) {
      error = err;
    }
    const expectedError = new PolymeshError({
      code: ErrorCode.UnexpectedError,
      message: 'Unrecognized auth type: "BecomeAgent" for consumeJoinOrRotateAuthorization method',
    });
    expect(error).toEqual(expectedError);
  });

  it('should return a removeAuthorization transaction spec if accept is set to false', async () => {
    let proc = procedureMockUtils.getInstance<
      ConsumeJoinOrRotateAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      actingAccount: targetAccount,
      calledByTarget: false,
    });

    const transaction = dsMockUtils.createTxMock('identity', 'removeAuthorization');

    const issuer = entityMockUtils.getIdentityInstance();
    let target: Signer = new Identity({ did: 'someOtherDid' }, mockContext);

    const rawSignatory = dsMockUtils.createMockSignatory({
      Identity: dsMockUtils.createMockIdentityId(target.did),
    });

    jest.spyOn(utilsConversionModule, 'signerValueToSignatory').mockReturnValue(rawSignatory);

    let result = await prepareConsumeJoinOrRotateAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target,
          issuer,
          authId,
          expiry: null,
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
        mockContext
      ),
      accept: false,
    });

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthId, rawFalse],
      resolver: undefined,
    });

    target = targetAccount;
    proc = procedureMockUtils.getInstance<ConsumeJoinOrRotateAuthorizationParams, void, Storage>(
      mockContext,
      {
        actingAccount: targetAccount,
        calledByTarget: true,
      }
    );

    result = await prepareConsumeJoinOrRotateAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target,
          issuer,
          authId,
          expiry: null,
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
        mockContext
      ),
      accept: false,
    });

    expect(result).toEqual({
      transaction,
      paidForBy: issuer,
      args: [rawSignatory, rawAuthId, rawTrue],
      resolve: undefined,
    });
  });

  describe('prepareStorage', () => {
    it("should return the signing Account, whether the target is the caller and the target's Identity (if any)", async () => {
      const proc = procedureMockUtils.getInstance<
        ConsumeJoinOrRotateAuthorizationParams,
        void,
        Storage
      >(mockContext);
      const boundFunc = prepareStorage.bind(proc);
      const target = entityMockUtils.getAccountInstance({ getIdentity: null });

      const result = await boundFunc({
        authRequest: { target },
      } as unknown as ConsumeJoinOrRotateAuthorizationParams);

      expect(result).toEqual({
        actingAccount: mockContext.getSigningAccount(),
        calledByTarget: true,
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      let proc = procedureMockUtils.getInstance<
        ConsumeJoinOrRotateAuthorizationParams,
        void,
        Storage
      >(mockContext, {
        actingAccount: targetAccount,
        calledByTarget: true,
      });
      const { address } = mockContext.getSigningAccount();
      const constructorParams = {
        authId,
        expiry: null,
        target: entityMockUtils.getAccountInstance({ address }),
        issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid1' }),
        data: {
          type: AuthorizationType.JoinIdentity,
        } as Authorization,
      };
      const args = {
        authRequest: new AuthorizationRequest(constructorParams, mockContext),
        accept: true,
      };

      let boundFunc = getAuthorization.bind(proc);
      let result = await boundFunc(args);
      expect(result).toEqual({
        roles: true,
      });

      args.accept = false;
      args.authRequest.issuer = await mockContext.getSigningIdentity();

      dsMockUtils.configureMocks({
        contextOptions: {
          signingIdentityIsEqual: true,
        },
      });

      result = await boundFunc(args);
      expect(result).toEqual({
        roles: true,
        permissions: {
          transactions: [TxTags.identity.RemoveAuthorization],
        },
      });

      targetAccount = entityMockUtils.getAccountInstance({ address, getIdentity: null });
      mockContext.getSigningAccount.mockReturnValue(targetAccount);

      proc = procedureMockUtils.getInstance<ConsumeJoinOrRotateAuthorizationParams, void, Storage>(
        mockContext,
        {
          actingAccount: targetAccount,
          calledByTarget: false,
        }
      );
      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc(args);
      expect(result).toEqual({
        roles:
          '"JoinIdentity" Authorization Requests can only be removed by the issuer Identity or the target Account',
        permissions: {
          transactions: [TxTags.identity.RemoveAuthorization],
        },
      });

      targetAccount = entityMockUtils.getAccountInstance({
        address,
        getIdentity: entityMockUtils.getIdentityInstance({ isEqual: false }),
      });

      proc = procedureMockUtils.getInstance<ConsumeJoinOrRotateAuthorizationParams, void, Storage>(
        mockContext,
        {
          actingAccount: targetAccount,
          calledByTarget: false,
        }
      );
      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc({ ...args, accept: true });
      expect(result).toEqual({
        roles: '"JoinIdentity" Authorization Requests must be accepted by the target Account',
      });

      result = await boundFunc(args);
      expect(result).toEqual({
        roles:
          '"JoinIdentity" Authorization Requests can only be removed by the issuer Identity or the target Account',
        permissions: {
          transactions: [TxTags.identity.RemoveAuthorization],
        },
      });

      targetAccount = entityMockUtils.getAccountInstance({ address, getIdentity: null });

      proc = procedureMockUtils.getInstance<ConsumeJoinOrRotateAuthorizationParams, void, Storage>(
        mockContext,
        {
          actingAccount: targetAccount,
          calledByTarget: true,
        }
      );
      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc(args);
      expect(result).toEqual({
        roles: true,
      });
    });
  });
});
