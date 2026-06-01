import { AccountId } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { prepareRevokeSubsidy, revokeSubsidy } from '~/api/procedures/revokeSubsidy';
import { Account, Context, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RevokeSubsidyParams, SubsidyWithAllowance } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('revokeSubsidy procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToAccountIdSpy: jest.SpyInstance<AccountId, [string, Context]>;
  let args: RevokeSubsidyParams;
  const beneficiaryAddress = 'beneficiary';
  let rawBeneficiaryAccount: AccountId;
  let actingAccount: Account;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    actingAccount = entityMockUtils.getAccountInstance({ address: 'actingAccount' });
    mockContext.getActingAccount.mockResolvedValue(actingAccount);

    args = { beneficiary: beneficiaryAddress };

    rawBeneficiaryAccount = dsMockUtils.createMockAccountId(beneficiaryAddress);

    when(stringToAccountIdSpy)
      .calledWith(beneficiaryAddress, mockContext)
      .mockReturnValue(rawBeneficiaryAccount);
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

  it('should throw NotSupported when chain is v7', () => {
    dsMockUtils.configureMocks({
      contextOptions: {
        isV7: true,
      },
    });

    const proc = procedureMockUtils.getInstance<RevokeSubsidyParams, void>(mockContext);

    return expect(prepareRevokeSubsidy.call(proc, args)).rejects.toThrow(
      'This method is not supported for chain 7.x.'
    );
  });

  it('should throw an error if no pending subsidy exists', () => {
    dsMockUtils.configureMocks({
      contextOptions: {
        isV7: false,
        getPendingSubsidies: [],
      },
    });

    const proc = procedureMockUtils.getInstance<RevokeSubsidyParams, void>(mockContext);

    return expect(prepareRevokeSubsidy.call(proc, args)).rejects.toThrow(
      'There is no pending subsidy to revoke'
    );
  });

  it('should return a revokeSubsidy transaction spec when chain is v8 and subsidy is pending', async () => {
    dsMockUtils.configureMocks({
      contextOptions: {
        isV7: false,
        getPendingSubsidies: [
          {
            allowance: new BigNumber(100),
          } as SubsidyWithAllowance,
        ],
      },
    });

    const proc = procedureMockUtils.getInstance<RevokeSubsidyParams, void>(mockContext);

    const revokeSubsidyTransaction = dsMockUtils.createTxMock('relayer', 'revokeSubsidy');

    const result = await prepareRevokeSubsidy.call(proc, args);

    expect(result).toEqual({
      transaction: revokeSubsidyTransaction,
      args: [rawBeneficiaryAccount],
      resolver: undefined,
    });
  });

  describe('revokeSubsidy', () => {
    it('should be instance of Procedure', () => {
      expect(revokeSubsidy()).toBeInstanceOf(Procedure);
    });
  });
});
