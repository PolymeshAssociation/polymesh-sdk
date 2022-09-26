import { AccountId } from '@polkadot/types/interfaces';
import { when } from 'jest-when';

import { getAuthorization, prepareQuitSubsidy } from '~/api/procedures/quitSubsidy';
import { Account, Context, QuitSubsidyParams, Subsidy } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Subsidy',
  require('~/testUtils/mocks/entities').mockSubsidyModule('~/api/entities/Subsidy')
);

describe('quitSubsidy procedure', () => {
  let mockContext: Mocked<Context>;
  let beneficiary: Account;
  let subsidizer: Account;
  let subsidy: Subsidy;
  let stringToAccountIdSpy: jest.SpyInstance<AccountId, [string, Context]>;
  let args: QuitSubsidyParams;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    subsidy = entityMockUtils.getSubsidyInstance();

    subsidizer = entityMockUtils.getAccountInstance({ address: 'subsidizer' });
    beneficiary = entityMockUtils.getAccountInstance({ address: 'beneficiary' });

    args = { subsidy };
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

  it('should throw an error if the Subsidy does not exist', async () => {
    const proc = procedureMockUtils.getInstance<QuitSubsidyParams, void>(mockContext);

    let error;

    try {
      await prepareQuitSubsidy.call(proc, {
        subsidy: entityMockUtils.getSubsidyInstance({ exists: false }),
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The Subsidy no longer exists');
  });

  it('should return a transaction spec', async () => {
    const removePayingKeyTransaction = dsMockUtils.createTxMock('relayer', 'removePayingKey');

    const rawBeneficiaryAccountId = dsMockUtils.createMockAccountId('beneficiary');
    const rawSubsidizerAccountId = dsMockUtils.createMockAccountId('subsidizer');
    when(stringToAccountIdSpy)
      .calledWith('beneficiary', mockContext)
      .mockReturnValue(rawBeneficiaryAccountId);
    when(stringToAccountIdSpy)
      .calledWith('subsidizer', mockContext)
      .mockReturnValue(rawSubsidizerAccountId);

    const proc = procedureMockUtils.getInstance<QuitSubsidyParams, void>(mockContext);

    const result = await prepareQuitSubsidy.call(proc, args);

    expect(result).toEqual({
      transaction: removePayingKeyTransaction,
      args: [rawBeneficiaryAccountId, rawSubsidizerAccountId],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      const proc = procedureMockUtils.getInstance<QuitSubsidyParams, void>(mockContext);

      const boundFunc = getAuthorization.bind(proc);

      let result = await boundFunc(args);
      expect(result).toEqual({
        roles: 'Only the subsidizer or the beneficiary are allowed to quit a Subsidy',
        permissions: {
          transactions: [TxTags.relayer.RemovePayingKey],
        },
      });

      mockContext.getSigningAccount.mockReturnValue(subsidizer);

      result = await boundFunc(args);
      expect(result).toEqual({
        roles: true,
        permissions: {
          transactions: [TxTags.relayer.RemovePayingKey],
        },
      });

      mockContext.getSigningAccount.mockReturnValue(beneficiary);

      result = await boundFunc(args);
      expect(result).toEqual({
        roles: true,
        permissions: {
          transactions: [TxTags.relayer.RemovePayingKey],
        },
      });
    });
  });
});
