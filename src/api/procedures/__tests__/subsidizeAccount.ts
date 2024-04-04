import { AccountId, Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { prepareSubsidizeAccount } from '~/api/procedures/subsidizeAccount';
import { Account, AuthorizationRequest, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AuthorizationType, Identity, ResultSet, SubsidizeAccountParams } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('subsidizeAccount procedure', () => {
  let mockContext: Mocked<Context>;

  let signerToStringSpy: jest.SpyInstance<string, [string | Identity | Account]>;
  let stringToAccountIdSpy: jest.SpyInstance<AccountId, [string, Context]>;
  let bigNumberToBalanceSpy: jest.SpyInstance<Balance, [BigNumber, Context, boolean?]>;

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

    signerToStringSpy = jest.spyOn(utilsConversionModule, 'signerToString');
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
  });

  beforeEach(() => {
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
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if the subsidizer has already sent a pending authorization to beneficiary Account with the same allowance to accept', () => {
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
      next: null,
      count: new BigNumber(1),
    };

    dsMockUtils.configureMocks({
      contextOptions: {
        sentAuthorizations,
      },
    });

    when(signerToStringSpy).calledWith(beneficiary).mockReturnValue(address);

    const proc = procedureMockUtils.getInstance<SubsidizeAccountParams, AuthorizationRequest>(
      mockContext
    );

    return expect(prepareSubsidizeAccount.call(proc, args)).rejects.toThrow(
      'The Beneficiary Account already has a pending invitation to add this account as a subsidizer'
    );
  });

  it('should return an add authorization transaction spec', async () => {
    const mockBeneficiary = entityMockUtils.getAccountInstance({ address: 'mockAddress' });
    const issuer = entityMockUtils.getIdentityInstance();
    const subsidizer = entityMockUtils.getAccountInstance();

    const sentAuthorizations: ResultSet<AuthorizationRequest> = {
      data: [
        new AuthorizationRequest(
          {
            target: mockBeneficiary,
            issuer,
            authId,
            expiry: null,
            data: {
              type: AuthorizationType.AddRelayerPayingKey,
              value: {
                beneficiary: mockBeneficiary,
                subsidizer,
                allowance: new BigNumber(100),
              },
            },
          },
          mockContext
        ),
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
                subsidizer,
                allowance: new BigNumber(100),
              },
            },
          },
          mockContext
        ),
      ],
      next: null,
      count: new BigNumber(2),
    };

    dsMockUtils.configureMocks({
      contextOptions: {
        sentAuthorizations,
      },
    });

    rawBeneficiaryAccount = dsMockUtils.createMockAccountId(address);

    rawAllowance = dsMockUtils.createMockBalance(allowance);

    when(stringToAccountIdSpy)
      .calledWith(address, mockContext)
      .mockReturnValue(rawBeneficiaryAccount);

    when(bigNumberToBalanceSpy).calledWith(allowance, mockContext).mockReturnValue(rawAllowance);

    const proc = procedureMockUtils.getInstance<SubsidizeAccountParams, AuthorizationRequest>(
      mockContext
    );

    const transaction = dsMockUtils.createTxMock('relayer', 'setPayingKey');

    const result = await prepareSubsidizeAccount.call(proc, { ...args, beneficiary });

    expect(result).toEqual({
      transaction,
      args: [rawBeneficiaryAccount, rawAllowance],
      resolver: expect.any(Function),
    });
  });
});
