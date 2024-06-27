import { bool, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

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
  let booleanToBoolSpy: jest.SpyInstance<bool, [boolean, Context]>;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;

  let rawTrue: bool;
  let rawFalse: bool;
  let authId: BigNumber;
  let rawAuthId: u64;

  let targetAccount: Account;
  let issuerIdentity: Identity;

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

    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    booleanToBoolSpy = jest.spyOn(utilsConversionModule, 'booleanToBool');

    authId = new BigNumber(1);
    rawAuthId = dsMockUtils.createMockU64(authId);

    rawFalse = dsMockUtils.createMockBool(false);
    rawTrue = dsMockUtils.createMockBool(true);

    jest.spyOn(utilsConversionModule, 'addressToKey').mockImplementation();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();

    when(bigNumberToU64Spy).calledWith(authId, mockContext).mockReturnValue(rawAuthId);

    when(booleanToBoolSpy).calledWith(false, mockContext).mockReturnValue(rawFalse);
    when(booleanToBoolSpy).calledWith(true, mockContext).mockReturnValue(rawTrue);

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
      actingAccount: targetAccount,
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
      actingAccount: targetAccount,
      calledByTarget: true,
    });

    const transaction = dsMockUtils.createTxMock('relayer', 'acceptPayingKey');

    const result = await prepareConsumeAddRelayerPayingKeyAuthorization.call(proc, {
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

    expect(result).toEqual({
      transaction,
      paidForBy: issuerIdentity,
      args: [rawAuthId],
      resolver: undefined,
    });
  });

  it('should return a removeAuthorization transaction spec if accept is set to false', async () => {
    let proc = procedureMockUtils.getInstance<
      ConsumeAddRelayerPayingKeyAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      actingAccount: targetAccount,
      calledByTarget: false,
    });

    const transaction = dsMockUtils.createTxMock('identity', 'removeAuthorization');

    const rawSignatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId(targetAccount.address),
    });

    jest.spyOn(utilsConversionModule, 'signerValueToSignatory').mockReturnValue(rawSignatory);

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

    let result = await prepareConsumeAddRelayerPayingKeyAuthorization.call(proc, params);

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthId, rawFalse],
      resolver: undefined,
    });

    proc = procedureMockUtils.getInstance<
      ConsumeAddRelayerPayingKeyAuthorizationParams,
      void,
      Storage
    >(mockContext, {
      actingAccount: targetAccount,
      calledByTarget: true,
    });

    result = await prepareConsumeAddRelayerPayingKeyAuthorization.call(proc, params);

    expect(result).toEqual({
      transaction,
      paidForBy: issuerIdentity,
      args: [rawSignatory, rawAuthId, rawTrue],
      resolve: undefined,
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
        actingAccount: mockContext.getSigningAccount(),
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
        actingAccount: targetAccount,
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
        actingAccount: targetAccount,
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
        actingAccount: entityMockUtils.getAccountInstance({
          address: 'someOtherAddress',
          getIdentity: undefined,
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

      proc = procedureMockUtils.getInstance<
        ConsumeAddRelayerPayingKeyAuthorizationParams,
        void,
        Storage
      >(mockContext, {
        actingAccount: entityMockUtils.getAccountInstance({
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
