import { Moment } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { AuthorizationData, Signatory } from 'polymesh-types/types';
import sinon from 'sinon';

import { prepareInviteAccount } from '~/api/procedures/inviteAccount';
import { Account, AuthorizationRequest, Context, InviteAccountParams } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, AuthorizationType, Identity, ResultSet } from '~/types';
import { SignerType, SignerValue } from '~/types/internal';
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
    AuthorizationData
  >;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let signerToStringStub: sinon.SinonStub<[string | Identity | Account], string>;
  let signerValueToSignatoryStub: sinon.SinonStub<[SignerValue, Context], Signatory>;
  let permissionsLikeToPermissionsStub: sinon.SinonStub;

  const args = { targetAccount: 'targetAccount' };
  const authId = new BigNumber(1);

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
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should add an add authorization transaction to the queue', async () => {
    const expiry = new Date('1/1/2040');
    const target = new Account({ address: args.targetAccount }, mockContext);
    const signer = entityMockUtils.getAccountInstance({ address: 'someFakeAccount' });
    const rawSignatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId('someAccountId'),
    });
    const rawAuthorizationData = dsMockUtils.createMockAuthorizationData({
      JoinIdentity: dsMockUtils.createMockPermissions({
        asset: [],
        extrinsic: [],
        portfolio: [],
      }),
    });
    const rawExpiry = dsMockUtils.createMockMoment(expiry.getTime());
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
                tokens: null,
                transactions: null,
                transactionGroups: [],
                portfolios: null,
              },
            },
          },
          mockContext
        ),
      ],
      next: 1,
      count: 1,
    };

    dsMockUtils.configureMocks({
      contextOptions: {
        sentAuthorizations,
      },
    });

    mockContext.getSecondaryKeys.resolves([
      {
        signer,
        permissions: [],
      },
    ]);

    entityMockUtils.getAccountGetIdentityStub().resolves(null);

    signerToStringStub.withArgs(signer).returns(signer.address);
    signerToStringStub.withArgs(args.targetAccount).returns(args.targetAccount);
    signerToStringStub.withArgs(target).returns('someValue');
    signerValueToSignatoryStub
      .withArgs({ type: SignerType.Account, value: args.targetAccount }, mockContext)
      .returns(rawSignatory);
    authorizationToAuthorizationDataStub.returns(rawAuthorizationData);
    dateToMomentStub.withArgs(expiry, mockContext).returns(rawExpiry);

    const proc = procedureMockUtils.getInstance<InviteAccountParams, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('identity', 'addAuthorization');

    await prepareInviteAccount.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawSignatory,
      rawAuthorizationData,
      null
    );

    await prepareInviteAccount.call(proc, { ...args, expiry });

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawSignatory,
      rawAuthorizationData,
      rawExpiry
    );

    permissionsLikeToPermissionsStub.resolves({
      tokens: null,
      transactions: null,
      portfolios: null,
    });

    await prepareInviteAccount.call(proc, {
      ...args,
      permissions: {
        tokens: null,
        transactions: null,
        portfolios: null,
      },
    });

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawSignatory,
      rawAuthorizationData,
      null
    );
  });

  test('should throw an error if the passed account is already part of an Identity', async () => {
    const targetAccount = entityMockUtils.getAccountInstance({
      address: 'someAddress',
      getIdentity: entityMockUtils.getIdentityInstance(),
    });

    signerToStringStub.withArgs(args.targetAccount).returns(args.targetAccount);

    const proc = procedureMockUtils.getInstance<InviteAccountParams, void>(mockContext);

    await expect(prepareInviteAccount.call(proc, { targetAccount })).rejects.toThrow(
      'The target Account is already part of an Identity'
    );
  });

  test('should throw an error if the passed account is already present in the secondary keys list', async () => {
    const signer = entityMockUtils.getAccountInstance({ address: 'someFakeAccount' });

    entityMockUtils.getAccountGetIdentityStub().resolves(null);
    mockContext.getSecondaryKeys.resolves([
      {
        signer,
        permissions: [],
      },
    ]);

    signerToStringStub.withArgs(signer).returns(args.targetAccount);
    signerToStringStub.withArgs(args.targetAccount).returns(args.targetAccount);

    const proc = procedureMockUtils.getInstance<InviteAccountParams, void>(mockContext);

    await expect(prepareInviteAccount.call(proc, args)).rejects.toThrow(
      'The target Account is already a secondary key for this Identity'
    );
  });

  test('should throw an error if the passed account has a pending authorization to accept', async () => {
    const target = entityMockUtils.getAccountInstance({
      address: args.targetAccount,
    });
    const signer = entityMockUtils.getAccountInstance({ address: 'someFakeAccount' });

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
                tokens: null,
                transactions: null,
                transactionGroups: [],
                portfolios: null,
              },
            },
          },
          mockContext
        ),
      ],
      next: 1,
      count: 1,
    };

    dsMockUtils.configureMocks({
      contextOptions: {
        sentAuthorizations,
      },
    });

    mockContext.getSecondaryKeys.resolves([
      {
        signer,
        permissions: [],
      },
    ]);

    entityMockUtils.getAccountGetIdentityStub().resolves(null);

    signerToStringStub.withArgs(signer).returns(signer.address);
    signerToStringStub.withArgs(args.targetAccount).returns(args.targetAccount);
    signerToStringStub.withArgs(target).returns(args.targetAccount);

    const proc = procedureMockUtils.getInstance<InviteAccountParams, void>(mockContext);

    await expect(prepareInviteAccount.call(proc, args)).rejects.toThrow(
      'The target Account already has a pending invitation to join this Identity'
    );
  });
});
