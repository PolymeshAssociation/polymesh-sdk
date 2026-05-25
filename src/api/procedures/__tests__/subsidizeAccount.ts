import { AccountId, Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  Params,
  prepareSubsidizeAccount,
  subsidizeAccount,
} from '~/api/procedures/subsidizeAccount';
import { Account, AuthorizationRequest, Context, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AuthorizationType, Identity, ResultSet, SubsidyWithAllowance } from '~/types';
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

  let args: Params;
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
    // @ts-expect-error - mock
    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    args = { beneficiary: address, allowance, isV7Method: false };
    beneficiary = entityMockUtils.getAccountInstance({ address });

    when(stringToAccountIdSpy)
      .calledWith(address, mockContext)
      .mockReturnValue(rawBeneficiaryAccount);

    rawBeneficiaryAccount = dsMockUtils.createMockAccountId(address);
    rawAllowance = dsMockUtils.createMockBalance(allowance);

    when(stringToAccountIdSpy)
      .calledWith(address, mockContext)
      .mockReturnValue(rawBeneficiaryAccount);
    when(bigNumberToBalanceSpy).calledWith(allowance, mockContext).mockReturnValue(rawAllowance);
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

  it('should throw an error if the subsidizer has already sent a pending authorization to beneficiary Account with the same allowance to accept in v7', () => {
    const sentAuthorizations: ResultSet<AuthorizationRequest> = {
      data: [
        new AuthorizationRequest(
          {
            target: beneficiary,
            issuer: entityMockUtils.getIdentityInstance(),
            authId,
            expiry: null,
            data: {
              type: AuthorizationType.AddRelayerPayingKey, // NOSONAR
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
        isV7: true,
      },
    });

    when(signerToStringSpy).calledWith(beneficiary).mockReturnValue(address);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proc = procedureMockUtils.getInstance<Params, any>(mockContext);

    return expect(
      prepareSubsidizeAccount.call(proc, { ...args, isV7Method: true })
    ).rejects.toThrow(
      'The Beneficiary Account already has a pending invitation to add this account as a subsidizer'
    );
  });

  it('should return an add authorization transaction spec for v7 chain', async () => {
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
              type: AuthorizationType.AddRelayerPayingKey, // NOSONAR
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
              type: AuthorizationType.AddRelayerPayingKey, // NOSONAR
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
        isV7: true,
      },
    });

    rawBeneficiaryAccount = dsMockUtils.createMockAccountId(address);

    rawAllowance = dsMockUtils.createMockBalance(allowance);

    when(stringToAccountIdSpy)
      .calledWith(address, mockContext)
      .mockReturnValue(rawBeneficiaryAccount);

    when(bigNumberToBalanceSpy).calledWith(allowance, mockContext).mockReturnValue(rawAllowance);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proc = procedureMockUtils.getInstance<Params, any>(mockContext);

    const transaction = dsMockUtils.createTxMock('relayer', 'setPayingKey');

    const result = await prepareSubsidizeAccount.call(proc, {
      ...args,
      beneficiary,
      isV7Method: true,
    });

    expect(result).toEqual({
      transaction,
      args: [rawBeneficiaryAccount, rawAllowance],
      resolver: expect.any(Function),
    });
  });

  it('should throw NotSupported when isV7Method is true but chain is v8', () => {
    dsMockUtils.configureMocks({
      contextOptions: {
        isV7: false,
        sentAuthorizations: { data: [], next: null, count: new BigNumber(0) },
      },
    });

    rawBeneficiaryAccount = dsMockUtils.createMockAccountId(address);
    rawAllowance = dsMockUtils.createMockBalance(allowance);

    when(stringToAccountIdSpy)
      .calledWith(address, mockContext)
      .mockReturnValue(rawBeneficiaryAccount);
    when(bigNumberToBalanceSpy).calledWith(allowance, mockContext).mockReturnValue(rawAllowance);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proc = procedureMockUtils.getInstance<Params, any>(mockContext);

    return expect(
      prepareSubsidizeAccount.call(proc, { ...args, beneficiary, isV7Method: true })
    ).rejects.toThrow(
      'This method is no longer supported for chain 8.x. Use approveSubsidy instead'
    );
  });

  it('should throw NotSupported when isV7Method is false but chain is v7', () => {
    dsMockUtils.configureMocks({
      contextOptions: {
        isV7: true,
        sentAuthorizations: { data: [], next: null, count: new BigNumber(0) },
      },
    });

    rawBeneficiaryAccount = dsMockUtils.createMockAccountId(address);
    rawAllowance = dsMockUtils.createMockBalance(allowance);

    when(stringToAccountIdSpy)
      .calledWith(address, mockContext)
      .mockReturnValue(rawBeneficiaryAccount);
    when(bigNumberToBalanceSpy).calledWith(allowance, mockContext).mockReturnValue(rawAllowance);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proc = procedureMockUtils.getInstance<Params, any>(mockContext);

    return expect(
      prepareSubsidizeAccount.call(proc, { ...args, beneficiary, isV7Method: false })
    ).rejects.toThrow('This method is not supported for chain 7.x. Use subsidizeAccount instead');
  });

  it('should throw an error if a pending subsidy already exists with same amount', () => {
    dsMockUtils.configureMocks({
      contextOptions: {
        isV7: false,
        getPendingSubsidies: [
          {
            allowance: new BigNumber(1000),
          } as SubsidyWithAllowance,
        ],
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proc = procedureMockUtils.getInstance<Params, any>(mockContext);

    return expect(
      prepareSubsidizeAccount.call(proc, { ...args, isV7Method: false })
    ).rejects.toThrow(
      'The Beneficiary Account already has a pending subsidy for acceptance with the same allowance'
    );
  });

  it('should return an approveSubsidy transaction spec when chain is v8', async () => {
    dsMockUtils.configureMocks({
      contextOptions: {
        isV7: false,
        getPendingSubsidies: [
          {
            allowance: new BigNumber(0),
          } as SubsidyWithAllowance,
        ],
      },
    });

    rawBeneficiaryAccount = dsMockUtils.createMockAccountId(address);
    rawAllowance = dsMockUtils.createMockBalance(allowance);

    when(stringToAccountIdSpy)
      .calledWith(address, mockContext)
      .mockReturnValue(rawBeneficiaryAccount);
    when(bigNumberToBalanceSpy).calledWith(allowance, mockContext).mockReturnValue(rawAllowance);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proc = procedureMockUtils.getInstance<Params, any>(mockContext);

    const approveSubsidyTransaction = dsMockUtils.createTxMock('relayer', 'approveSubsidy');

    const result = await prepareSubsidizeAccount.call(proc, {
      ...args,
      beneficiary,
      isV7Method: false,
    });

    expect(result).toEqual({
      transaction: approveSubsidyTransaction,
      args: [rawBeneficiaryAccount, rawAllowance],
      resolver: undefined,
    });
  });

  describe('subsidizeAccount', () => {
    it('should be instance of Procedure', () => {
      expect(subsidizeAccount()).toBeInstanceOf(Procedure);
    });
  });
});
