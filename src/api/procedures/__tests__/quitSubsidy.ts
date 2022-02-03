import { AccountId } from '@polkadot/types/interfaces';
import sinon from 'sinon';

import { prepareQuitSubsidy } from '~/api/procedures/quitSubsidy';
import { Account, Context, QuitSubsidyParams, Subsidy } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('quitSubsidy procedure', () => {
  let mockContext: Mocked<Context>;
  let beneficiary: Account;
  let subsidizer: Account;
  let subsidy: Subsidy;
  let stringToAccountIdStub: sinon.SinonStub<[string, Context], AccountId>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    stringToAccountIdStub = sinon.stub(utilsConversionModule, 'stringToAccountId');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    // to be replaced by entity mock util instance
    subsidy = new Subsidy(
      { beneficiaryAddress: 'beneficiary', subsidizerAddress: 'subsidizer' },
      mockContext
    );
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

  test('should throw an error if the Account is neither the beneficiary nor the subsidizer', async () => {
    const proc = procedureMockUtils.getInstance<QuitSubsidyParams, void>(mockContext);

    let error;

    try {
      await prepareQuitSubsidy.call(proc, { subsidy });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      'Only the subsidizer and the beneficiary are allowed to quit a Subsidy'
    );
  });

  test('should throw an error if the Subsidy does not exist', async () => {
    const proc = procedureMockUtils.getInstance<QuitSubsidyParams, void>(mockContext);
    // entityMockUtils.getSubsidyExistsStub().resolves(false);

    let error;

    try {
      await prepareQuitSubsidy.call(proc, { subsidy });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The Subsidy no longer exists');
  });

  test('should add a transaction to the queue', async () => {
    const addTransactionStub = procedureMockUtils.getAddTransactionStub();
    const removePayingKeyTransaction = dsMockUtils.createTxStub('relayer', 'removePayingKey');

    const rawBeneficiaryAccountId = dsMockUtils.createMockAccountId('beneficiary');
    const rawSubsidizerAccountId = dsMockUtils.createMockAccountId('subsidizer');
    stringToAccountIdStub.withArgs('beneficiary', mockContext).returns(rawBeneficiaryAccountId);
    stringToAccountIdStub.withArgs('subsidizer', mockContext).returns(rawSubsidizerAccountId);

    const proc = procedureMockUtils.getInstance<QuitSubsidyParams, void>(mockContext);

    mockContext.getCurrentAccount.onFirstCall().returns(beneficiary);

    await prepareQuitSubsidy.call(proc, { subsidy });

    sinon.assert.calledWith(addTransactionStub, {
      transaction: removePayingKeyTransaction,
      args: [rawBeneficiaryAccountId, rawSubsidizerAccountId],
    });

    mockContext.getCurrentAccount.onSecondCall().returns(subsidizer);

    await prepareQuitSubsidy.call(proc, { subsidy });

    sinon.assert.calledWith(addTransactionStub, {
      transaction: removePayingKeyTransaction,
      args: [rawBeneficiaryAccountId, rawSubsidizerAccountId],
    });
  });
});
