import { Moment } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesAuthorizationAuthorizationData } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { Signatory } from 'polymesh-types/types';
import sinon from 'sinon';

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
  let addTransactionStub: sinon.SinonStub;
  let authorizationToAuthorizationDataStub: sinon.SinonStub<
    [Authorization, Context],
    PolymeshPrimitivesAuthorizationAuthorizationData
  >;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let signerToStringStub: sinon.SinonStub<[string | Identity | Account], string>;
  let signerValueToSignatoryStub: sinon.SinonStub<[SignerValue, Context], Signatory>;
  let permissionsLikeToPermissionsStub: sinon.SinonStub;

  let args: InviteAccountParams;
  const authId = new BigNumber(1);
  const address = 'targetAccount';

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    authorizationToAuthorizationDataStub = sinon.stub(
      utilsConversionModule,
      'authorizationToAuthorizationData'
    );
    dateToMomentStub = sinon.stub(utilsConversionModule, 'dateToMoment');
    signerToStringStub = sinon.stub(utilsConversionModule, 'signerToString');
    signerValueToSignatoryStub = sinon.stub(utilsConversionModule, 'signerValueToSignatory');
    permissionsLikeToPermissionsStub = sinon.stub(
      utilsConversionModule,
      'permissionsLikeToPermissions'
    );
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
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

  it('should add an add authorization transaction to the queue', async () => {
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
        secondaryAccounts: [
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
      },
    });

    entityMockUtils.configureMocks({
      accountOptions: {
        getIdentity: null,
      },
    });

    signerToStringStub.withArgs(account).returns(account.address);
    signerToStringStub.withArgs(args.targetAccount).returns(address);
    signerToStringStub.withArgs(target).returns('someValue');
    signerValueToSignatoryStub
      .withArgs({ type: SignerType.Account, value: address }, mockContext)
      .returns(rawSignatory);
    authorizationToAuthorizationDataStub.returns(rawAuthorizationData);
    dateToMomentStub.withArgs(expiry, mockContext).returns(rawExpiry);

    const proc = procedureMockUtils.getInstance<InviteAccountParams, AuthorizationRequest>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('identity', 'addAuthorization');

    await prepareInviteAccount.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction,
        resolvers: sinon.match.array,
        args: [rawSignatory, rawAuthorizationData, null],
      })
    );

    await prepareInviteAccount.call(proc, { ...args, expiry });

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction,
        resolvers: sinon.match.array,
        args: [rawSignatory, rawAuthorizationData, rawExpiry],
      })
    );

    permissionsLikeToPermissionsStub.resolves({
      assets: null,
      transactions: null,
      portfolios: null,
    });

    await prepareInviteAccount.call(proc, {
      ...args,
      permissions: {
        assets: null,
        transactions: null,
        portfolios: null,
      },
    });

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction,
        resolvers: sinon.match.array,
        args: [rawSignatory, rawAuthorizationData, null],
      })
    );
  });

  it('should throw an error if the passed Account is already part of an Identity', () => {
    const identity = entityMockUtils.getIdentityInstance();
    const targetAccount = entityMockUtils.getAccountInstance({
      address: 'someAddress',
      getIdentity: identity,
    });

    signerToStringStub.withArgs(args.targetAccount).returns(address);

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
        sentAuthorizations: sentAuthorizations,
        secondaryAccounts: [
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
      },
    });

    entityMockUtils.configureMocks({
      accountOptions: {
        getIdentity: null,
      },
    });

    signerToStringStub.withArgs(args.targetAccount).returns(address);
    signerToStringStub.withArgs(target).returns(address);

    const proc = procedureMockUtils.getInstance<InviteAccountParams, AuthorizationRequest>(
      mockContext
    );

    return expect(prepareInviteAccount.call(proc, { ...args })).rejects.toThrow(
      'The target Account already has a pending invitation to join this Identity'
    );
  });
});
