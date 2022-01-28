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
  let numberToBalanceStub: sinon.SinonStub<[number | BigNumber, Context, boolean?], Balance>;

  let args: SubsidizeAccountParams;
  const authId = new BigNumber(1);
  const address = 'beneficiaryAccount';
  const polyxLimit = new BigNumber(1000);
  let beneficiaryAccount: Account;
  let rawBeneficiaryAccount: AccountId;
  let rawPolyxLimit: Balance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    signerToStringStub = sinon.stub(utilsConversionModule, 'signerToString');
    stringToAccountIdStub = sinon.stub(utilsConversionModule, 'stringToAccountId');
    numberToBalanceStub = sinon.stub(utilsConversionModule, 'numberToBalance');
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    args = { beneficiaryAccount: address, polyxLimit };
    beneficiaryAccount = entityMockUtils.getAccountInstance({ address });
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

  test('should throw an error if the beneficiary Account does not have an Identity', () => {
    const randomAccount = entityMockUtils.getAccountInstance({
      address: 'randomAddress',
      getIdentity: null,
    });

    const proc = procedureMockUtils.getInstance<SubsidizeAccountParams, AuthorizationRequest>(
      mockContext
    );

    return expect(
      prepareSubsidizeAccount.call(proc, { beneficiaryAccount: randomAccount, polyxLimit })
    ).rejects.toThrow('Beneficiary Account does not have an Identity');
  });

  test('should throw an error if the subsidizer has already sent a pending authorization to beneficiary Account to accept', () => {
    const sentAuthorizations: ResultSet<AuthorizationRequest> = {
      data: [
        new AuthorizationRequest(
          {
            target: beneficiaryAccount,
            issuer: entityMockUtils.getIdentityInstance(),
            authId,
            expiry: null,
            data: {
              type: AuthorizationType.AddRelayerPayingKey,
              value: {
                beneficiary: beneficiaryAccount,
                subsidizer: entityMockUtils.getAccountInstance(),
                allowance: new BigNumber(100),
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

    signerToStringStub.withArgs(beneficiaryAccount).returns(address);

    const proc = procedureMockUtils.getInstance<SubsidizeAccountParams, AuthorizationRequest>(
      mockContext
    );

    return expect(prepareSubsidizeAccount.call(proc, args)).rejects.toThrow(
      'The Beneficiary Account already has a pending invitation to add this account as a subsidizer'
    );
  });

  test('should add an add authorization transaction to the queue', async () => {
    const randomBeneficiary = entityMockUtils.getAccountInstance({ address: 'someAddress' });
    const sentAuthorizations: ResultSet<AuthorizationRequest> = {
      data: [
        new AuthorizationRequest(
          {
            target: randomBeneficiary,
            issuer: entityMockUtils.getIdentityInstance(),
            authId,
            expiry: null,
            data: {
              type: AuthorizationType.AddRelayerPayingKey,
              value: {
                beneficiary: randomBeneficiary,
                subsidizer: entityMockUtils.getAccountInstance(),
                allowance: new BigNumber(100),
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

    rawBeneficiaryAccount = dsMockUtils.createMockAccountId(address);

    rawPolyxLimit = dsMockUtils.createMockBalance(polyxLimit.toNumber());

    stringToAccountIdStub.withArgs(address, mockContext).returns(rawBeneficiaryAccount);

    numberToBalanceStub.withArgs(polyxLimit, mockContext).returns(rawPolyxLimit);

    const proc = procedureMockUtils.getInstance<SubsidizeAccountParams, AuthorizationRequest>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('relayer', 'setPayingKey');

    await prepareSubsidizeAccount.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction,
        resolvers: sinon.match.array,
        args: [rawBeneficiaryAccount, rawPolyxLimit],
      })
    );
  });
});
