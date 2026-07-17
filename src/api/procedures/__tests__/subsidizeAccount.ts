import { AccountId, Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  Params,
  prepareSubsidizeAccount,
  subsidizeAccount,
} from '~/api/procedures/subsidizeAccount';
import { Account, Context, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { SubsidyWithAllowance } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('subsidizeAccount procedure', () => {
  let mockContext: Mocked<Context>;

  let stringToAccountIdSpy: jest.SpyInstance<AccountId, [string, Context]>;
  let bigNumberToBalanceSpy: jest.SpyInstance<Balance, [BigNumber, Context, boolean?]>;

  let args: Params;
  const address = 'beneficiary';
  const allowance = new BigNumber(1000);
  let beneficiary: Account;
  let rawBeneficiaryAccount: AccountId;
  let rawAllowance: Balance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    // @ts-expect-error - mock
    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    args = { beneficiary: address, allowance };
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

  it('should throw an error if a pending subsidy already exists with same amount', () => {
    dsMockUtils.configureMocks({
      contextOptions: {
        getPendingSubsidies: [
          {
            allowance: new BigNumber(1000),
          } as SubsidyWithAllowance,
        ],
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proc = procedureMockUtils.getInstance<Params, any>(mockContext);

    return expect(prepareSubsidizeAccount.call(proc, args)).rejects.toThrow(
      'The Beneficiary Account already has a pending subsidy for acceptance with the same allowance'
    );
  });

  it('should return an approveSubsidy transaction spec', async () => {
    dsMockUtils.configureMocks({
      contextOptions: {
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
