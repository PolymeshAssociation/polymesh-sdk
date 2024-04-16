import { PolymeshPrimitivesSecondaryKeyPermissions } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { prepareRotatePrimaryKeyToSecondary } from '~/api/procedures/rotatePrimaryKeyToSecondary';
import { Account, AuthorizationRequest, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  AuthorizationType,
  ErrorCode,
  ResultSet,
  RotatePrimaryKeyToSecondaryParams,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternal from '~/utils/internal';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('rotatePrimaryKeyToSecondary procedure', () => {
  let mockContext: Mocked<Context>;
  let authorizationToAuthorizationDataSpy: jest.SpyInstance;
  let expiryToMomentSpy: jest.SpyInstance;
  let signerToSignatorySpy: jest.SpyInstance;
  let signerToStringSpy: jest.SpyInstance;
  let asAccountSpy: jest.SpyInstance;
  let mockAccount: Account;

  let args: RotatePrimaryKeyToSecondaryParams;
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
    asAccountSpy = jest.spyOn(utilsInternal, 'asAccount');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    args = {
      targetAccount: address,
      permissions: {
        assets: null,
        transactions: null,
        transactionGroups: [],
        portfolios: null,
      },
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
    const target = new Account({ address }, mockContext);
    const someOtherTarget = new Account({ address: 'someOtherAccount' }, mockContext);
    mockAccount = entityMockUtils.getAccountInstance({
      address: 'someOtherAddress',
      isEqual: false,
      getIdentity: null,
    });

    when(asAccountSpy).calledWith(address, mockContext).mockReturnValue(mockAccount);

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
        primaryAccount: 'someOtherAddress',
      },
    });

    const rawSignatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId('someAccountId'),
    });

    const authorization = {
      type: AuthorizationType.RotatePrimaryKeyToSecondary,
      value: args.permissions,
    };
    const rawAuthorizationData = dsMockUtils.createMockAuthorizationData({
      RotatePrimaryKeyToSecondary:
        args.permissions as unknown as PolymeshPrimitivesSecondaryKeyPermissions,
    });

    const rawExpiry = dsMockUtils.createMockMoment(new BigNumber(expiry.getTime()));

    signerToSignatorySpy.mockReturnValue(rawSignatory);
    when(signerToStringSpy).calledWith(target).mockReturnValue(address);
    when(signerToStringSpy).calledWith(someOtherTarget).mockReturnValue('someOtherAccount');

    when(authorizationToAuthorizationDataSpy)
      .calledWith(authorization, mockContext)
      .mockReturnValue(rawAuthorizationData);

    const proc = procedureMockUtils.getInstance<
      RotatePrimaryKeyToSecondaryParams,
      AuthorizationRequest
    >(mockContext);

    const transaction = dsMockUtils.createTxMock('identity', 'addAuthorization');

    let result = await prepareRotatePrimaryKeyToSecondary.call(proc, args);

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, null],
      resolver: expect.any(Function),
    });

    when(expiryToMomentSpy).calledWith(expiry, mockContext).mockReturnValue(rawExpiry);

    result = await prepareRotatePrimaryKeyToSecondary.call(proc, { ...args, expiry });

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, rawExpiry],
      resolver: expect.any(Function),
    });
  });

  it('should throw an error if the passed Account is linked to another Identity', () => {
    const target = entityMockUtils.getAccountInstance({
      address,
      isEqual: true,
    });
    dsMockUtils.configureMocks({
      contextOptions: {
        primaryAccount: 'someOtherAddress',
        signingIdentityIsEqual: false,
      },
    });
    dsMockUtils.createTxMock('identity', 'addAuthorization');
    const identity = entityMockUtils.getIdentityInstance({ did: 'someDid', isEqual: false });
    mockAccount = entityMockUtils.getAccountInstance({
      address,
      getIdentity: identity,
    });

    when(asAccountSpy).calledWith(address, mockContext).mockReturnValue(mockAccount);

    const sentAuthorizations: ResultSet<AuthorizationRequest> = {
      data: [],
      next: new BigNumber(0),
      count: new BigNumber(0),
    };

    dsMockUtils.configureMocks({
      contextOptions: {
        sentAuthorizations,
        primaryAccount: 'someOtherAddress',
      },
    });

    when(signerToStringSpy).calledWith(args.targetAccount).mockReturnValue(address);
    when(signerToStringSpy).calledWith(target).mockReturnValue(address);

    const proc = procedureMockUtils.getInstance<
      RotatePrimaryKeyToSecondaryParams,
      AuthorizationRequest
    >(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The target Account is assigned to another Identity',
    });

    return expect(prepareRotatePrimaryKeyToSecondary.call(proc, { ...args })).rejects.toThrow(
      expectedError
    );
  });

  it('should throw an error if the passed Account is the primary Account of the signing Identity', () => {
    const target = entityMockUtils.getAccountInstance({
      address,
    });
    dsMockUtils.configureMocks({
      contextOptions: {
        primaryAccount: address,
        signingIdentityIsEqual: true,
      },
    });
    dsMockUtils.createTxMock('identity', 'addAuthorization');
    mockAccount = entityMockUtils.getAccountInstance({
      address,
      isEqual: true,
      getIdentity: null,
    });

    when(asAccountSpy).calledWith(address, mockContext).mockReturnValue(mockAccount);

    const sentAuthorizations: ResultSet<AuthorizationRequest> = {
      data: [],
      next: new BigNumber(0),
      count: new BigNumber(0),
    };

    dsMockUtils.configureMocks({
      contextOptions: {
        sentAuthorizations,
      },
    });

    when(signerToStringSpy).calledWith(args.targetAccount).mockReturnValue(address);
    when(signerToStringSpy).calledWith(target).mockReturnValue(address);

    const proc = procedureMockUtils.getInstance<
      RotatePrimaryKeyToSecondaryParams,
      AuthorizationRequest
    >(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The target Account is already the primary key of the given Identity',
    });

    return expect(prepareRotatePrimaryKeyToSecondary.call(proc, { ...args })).rejects.toThrow(
      expectedError
    );
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

    const proc = procedureMockUtils.getInstance<
      RotatePrimaryKeyToSecondaryParams,
      AuthorizationRequest
    >(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message:
        'The target Account already has a pending invitation to become the primary key of the given Identity',
    });

    return expect(prepareRotatePrimaryKeyToSecondary.call(proc, { ...args })).rejects.toThrow(
      expectedError
    );
  });
});
