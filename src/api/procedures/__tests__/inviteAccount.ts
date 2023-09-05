import { Moment } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesAuthorizationAuthorizationData,
  PolymeshPrimitivesSecondaryKeySignatory,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { prepareInviteAccount } from '~/api/procedures/inviteAccount';
import { Account, AuthorizationRequest, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  Authorization,
  AuthorizationType,
  Identity,
  InviteAccountParams,
  ResultSet,
  SignerType,
  SignerValue,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('inviteAccount procedure', () => {
  let mockContext: Mocked<Context>;
  let authorizationToAuthorizationDataSpy: jest.SpyInstance<
    PolymeshPrimitivesAuthorizationAuthorizationData,
    [Authorization, Context]
  >;
  let dateToMomentSpy: jest.SpyInstance<Moment, [Date, Context]>;
  let signerToStringSpy: jest.SpyInstance<string, [string | Identity | Account]>;
  let signerValueToSignatorySpy: jest.SpyInstance<
    PolymeshPrimitivesSecondaryKeySignatory,
    [SignerValue, Context]
  >;
  let permissionsLikeToPermissionsSpy: jest.SpyInstance;

  let args: InviteAccountParams;
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
    dateToMomentSpy = jest.spyOn(utilsConversionModule, 'dateToMoment');
    signerToStringSpy = jest.spyOn(utilsConversionModule, 'signerToString');
    signerValueToSignatorySpy = jest.spyOn(utilsConversionModule, 'signerValueToSignatory');
    permissionsLikeToPermissionsSpy = jest.spyOn(
      utilsConversionModule,
      'permissionsLikeToPermissions'
    );
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
    const account = entityMockUtils.getAccountInstance({ address: 'someFakeAccount' });
    const rawSignatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId('someAccountId'),
    });
    const rawAuthorizationData = dsMockUtils.createMockAuthorizationData({
      JoinIdentity: dsMockUtils.createMockPermissions({
        asset: dsMockUtils.createMockAssetPermissions('Whole'),
        extrinsic: dsMockUtils.createMockExtrinsicPermissions('Whole'),
        portfolio: dsMockUtils.createMockPortfolioPermissions('Whole'),
      }),
    });
    const rawExpiry = dsMockUtils.createMockMoment(new BigNumber(expiry.getTime()));
    const sentAuthorizations: ResultSet<AuthorizationRequest> = {
      data: [
        new AuthorizationRequest(
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
      ],
      next: new BigNumber(1),
      count: new BigNumber(1),
    };

    dsMockUtils.configureMocks({
      contextOptions: {
        sentAuthorizations,
        secondaryAccounts: {
          data: [
            {
              account,
              permissions: {
                assets: null,
                portfolios: null,
                transactions: null,
                transactionGroups: [],
              },
            },
          ],
          next: null,
        },
      },
    });

    entityMockUtils.configureMocks({
      accountOptions: {
        getIdentity: null,
      },
    });

    when(signerToStringSpy).calledWith(account).mockReturnValue(account.address);
    when(signerToStringSpy).calledWith(args.targetAccount).mockReturnValue(address);
    when(signerToStringSpy).calledWith(target).mockReturnValue('someValue');
    when(signerValueToSignatorySpy)
      .calledWith({ type: SignerType.Account, value: address }, mockContext)
      .mockReturnValue(rawSignatory);
    authorizationToAuthorizationDataSpy.mockReturnValue(rawAuthorizationData);
    when(dateToMomentSpy).calledWith(expiry, mockContext).mockReturnValue(rawExpiry);

    const proc = procedureMockUtils.getInstance<InviteAccountParams, AuthorizationRequest>(
      mockContext
    );

    const transaction = dsMockUtils.createTxMock('identity', 'addAuthorization');

    let result = await prepareInviteAccount.call(proc, args);

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, null],
      resolver: expect.any(Function),
    });

    result = await prepareInviteAccount.call(proc, { ...args, expiry });

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, rawExpiry],
      resolver: expect.any(Function),
    });

    permissionsLikeToPermissionsSpy.mockResolvedValue({
      assets: null,
      transactions: null,
      portfolios: null,
    });

    result = await prepareInviteAccount.call(proc, {
      ...args,
      permissions: {
        assets: null,
        transactions: null,
        portfolios: null,
      },
    });

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, null],
      resolver: expect.any(Function),
    });
  });

  it('should throw an error if the passed Account is already part of an Identity', () => {
    const identity = entityMockUtils.getIdentityInstance();
    const targetAccount = entityMockUtils.getAccountInstance({
      address: 'someAddress',
      getIdentity: identity,
    });

    when(signerToStringSpy).calledWith(args.targetAccount).mockReturnValue(address);

    const proc = procedureMockUtils.getInstance<InviteAccountParams, AuthorizationRequest>(
      mockContext
    );

    return expect(prepareInviteAccount.call(proc, { targetAccount })).rejects.toThrow(
      'The target Account is already part of an Identity'
    );
  });

  it('should throw an error if the passed Account has a pending authorization to accept', () => {
    const target = entityMockUtils.getAccountInstance({
      address,
    });
    const account = entityMockUtils.getAccountInstance({ address: 'someFakeAccount' });

    const sentAuthorizations: ResultSet<AuthorizationRequest> = {
      data: [
        new AuthorizationRequest(
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
      ],
      next: new BigNumber(1),
      count: new BigNumber(1),
    };

    dsMockUtils.configureMocks({
      contextOptions: {
        withSigningManager: true,
        sentAuthorizations,
        secondaryAccounts: {
          data: [
            {
              account,
              permissions: {
                assets: null,
                portfolios: null,
                transactions: null,
                transactionGroups: [],
              },
            },
          ],
          next: null,
        },
      },
    });

    entityMockUtils.configureMocks({
      accountOptions: {
        getIdentity: null,
      },
    });

    when(signerToStringSpy).calledWith(args.targetAccount).mockReturnValue(address);
    when(signerToStringSpy).calledWith(target).mockReturnValue(address);

    const proc = procedureMockUtils.getInstance<InviteAccountParams, AuthorizationRequest>(
      mockContext
    );

    return expect(prepareInviteAccount.call(proc, { ...args })).rejects.toThrow(
      'The target Account already has a pending invitation to join this Identity'
    );
  });
});
