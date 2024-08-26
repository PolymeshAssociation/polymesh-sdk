import { bool, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  ConsumeAddMultiSigSignerAuthorizationParams,
  getAuthorization,
  prepareConsumeAddMultiSigSignerAuthorization,
} from '~/api/procedures/consumeAddMultiSigSignerAuthorization';
import { AuthorizationRequest, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  createMockIdentityId,
  createMockKeyRecord,
  createMockOption,
} from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import { Authorization, AuthorizationType, ErrorCode, Signer, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('consumeAddMultiSigSignerAuthorization procedure', () => {
  let mockContext: Mocked<Context>;
  let targetAddress: string;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;
  let booleanToBoolSpy: jest.SpyInstance<bool, [boolean, Context]>;
  let rawTrue: bool;
  let rawFalse: bool;
  let authId: BigNumber;
  let rawAuthId: u64;

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
    mockContext = dsMockUtils.getContextInstance();
    when(bigNumberToU64Spy).calledWith(authId, mockContext).mockReturnValue(rawAuthId);
    when(booleanToBoolSpy).calledWith(true, mockContext).mockReturnValue(rawTrue);
    when(booleanToBoolSpy).calledWith(false, mockContext).mockReturnValue(rawFalse);
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
    const proc = procedureMockUtils.getInstance<ConsumeAddMultiSigSignerAuthorizationParams, void>(
      mockContext
    );

    const target = entityMockUtils.getAccountInstance({ address: 'someAddress' });

    return expect(
      prepareConsumeAddMultiSigSignerAuthorization.call(proc, {
        authRequest: new AuthorizationRequest(
          {
            target,
            issuer: entityMockUtils.getIdentityInstance(),
            authId,
            expiry: new Date('10/14/1987'),
            data: {
              type: AuthorizationType.AddMultiSigSigner,
              value: 'someAddress',
            },
          },
          mockContext
        ),
        accept: true,
      })
    ).rejects.toThrow('The Authorization Request has expired');
  });

  it('should throw an error if the passed Account is already part of an Identity', async () => {
    const proc = procedureMockUtils.getInstance<ConsumeAddMultiSigSignerAuthorizationParams, void>(
      mockContext
    );

    dsMockUtils.createTxMock('multiSig', 'acceptMultisigSigner');
    dsMockUtils
      .createQueryMock('identity', 'keyRecords')
      .mockReturnValue(
        createMockOption(createMockKeyRecord({ PrimaryKey: createMockIdentityId('someId') }))
      );

    const identity = entityMockUtils.getIdentityInstance();
    const target = entityMockUtils.getAccountInstance({
      address: 'someAddress',
      getIdentity: identity,
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The target Account is already part of an Identity',
    });

    return expect(
      prepareConsumeAddMultiSigSignerAuthorization.call(proc, {
        authRequest: new AuthorizationRequest(
          {
            target,
            issuer: entityMockUtils.getIdentityInstance(),
            authId,
            expiry: null,
            data: {
              type: AuthorizationType.AddMultiSigSigner,
              value: 'multisigAddr',
            },
          },
          mockContext
        ),
        accept: true,
      })
    ).rejects.toThrowError(expectedError);
  });

  it('should return a acceptMultisigSignerAsKey transaction spec if the target is an Account', async () => {
    const proc = procedureMockUtils.getInstance<ConsumeAddMultiSigSignerAuthorizationParams, void>(
      mockContext
    );
    dsMockUtils.createQueryMock('identity', 'keyRecords', {
      returnValue: dsMockUtils.createMockAccountId(),
    });

    const transaction = dsMockUtils.createTxMock('multiSig', 'acceptMultisigSigner');

    const issuer = entityMockUtils.getIdentityInstance();
    const target = entityMockUtils.getAccountInstance({
      address: 'someAddress',
      getIdentity: null,
    });

    const result = await prepareConsumeAddMultiSigSignerAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target,
          issuer,
          authId,
          expiry: null,
          data: {
            type: AuthorizationType.AddMultiSigSigner,
            value: 'someAccount',
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

  it('should return a acceptMultisigSignerAsIdentity transaction spec if the target is an Identity', async () => {
    const proc = procedureMockUtils.getInstance<ConsumeAddMultiSigSignerAuthorizationParams, void>(
      mockContext
    );

    const transaction = dsMockUtils.createTxMock('multiSig', 'acceptMultisigSigner');

    const issuer = entityMockUtils.getIdentityInstance();
    const target = entityMockUtils.getIdentityInstance({ did: 'someOtherDid' });

    const result = await prepareConsumeAddMultiSigSignerAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target,
          issuer,
          authId,
          expiry: null,
          data: {
            type: AuthorizationType.AddMultiSigSigner,
            value: 'someAccount',
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

  it('should return a removeAuthorization transaction spec if accept is set to false', async () => {
    const proc = procedureMockUtils.getInstance<ConsumeAddMultiSigSignerAuthorizationParams, void>(
      mockContext
    );

    const transaction = dsMockUtils.createTxMock('identity', 'removeAuthorization');

    const issuer = entityMockUtils.getIdentityInstance();
    let target: Signer = entityMockUtils.getIdentityInstance({ did: 'someOtherDid' });

    const rawSignatory = dsMockUtils.createMockSignatory({
      Identity: dsMockUtils.createMockIdentityId(target.did),
    });

    jest.spyOn(utilsConversionModule, 'signerValueToSignatory').mockReturnValue(rawSignatory);

    let result = await prepareConsumeAddMultiSigSignerAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target,
          issuer,
          authId,
          expiry: null,
          data: {
            type: AuthorizationType.AddMultiSigSigner,
            value: 'multiSigAddr',
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

    target = entityMockUtils.getAccountInstance({
      address: targetAddress,
      isEqual: false,
      getIdentity: null,
    });

    result = await prepareConsumeAddMultiSigSignerAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target,
          issuer,
          authId,
          expiry: null,
          data: {
            type: AuthorizationType.AddMultiSigSigner,
            value: 'multiSigAddr',
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
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      const proc = procedureMockUtils.getInstance<
        ConsumeAddMultiSigSignerAuthorizationParams,
        void
      >(mockContext);
      const { address } = await mockContext.getActingAccount();
      const constructorParams = {
        authId,
        expiry: null,
        target: entityMockUtils.getAccountInstance({ address }),
        issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid1' }),
        data: {
          type: AuthorizationType.AddMultiSigSigner,
        } as Authorization,
      };
      const args = {
        authRequest: new AuthorizationRequest(constructorParams, mockContext),
        accept: true,
      };

      const boundFunc = getAuthorization.bind(proc);
      let result = await boundFunc(args);
      expect(result).toEqual({
        roles: true,
        permissions: undefined,
      });

      args.authRequest.target = entityMockUtils.getIdentityInstance({
        did: 'notTheSigningIdentity',
      });

      dsMockUtils.configureMocks({
        contextOptions: {
          signingIdentityIsEqual: false,
        },
      });

      result = await boundFunc(args);
      expect(result).toEqual({
        roles:
          '"AddMultiSigSigner" Authorization Requests can only be accepted by the target Signer',
        permissions: {
          transactions: [TxTags.multiSig.AcceptMultisigSignerAsIdentity],
        },
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

      dsMockUtils.configureMocks({
        contextOptions: {
          signingIdentityIsEqual: false,
        },
      });

      result = await boundFunc(args);
      expect(result).toEqual({
        roles:
          '"AddMultiSigSigner" Authorization Request can only be removed by the issuing Identity or the target Signer',
        permissions: {
          transactions: [TxTags.identity.RemoveAuthorization],
        },
      });

      mockContext.getSigningAccount.mockReturnValue(
        entityMockUtils.getAccountInstance({ address, getIdentity: null })
      );

      result = await boundFunc(args);
      expect(result).toEqual({
        roles:
          '"AddMultiSigSigner" Authorization Request can only be removed by the issuing Identity or the target Signer',
        permissions: {
          transactions: [TxTags.identity.RemoveAuthorization],
        },
      });

      args.authRequest.target = entityMockUtils.getAccountInstance({ address, getIdentity: null });

      result = await boundFunc(args);
      expect(result).toEqual({
        roles: true,
      });
    });
  });
});
