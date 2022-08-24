import { AccountId } from '@polkadot/types/interfaces';
import sinon from 'sinon';

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
  let stringToAccountIdStub: sinon.SinonStub<[string, Context], AccountId>;
  let args: QuitSubsidyParams;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    stringToAccountIdStub = sinon.stub(utilsConversionModule, 'stringToAccountId');
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
    const removePayingKeyTransaction = dsMockUtils.createTxStub('relayer', 'removePayingKey');

    const rawBeneficiaryAccountId = dsMockUtils.createMockAccountId('beneficiary');
    const rawSubsidizerAccountId = dsMockUtils.createMockAccountId('subsidizer');
    stringToAccountIdStub.withArgs('beneficiary', mockContext).returns(rawBeneficiaryAccountId);
    stringToAccountIdStub.withArgs('subsidizer', mockContext).returns(rawSubsidizerAccountId);

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

      mockContext.getSigningAccount.onSecondCall().returns(subsidizer);

      result = await boundFunc(args);
      expect(result).toEqual({
        roles: true,
        permissions: {
          transactions: [TxTags.relayer.RemovePayingKey],
        },
      });

      mockContext.getSigningAccount.onThirdCall().returns(beneficiary);

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
