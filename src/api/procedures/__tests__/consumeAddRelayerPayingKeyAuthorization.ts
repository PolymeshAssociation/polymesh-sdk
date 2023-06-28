import { bool, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  ConsumeAddRelayerPayingKeyAuthorizationParams,
  getAuthorization,
  prepareConsumeAddRelayerPayingKeyAuthorization,
  prepareStorage,
  Storage,
} from '~/api/procedures/consumeAddRelayerPayingKeyAuthorization';
import * as utilsProcedureModule from '~/api/procedures/utils';
import { Account, AuthorizationRequest, Context, Identity, KnownPermissionGroup } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, AuthorizationType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('consumeAddRelayerPayingKeyAuthorization procedure', () => {
  let mockContext: Mocked<Context>;
  let targetAddress: string;
  let bigNumberToU64Stub: sinon.SinonStub<[BigNumber, Context], u64>;
  let booleanToBoolStub: sinon.SinonStub<[boolean, Context], bool>;

  let rawTrue: bool;
  let rawFalse: bool;
  let authId: BigNumber;
  let rawAuthId: u64;

  let targetAccount: Account;
  let issuerIdentity: Identity;
  let addTransactionStub: sinon.SinonStub;

  beforeAll(() => {
    targetAddress = 'someAddress';
    dsMockUtils.initMocks({
      contextOptions: {
        signingAddress: targetAddress,
      },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    jest.spyOn(utilsProcedureModule, 'assertAuthorizationRequestValid').mockImplementation();

    bigNumberToU64Stub = sinon.stub(utilsConversionModule, 'bigNumberToU64');
    booleanToBoolStub = sinon.stub(utilsConversionModule, 'booleanToBool');

    authId = new BigNumber(1);
    rawAuthId = dsMockUtils.createMockU64(authId);

    rawFalse = dsMockUtils.createMockBool(false);
    rawTrue = dsMockUtils.createMockBool(true);

    jest.spyOn(utilsConversionModule, 'addressToKey').mockImplementation();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    bigNumberToU64Stub.withArgs(authId, mockContext).returns(rawAuthId);
    booleanToBoolStub.withArgs(true, mockContext).returns(rawTrue);
    booleanToBoolStub.withArgs(false, mockContext).returns(rawFalse);

    targetAccount = entityMockUtils.getAccountInstance({ address: targetAddress });

    issuerIdentity = entityMockUtils.getIdentityInstance();
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

  it('should throw if called with an Authorization other than AddRelayerPayingKey', () => {
    const proc = procedureMockUtils.getInstance<
      ConsumeAddRelayerPayingKeyAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      signingAccount: targetAccount,
      calledByTarget: true,
    });

    return expect(
      prepareConsumeAddRelayerPayingKeyAuthorization.call(proc, {
        authRequest: new AuthorizationRequest(
          {
            target: targetAccount,
            issuer: issuerIdentity,
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
      })
    ).rejects.toThrow(
      'Unrecognized auth type: "BecomeAgent" for consumeAddRelayerPayingKeyAuthorization method'
    );
  });

  it('should return an acceptPayingKey transaction spec if accept is set to true', async () => {
    const proc = procedureMockUtils.getInstance<
      ConsumeAddRelayerPayingKeyAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      signingAccount: targetAccount,
      calledByTarget: true,
    });

    const transaction = dsMockUtils.createTxStub('relayer', 'acceptPayingKey');

    await prepareConsumeAddRelayerPayingKeyAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target: targetAccount,
          issuer: issuerIdentity,
          authId,
          expiry: null,
          data: {
            type: AuthorizationType.AddRelayerPayingKey,
            value: {
              subsidizer: entityMockUtils.getAccountInstance(),
              beneficiary: targetAccount,
              allowance: new BigNumber(100),
            },
          },
        },
        mockContext
      ),
      accept: true,
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      paidForBy: issuerIdentity,
      args: [rawAuthId],
    });
  });

  it('should return a removeAuthorization transaction spec if accept is set to false', async () => {
    let proc = procedureMockUtils.getInstance<
      ConsumeAddRelayerPayingKeyAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      signingAccount: targetAccount,
      calledByTarget: false,
    });

    const transaction = dsMockUtils.createTxStub('identity', 'removeAuthorization');

    const rawSignatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId(targetAccount.address),
    });

    sinon.stub(utilsConversionModule, 'signerValueToSignatory').returns(rawSignatory);

    const params = {
      authRequest: new AuthorizationRequest(
        {
          target: targetAccount,
          issuer: issuerIdentity,
          authId,
          expiry: null,
          data: {
            type: AuthorizationType.AddRelayerPayingKey,
            value: {
              subsidizer: entityMockUtils.getAccountInstance(),
              beneficiary: targetAccount,
              allowance: new BigNumber(100),
            },
          },
        },
        mockContext
      ),
      accept: false,
    };

    await prepareConsumeAddRelayerPayingKeyAuthorization.call(proc, params);

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      args: [rawSignatory, rawAuthId, rawFalse],
    });

    proc = procedureMockUtils.getInstance<
      ConsumeAddRelayerPayingKeyAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      signingAccount: targetAccount,
      calledByTarget: true,
    });

    await prepareConsumeAddRelayerPayingKeyAuthorization.call(proc, params);

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      paidForBy: issuerIdentity,
      args: [rawSignatory, rawAuthId, rawTrue],
    });
  });

  describe('prepareStorage', () => {
    it("should return the signing Account, whether the target is the caller and the target's Identity (if any)", async () => {
      const proc = procedureMockUtils.getInstance<
        ConsumeAddRelayerPayingKeyAuthorizationParams,
        void,
        Storage
      >(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc({
        authRequest: { target: targetAccount },
      } as unknown as ConsumeAddRelayerPayingKeyAuthorizationParams);

      expect(result).toEqual({
        signingAccount: mockContext.getSigningAccount(),
        calledByTarget: true,
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      let proc = procedureMockUtils.getInstance<
        ConsumeAddRelayerPayingKeyAuthorizationParams,
        void,
        Storage
      >(mockContext, {
        signingAccount: targetAccount,
        calledByTarget: true,
      });
      const constructorParams = {
        authId,
        expiry: null,
        target: targetAccount,
        issuer: issuerIdentity,
        data: {
          type: AuthorizationType.AddRelayerPayingKey,
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

      result = await boundFunc(args);
      expect(result).toEqual({
        roles: true,
        permissions: {
          transactions: [TxTags.identity.RemoveAuthorization],
        },
      });

      proc = procedureMockUtils.getInstance<
        ConsumeAddRelayerPayingKeyAuthorizationParams,
        void,
        Storage
      >(mockContext, {
        signingAccount: targetAccount,
        calledByTarget: false,
      });
      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc(args);
      expect(result).toEqual({
        roles: true,
        permissions: {
          transactions: [TxTags.identity.RemoveAuthorization],
        },
      });

      proc = procedureMockUtils.getInstance<
        ConsumeAddRelayerPayingKeyAuthorizationParams,
        void,
        Storage
      >(mockContext, {
        signingAccount: entityMockUtils.getAccountInstance({
          address: 'someOtherAddress',
          getIdentity: entityMockUtils.getIdentityInstance({ did: 'someOtherDid', isEqual: false }),
        }),
        calledByTarget: false,
      });
      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc(args);
      expect(result).toEqual({
        roles:
          '"AddRelayerPayingKey" Authorization Requests can only be removed by the issuer Identity or the target Account',
        permissions: {
          transactions: [TxTags.identity.RemoveAuthorization],
        },
      });

      result = await boundFunc({ ...args, accept: true });
      expect(result).toEqual({
        roles:
          '"AddRelayerPayingKey" Authorization Requests must be accepted by the target Account',
      });
    });
  });
});
