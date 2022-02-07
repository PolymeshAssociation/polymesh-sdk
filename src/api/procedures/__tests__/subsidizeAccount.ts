import { AccountId, Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { prepareSubsidizeAccount, SubsidizeAccountParams } from '~/api/procedures/subsidizeAccount';
import { Account, AuthorizationRequest, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AuthorizationType, Identity, ResultSet } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('subsidizeAccount procedure', () => {
  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;

  let signerToStringStub: sinon.SinonStub<[string | Identity | Account], string>;
  let stringToAccountIdStub: sinon.SinonStub<[string, Context], AccountId>;
  let bigNumberToBalanceStub: sinon.SinonStub<[BigNumber, Context, boolean?], Balance>;

  let args: SubsidizeAccountParams;
  const authId = new BigNumber(1);
  const address = 'beneficiary';
  const allowance = new BigNumber(1000);
  let beneficiary: Account;
  let rawBeneficiaryAccount: AccountId;
  let rawAllowance: Balance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    signerToStringStub = sinon.stub(utilsConversionModule, 'signerToString');
    stringToAccountIdStub = sinon.stub(utilsConversionModule, 'stringToAccountId');
    bigNumberToBalanceStub = sinon.stub(utilsConversionModule, 'bigNumberToBalance');
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    args = { beneficiary: address, allowance };
    beneficiary = entityMockUtils.getAccountInstance({ address });
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

  test('should throw an error if the subsidizer has already sent a pending authorization to beneficiary Account with the same allowance to accept', () => {
    const sentAuthorizations: ResultSet<AuthorizationRequest> = {
      data: [
        new AuthorizationRequest(
          {
            target: beneficiary,
            issuer: entityMockUtils.getIdentityInstance(),
            authId,
            expiry: null,
            data: {
              type: AuthorizationType.AddRelayerPayingKey,
              value: {
                beneficiary,
                subsidizer: entityMockUtils.getAccountInstance(),
                allowance: new BigNumber(1000),
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

    signerToStringStub.withArgs(beneficiary).returns(address);

    const proc = procedureMockUtils.getInstance<SubsidizeAccountParams, AuthorizationRequest>(
      mockContext
    );

    expect(prepareSubsidizeAccount.call(proc, args)).rejects.toThrow(
      'The Beneficiary Account already has a pending invitation to add this account as a subsidizer'
    );
  });

  test('should add an add authorization transaction to the queue', async () => {
    const randomBeneficiary = entityMockUtils.getAccountInstance({ address: 'randomAddress' });
    const issuer = entityMockUtils.getIdentityInstance();
    const subsidizer = entityMockUtils.getAccountInstance();

    const sentAuthorizations: ResultSet<AuthorizationRequest> = {
      data: [
        new AuthorizationRequest(
          {
            target: randomBeneficiary,
            issuer,
            authId,
            expiry: null,
            data: {
              type: AuthorizationType.AddRelayerPayingKey,
              value: {
                beneficiary: randomBeneficiary,
                subsidizer,
                allowance: new BigNumber(100),
              },
            },
          },
          mockContext
        ),
        new AuthorizationRequest(
          {
            target: randomBeneficiary,
            issuer: entityMockUtils.getIdentityInstance(),
            authId,
            expiry: null,
            data: {
              type: AuthorizationType.AddRelayerPayingKey,
              value: {
                beneficiary,
                subsidizer,
                allowance: new BigNumber(100),
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

    rawBeneficiaryAccount = dsMockUtils.createMockAccountId(address);

    rawAllowance = dsMockUtils.createMockBalance(allowance);

    stringToAccountIdStub.withArgs(address, mockContext).returns(rawBeneficiaryAccount);

    bigNumberToBalanceStub.withArgs(allowance, mockContext).returns(rawAllowance);

    const proc = procedureMockUtils.getInstance<SubsidizeAccountParams, AuthorizationRequest>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('relayer', 'setPayingKey');

    await prepareSubsidizeAccount.call(proc, { ...args, beneficiary });

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction,
        resolvers: sinon.match.array,
        args: [rawBeneficiaryAccount, rawAllowance],
      })
    );
  });
});
