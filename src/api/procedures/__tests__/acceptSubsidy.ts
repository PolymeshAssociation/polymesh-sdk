import { AccountId } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { acceptSubsidy, prepareAcceptSubsidy } from '~/api/procedures/acceptSubsidy';
import { Account, Context, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AcceptSubsidyParams, SubsidyWithAllowance } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('acceptSubsidy procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToAccountIdSpy: jest.SpyInstance<AccountId, [string, Context]>;
  let args: AcceptSubsidyParams;
  const subsidizerAddress = 'subsidizer';
  let rawSubsidizerAccount: AccountId;
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

    args = { subsidizer: subsidizerAddress };

    rawSubsidizerAccount = dsMockUtils.createMockAccountId(subsidizerAddress);

    when(stringToAccountIdSpy)
      .calledWith(subsidizerAddress, mockContext)
      .mockReturnValue(rawSubsidizerAccount);
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

    const proc = procedureMockUtils.getInstance<AcceptSubsidyParams, void>(mockContext);

    return expect(prepareAcceptSubsidy.call(proc, args)).rejects.toThrow(
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

    const proc = procedureMockUtils.getInstance<AcceptSubsidyParams, void>(mockContext);

    return expect(prepareAcceptSubsidy.call(proc, args)).rejects.toThrow(
      'There is no pending subsidy to accept'
    );
  });

  it('should return an acceptSubsidy transaction spec when chain is v8 and subsidy is pending', async () => {
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

    const proc = procedureMockUtils.getInstance<AcceptSubsidyParams, void>(mockContext);

    const acceptSubsidyTransaction = dsMockUtils.createTxMock('relayer', 'acceptSubsidy');

    const result = await prepareAcceptSubsidy.call(proc, args);

    expect(result).toEqual({
      transaction: acceptSubsidyTransaction,
      args: [rawSubsidizerAccount],
      resolver: undefined,
    });
  });

  describe('acceptSubsidy', () => {
    it('should be instance of Procedure', () => {
      expect(acceptSubsidy()).toBeInstanceOf(Procedure);
    });
  });
});
