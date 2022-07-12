import { AccountId } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { prepareRemoveSecondaryAccounts } from '~/api/procedures/removeSecondaryAccounts';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RemoveSecondaryAccountsParams, Signer, SignerType, SignerValue } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('removeSecondaryAccounts procedure', () => {
  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let signerToSignerValueStub: sinon.SinonStub<[Signer], SignerValue>;
  let stringToAccountIdStub: sinon.SinonStub<[string, Context], AccountId>;

  let args: RemoveSecondaryAccountsParams;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    signerToSignerValueStub = sinon.stub(utilsConversionModule, 'signerToSignerValue');
    stringToAccountIdStub = sinon.stub(utilsConversionModule, 'stringToAccountId');
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();

    const secondaryAccount = entityMockUtils.getAccountInstance({
      address: '',
    });
    secondaryAccount.isEqual.onFirstCall().returns(false).onSecondCall().returns(true);

    const accounts = [secondaryAccount];

    args = {
      accounts,
    };
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
    sinon.restore();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should add a remove secondary items transaction to the queue', async () => {
    const { accounts } = args;

    const rawAccountId = dsMockUtils.createMockAccountId(accounts[0].address);

    dsMockUtils.configureMocks({
      contextOptions: {
        secondaryAccounts: accounts.map(secondaryAccount => ({
          account: secondaryAccount,
          permissions: {
            assets: null,
            transactions: null,
            transactionGroups: [],
            portfolios: null,
          },
        })),
      },
    });

    stringToAccountIdStub.withArgs(accounts[0].address, mockContext).returns(rawAccountId);

    const proc = procedureMockUtils.getInstance<RemoveSecondaryAccountsParams, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('identity', 'removeSecondaryKeys');

    await prepareRemoveSecondaryAccounts.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      feeMultiplier: new BigNumber(1),
      args: [[rawAccountId]],
    });
  });

  it('should throw an error if attempting to remove the primary Account', () => {
    const proc = procedureMockUtils.getInstance<RemoveSecondaryAccountsParams, void>(mockContext);
    const account = entityMockUtils.getAccountInstance({ address: 'primaryAccount' });

    return expect(
      prepareRemoveSecondaryAccounts.call(proc, {
        ...args,
        accounts: [account],
      })
    ).rejects.toThrow('You cannot remove the primary Account');
  });

  it('should throw an error if at least one of the secondary Accounts to remove is not present in the secondary Accounts list', () => {
    const { accounts } = args;
    const signerValue = { type: SignerType.Account, value: accounts[0].address };

    signerToSignerValueStub.withArgs(accounts[0]).returns(signerValue);

    const proc = procedureMockUtils.getInstance<RemoveSecondaryAccountsParams, void>(mockContext);

    return expect(
      prepareRemoveSecondaryAccounts.call(proc, {
        ...args,
      })
    ).rejects.toThrow('One of the Accounts is not a secondary Account for the Identity');
  });
});
