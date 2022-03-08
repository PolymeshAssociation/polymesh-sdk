import { bool, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

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
  let bigNumberToU64Stub: sinon.SinonStub<[BigNumber, Context], u64>;
  let booleanToBoolStub: sinon.SinonStub<[boolean, Context], bool>;
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
    bigNumberToU64Stub = sinon.stub(utilsConversionModule, 'bigNumberToU64');
    booleanToBoolStub = sinon.stub(utilsConversionModule, 'booleanToBool');
    authId = new BigNumber(1);
    rawAuthId = dsMockUtils.createMockU64(authId);
    rawTrue = dsMockUtils.createMockBool(true);
    rawFalse = dsMockUtils.createMockBool(false);

    sinon.stub(utilsConversionModule, 'addressToKey');
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    dsMockUtils.createQueryStub('identity', 'authorizations', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockAuthorization({
          /* eslint-disable @typescript-eslint/naming-convention */
          authorization_data: dsMockUtils.createMockAuthorizationData('RotatePrimaryKey'),
          auth_id: new BigNumber(1),
          authorized_by: 'someDid',
          expiry: dsMockUtils.createMockOption(),
          /* eslint-enable @typescript-eslint/naming-convention */
        })
      ),
    });
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    bigNumberToU64Stub.withArgs(authId, mockContext).returns(rawAuthId);
    booleanToBoolStub.withArgs(true, mockContext).returns(rawTrue);
    booleanToBoolStub.withArgs(false, mockContext).returns(rawFalse);

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
      signingAccount: targetAccount,
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
      signingAccount: targetAccount,
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

  it('should add a joinIdentityAsKey transaction to the queue if the target is an Account', async () => {
    const proc = procedureMockUtils.getInstance<
      ConsumeJoinOrRotateAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      signingAccount: targetAccount,
      calledByTarget: true,
    });

    const transaction = dsMockUtils.createTxStub('identity', 'joinIdentityAsKey');

    const issuer = entityMockUtils.getIdentityInstance();
    const target = entityMockUtils.getAccountInstance({
      address: 'someAddress',
      getIdentity: null,
    });

    await prepareConsumeJoinOrRotateAuthorization.call(proc, {
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

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      paidForBy: issuer,
      args: [rawAuthId],
    });
  });

  it('should add a rotatePrimaryKeyToSecondary transaction to the queue if the target is an Account', async () => {
    const proc = procedureMockUtils.getInstance<
      ConsumeJoinOrRotateAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      signingAccount: targetAccount,
      calledByTarget: true,
    });

    const transaction = dsMockUtils.createTxStub('identity', 'rotatePrimaryKeyToSecondary');

    const issuer = entityMockUtils.getIdentityInstance();
    const target = entityMockUtils.getAccountInstance({
      address: 'someAddress',
      getIdentity: null,
    });

    await prepareConsumeJoinOrRotateAuthorization.call(proc, {
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

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      paidForBy: issuer,
      args: [rawAuthId, null],
    });
  });

  it('should add an acceptPrimaryKey transaction to the queue if called with RotatePrimaryKey', async () => {
    const proc = procedureMockUtils.getInstance<
      ConsumeJoinOrRotateAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      signingAccount: targetAccount,
      calledByTarget: true,
    });

    const transaction = dsMockUtils.createTxStub('identity', 'acceptPrimaryKey');

    const issuer = entityMockUtils.getIdentityInstance();
    const target = entityMockUtils.getAccountInstance({
      address: 'someAddress',
      getIdentity: null,
    });

    await prepareConsumeJoinOrRotateAuthorization.call(proc, {
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

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      paidForBy: issuer,
      args: [rawAuthId, null],
    });
  });

  it('should throw if called with an Authorization that is not JoinIdentity, RotatePrimaryKeyToSecondary or RotatePrimaryKey', async () => {
    const proc = procedureMockUtils.getInstance<
      ConsumeJoinOrRotateAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      signingAccount: targetAccount,
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

  it('should add a removeAuthorization transaction to the queue if accept is set to false', async () => {
    let proc = procedureMockUtils.getInstance<
      ConsumeJoinOrRotateAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      signingAccount: targetAccount,
      calledByTarget: false,
    });

    const transaction = dsMockUtils.createTxStub('identity', 'removeAuthorization');

    const issuer = entityMockUtils.getIdentityInstance();
    let target: Signer = new Identity({ did: 'someOtherDid' }, mockContext);

    const rawSignatory = dsMockUtils.createMockSignatory({
      Identity: dsMockUtils.createMockIdentityId(target.did),
    });

    sinon.stub(utilsConversionModule, 'signerValueToSignatory').returns(rawSignatory);

    await prepareConsumeJoinOrRotateAuthorization.call(proc, {
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

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      args: [rawSignatory, rawAuthId, rawFalse],
    });

    target = targetAccount;
    proc = procedureMockUtils.getInstance<ConsumeJoinOrRotateAuthorizationParams, void, Storage>(
      mockContext,
      {
        signingAccount: targetAccount,
        calledByTarget: true,
      }
    );

    await prepareConsumeJoinOrRotateAuthorization.call(proc, {
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

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      paidForBy: issuer,
      args: [rawSignatory, rawAuthId, rawTrue],
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
        signingAccount: mockContext.getSigningAccount(),
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
        signingAccount: targetAccount,
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
      mockContext.getSigningAccount.returns(targetAccount);

      proc = procedureMockUtils.getInstance<ConsumeJoinOrRotateAuthorizationParams, void, Storage>(
        mockContext,
        {
          signingAccount: targetAccount,
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
          signingAccount: targetAccount,
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
          signingAccount: targetAccount,
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
