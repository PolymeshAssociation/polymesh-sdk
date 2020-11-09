import { Moment } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { AuthorizationData, Signatory } from 'polymesh-types/types';
import sinon from 'sinon';

import { Account, AuthorizationRequest, DefaultPortfolio } from '~/api/entities';
import { Params, prepareSetCustodian } from '~/api/procedures/setCustodian';
import { Context } from '~/base';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, AuthorizationType, Identity, ResultSet } from '~/types';
import { SignerType, SignerValue } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('setCustodian procedure', () => {
  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let authorizationToAuthorizationDataStub: sinon.SinonStub<
    [Authorization, Context],
    AuthorizationData
  >;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let signerToStringStub: sinon.SinonStub<[string | Identity | Account], string>;
  let signerValueToSignatoryStub: sinon.SinonStub<[SignerValue, Context], Signatory>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    authorizationToAuthorizationDataStub = sinon.stub(
      utilsModule,
      'authorizationToAuthorizationData'
    );
    dateToMomentStub = sinon.stub(utilsModule, 'dateToMoment');
    signerToStringStub = sinon.stub(utilsModule, 'signerToString');
    signerValueToSignatoryStub = sinon.stub(utilsModule, 'signerValueToSignatory');
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

  test('should throw an error if the passed account has a pending authorization to accept', async () => {
    const did = 'someDid';
    const args = { targetAccount: 'targetAccount', did };

    const target = new Account({ address: args.targetAccount }, mockContext);
    const signer = entityMockUtils.getAccountInstance({ address: 'someFakeAccount' });
    const fakePortfolio = new DefaultPortfolio({ did }, mockContext);
    const sentAuthorizations: ResultSet<AuthorizationRequest> = {
      data: [
        new AuthorizationRequest(
          {
            target,
            issuer: entityMockUtils.getIdentityInstance(),
            authId: new BigNumber(1),
            expiry: null,
            data: { type: AuthorizationType.PortfolioCustody, value: fakePortfolio },
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

    signerToStringStub.withArgs(signer).returns(signer.address);
    signerToStringStub.withArgs(args.targetAccount).returns(args.targetAccount);
    signerToStringStub.withArgs(target).returns(args.targetAccount);

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await expect(prepareSetCustodian.call(proc, args)).rejects.toThrow(
      'The target Account already has a pending invitation to be the custodian for the portfolio'
    );
  });

  test('should add an add authorization transaction to the queue', async () => {
    const did = 'someDid';
    const id = new BigNumber(1);
    const expiry = new Date('1/1/2040');
    const args = { targetAccount: 'targetAccount', did };
    const target = new Account({ address: args.targetAccount }, mockContext);
    const signer = entityMockUtils.getAccountInstance({ address: 'someFakeAccount' });
    const rawSignatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId('someAccountId'),
    });
    const rawDid = dsMockUtils.createMockIdentityId(did);
    const rawPortfolioKind = dsMockUtils.createMockPortfolioKind({
      User: dsMockUtils.createMockU64(id.toNumber()),
    });
    const rawAuthorizationData = dsMockUtils.createMockAuthorizationData({
      PortfolioCustody: dsMockUtils.createMockPortfolioId({ did: rawDid, kind: rawPortfolioKind }),
    });
    const rawExpiry = dsMockUtils.createMockMoment(expiry.getTime());
    const sentAuthorizations: ResultSet<AuthorizationRequest> = {
      data: [
        new AuthorizationRequest(
          {
            target,
            issuer: entityMockUtils.getIdentityInstance(),
            authId: new BigNumber(1),
            expiry: null,
            data: { type: AuthorizationType.JoinIdentity, value: [] },
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

    signerToStringStub.withArgs(signer).returns(signer.address);
    signerToStringStub.withArgs(args.targetAccount).returns(args.targetAccount);
    signerToStringStub.withArgs(target).returns('someValue');
    signerValueToSignatoryStub
      .withArgs({ type: SignerType.Account, value: args.targetAccount }, mockContext)
      .returns(rawSignatory);
    authorizationToAuthorizationDataStub.returns(rawAuthorizationData);
    dateToMomentStub.withArgs(expiry, mockContext).returns(rawExpiry);

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('identity', 'addAuthorization');

    await prepareSetCustodian.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawSignatory,
      rawAuthorizationData,
      null
    );

    await prepareSetCustodian.call(proc, { ...args, id, expiry });

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawSignatory,
      rawAuthorizationData,
      rawExpiry
    );
  });
});
