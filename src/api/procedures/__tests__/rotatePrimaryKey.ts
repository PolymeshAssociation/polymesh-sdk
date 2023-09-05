import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { prepareRotatePrimaryKey } from '~/api/procedures/rotatePrimaryKey';
import { Account, AuthorizationRequest, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AuthorizationType, ResultSet, RotatePrimaryKeyParams } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('rotatePrimaryKey procedure', () => {
  let mockContext: Mocked<Context>;
  let authorizationToAuthorizationDataSpy: jest.SpyInstance;
  let expiryToMomentSpy: jest.SpyInstance;
  let signerToSignatorySpy: jest.SpyInstance;
  let signerToStringSpy: jest.SpyInstance;

  let args: RotatePrimaryKeyParams;
  const authId = new BigNumber(1);
  const address = 'targetAccount';

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    authorizationToAuthorizationDataSpy = jest.spyOn(
      utilsConversionModule,
      'authorizationToAuthorizationData'
    );
    expiryToMomentSpy = jest.spyOn(utilsConversionModule, 'expiryToMoment');
    signerToStringSpy = jest.spyOn(utilsConversionModule, 'signerToString');
    signerToSignatorySpy = jest.spyOn(utilsConversionModule, 'signerToSignatory');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    args = { targetAccount: address };
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
    const target = new Account({ address }, mockContext);
    const someOtherTarget = new Account({ address: 'someOtherAccount' }, mockContext);

    const sentAuthorizations: ResultSet<AuthorizationRequest> = {
      data: [
        new AuthorizationRequest(
          {
            target: someOtherTarget,
            issuer: entityMockUtils.getIdentityInstance(),
            authId: new BigNumber(1),
            expiry: null,
            data: {
              type: AuthorizationType.RotatePrimaryKey,
            },
          },
          mockContext
        ),
        new AuthorizationRequest(
          {
            target,
            issuer: entityMockUtils.getIdentityInstance(),
            authId: new BigNumber(2),
            expiry: new Date('01/01/2023'),
            data: {
              type: AuthorizationType.RotatePrimaryKey,
            },
          },
          mockContext
        ),
        new AuthorizationRequest(
          {
            target,
            issuer: entityMockUtils.getIdentityInstance(),
            authId: new BigNumber(3),
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
      ],
      next: new BigNumber(1),
      count: new BigNumber(1),
    };

    dsMockUtils.configureMocks({
      contextOptions: {
        sentAuthorizations,
      },
    });

    const rawSignatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId('someAccountId'),
    });

    const authorization = {
      type: AuthorizationType.RotatePrimaryKey,
    };
    const rawAuthorizationData = dsMockUtils.createMockAuthorizationData('RotatePrimaryKey');

    const rawExpiry = dsMockUtils.createMockMoment(new BigNumber(expiry.getTime()));

    signerToSignatorySpy.mockReturnValue(rawSignatory);
    when(signerToStringSpy).calledWith(target).mockReturnValue(address);
    when(signerToStringSpy).calledWith(someOtherTarget).mockReturnValue('someOtherAccount');

    when(authorizationToAuthorizationDataSpy)
      .calledWith(authorization, mockContext)
      .mockReturnValue(rawAuthorizationData);

    const proc = procedureMockUtils.getInstance<RotatePrimaryKeyParams, AuthorizationRequest>(
      mockContext
    );

    const transaction = dsMockUtils.createTxMock('identity', 'addAuthorization');

    let result = await prepareRotatePrimaryKey.call(proc, args);

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, null],
      resolver: expect.any(Function),
    });

    when(expiryToMomentSpy).calledWith(expiry, mockContext).mockReturnValue(rawExpiry);

    result = await prepareRotatePrimaryKey.call(proc, { ...args, expiry });

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

    const sentAuthorizations: ResultSet<AuthorizationRequest> = {
      data: [
        new AuthorizationRequest(
          {
            target,
            issuer: entityMockUtils.getIdentityInstance(),
            authId,
            expiry: null,
            data: {
              type: AuthorizationType.RotatePrimaryKey,
            },
          },
          mockContext
        ),
      ],
      next: new BigNumber(1),
      count: new BigNumber(1),
    };

    dsMockUtils.configureMocks({
      contextOptions: {
        sentAuthorizations,
      },
    });

    when(signerToStringSpy).calledWith(args.targetAccount).mockReturnValue(address);
    when(signerToStringSpy).calledWith(target).mockReturnValue(address);

    const proc = procedureMockUtils.getInstance<RotatePrimaryKeyParams, AuthorizationRequest>(
      mockContext
    );

    return expect(prepareRotatePrimaryKey.call(proc, { ...args })).rejects.toThrow(
      'The target Account already has a pending invitation to become the primary key of the given Identity'
    );
  });
});
