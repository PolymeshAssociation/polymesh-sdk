import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { prepareAttestPrimaryKeyRotation } from '~/api/procedures/attestPrimaryKeyRotation';
import { Account, AuthorizationRequest, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AttestPrimaryKeyRotationParams, AuthorizationType, Identity } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('attestPrimaryKeyRotation procedure', () => {
  let mockContext: Mocked<Context>;
  let authorizationToAuthorizationDataSpy: jest.SpyInstance;
  let expiryToMomentSpy: jest.SpyInstance;
  let signerToSignatorySpy: jest.SpyInstance;

  let args: AttestPrimaryKeyRotationParams;
  const authId = new BigNumber(1);
  const address = 'someAddress';
  let getReceivedMock: jest.Mock;
  let targetAccount: Account;
  let identity: Identity;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    authorizationToAuthorizationDataSpy = jest.spyOn(
      utilsConversionModule,
      'authorizationToAuthorizationData'
    );
    expiryToMomentSpy = jest.spyOn(utilsConversionModule, 'expiryToMoment');
    signerToSignatorySpy = jest.spyOn(utilsConversionModule, 'signerToSignatory');
    getReceivedMock = jest.fn();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    targetAccount = entityMockUtils.getAccountInstance({
      address,
      authorizationsGetReceived: getReceivedMock,
    });
    identity = entityMockUtils.getIdentityInstance({ did: 'someDid' });
    args = {
      identity,
      targetAccount,
    };
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

  it('should return an add authorization transaction spec', async () => {
    const expiry = new Date('1/1/2040');

    const receivedAuthorizations: AuthorizationRequest[] = [
      new AuthorizationRequest(
        {
          target: targetAccount,
          issuer: entityMockUtils.getIdentityInstance(),
          authId: new BigNumber(2),
          expiry: null,
          data: {
            type: AuthorizationType.AttestPrimaryKeyRotation,
            value: entityMockUtils.getIdentityInstance({ did: 'someOtherDid' }),
          },
        },
        mockContext
      ),
    ];

    when(getReceivedMock)
      .calledWith({
        type: AuthorizationType.AttestPrimaryKeyRotation,
        includeExpired: false,
      })
      .mockResolvedValue(receivedAuthorizations);

    const rawSignatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId('someAccountId'),
    });

    const authorization = {
      type: AuthorizationType.AttestPrimaryKeyRotation,
      value: identity,
    };
    const rawAuthorizationData = dsMockUtils.createMockAuthorizationData({
      AttestPrimaryKeyRotation: dsMockUtils.createMockIdentityId(identity.did),
    });

    const rawExpiry = dsMockUtils.createMockMoment(new BigNumber(expiry.getTime()));

    signerToSignatorySpy.mockReturnValue(rawSignatory);

    when(authorizationToAuthorizationDataSpy)
      .calledWith(authorization, mockContext)
      .mockReturnValue(rawAuthorizationData);

    const proc = procedureMockUtils.getInstance<
      AttestPrimaryKeyRotationParams,
      AuthorizationRequest
    >(mockContext);

    const transaction = dsMockUtils.createTxMock('identity', 'addAuthorization');

    when(expiryToMomentSpy).calledWith(expiry, mockContext).mockReturnValue(rawExpiry);

    let result = await prepareAttestPrimaryKeyRotation.call(proc, args);

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, null],
      resolver: expect.any(Function),
    });

    result = await prepareAttestPrimaryKeyRotation.call(proc, { ...args, expiry });

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, rawExpiry],
      resolver: expect.any(Function),
    });
  });

  it('should throw an error if the passed Account has a pending authorization to accept', () => {
    const target = entityMockUtils.getAccountInstance({
      address,
    });
    dsMockUtils.createTxMock('identity', 'addAuthorization');

    const receivedAuthorizations: AuthorizationRequest[] = [
      new AuthorizationRequest(
        {
          target,
          issuer: entityMockUtils.getIdentityInstance(),
          authId,
          expiry: null,
          data: {
            type: AuthorizationType.AttestPrimaryKeyRotation,
            value: identity,
          },
        },
        mockContext
      ),
    ];

    when(getReceivedMock)
      .calledWith({
        type: AuthorizationType.AttestPrimaryKeyRotation,
        includeExpired: false,
      })
      .mockResolvedValue(receivedAuthorizations);

    const proc = procedureMockUtils.getInstance<
      AttestPrimaryKeyRotationParams,
      AuthorizationRequest
    >(mockContext);

    return expect(prepareAttestPrimaryKeyRotation.call(proc, { ...args })).rejects.toThrow(
      'The target Account already has a pending attestation to become the primary key of the target Identity'
    );
  });
});
