import { Signatory } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  prepareRemoveSecondaryKeys,
  RemoveSecondaryKeysParams,
} from '~/api/procedures/removeSecondaryKeys';
import { Account, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PermissionedAccount, Signer, SignerType, SignerValue } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('removeSecondaryKeys procedure', () => {
  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let signerValueToSignatoryStub: sinon.SinonStub<[SignerValue, Context], Signatory>;
  let signerToSignerValueStub: sinon.SinonStub<[Signer], SignerValue>;

  let args: RemoveSecondaryKeysParams;
  let primaryKey: PermissionedAccount;
  let primaryKeyAccount: Account;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    signerValueToSignatoryStub = sinon.stub(utilsConversionModule, 'signerValueToSignatory');
    signerToSignerValueStub = sinon.stub(utilsConversionModule, 'signerToSignerValue');
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();

    primaryKeyAccount = entityMockUtils.getAccountInstance({ address: 'primaryKey' });

    console.log('here');
    console.log(primaryKeyAccount);
    primaryKey = {
      account: primaryKeyAccount,
      permissions: {
        tokens: null,
        transactions: null,
        transactionGroups: [],
        portfolios: null,
      },
    };

    const accounts = [entityMockUtils.getAccountInstance({ address: 'someFakeAccount' })];

    args = {
      accounts,
    };
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

  test('should add a remove secondary items transaction to the queue', async () => {
    const { accounts } = args;
    const signerValue = { type: SignerType.Account, value: accounts[0].address };

    const rawSignatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId(accounts[0].address),
    });

    dsMockUtils.configureMocks({
      contextOptions: {
        primaryKey,
        secondaryKeys: accounts.map(account => ({
          account,
          permissions: {
            tokens: null,
            transactions: null,
            transactionGroups: [],
            portfolios: null,
          },
        })),
      },
    });

    signerToSignerValueStub.withArgs(accounts[0]).returns(signerValue);
    signerValueToSignatoryStub.withArgs(signerValue, mockContext).returns(rawSignatory);

    const proc = procedureMockUtils.getInstance<RemoveSecondaryKeysParams, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('identity', 'removeSecondaryKeys');

    await prepareRemoveSecondaryKeys.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, transaction, {}, [rawSignatory]);
  });

  test('should throw an error if attempting to remove the primary key', () => {
    const proc = procedureMockUtils.getInstance<RemoveSecondaryKeysParams, void>(mockContext);

    return expect(
      prepareRemoveSecondaryKeys.call(proc, {
        ...args,
        accounts: [primaryKeyAccount],
        identity: entityMockUtils.getIdentityInstance({
          getPrimaryKey: primaryKey,
          getSecondaryKeys: [],
        }),
      })
    ).rejects.toThrow('You cannot remove the primary key');
  });

  test('should throw an error if at least one of the secondary keys to remove is not present in the secondary keys list', () => {
    const { accounts: signers } = args;
    const signerValue = { type: SignerType.Account, value: (signers[0] as Account).address };

    signerToSignerValueStub.withArgs(signers[0]).returns(signerValue);

    const proc = procedureMockUtils.getInstance<RemoveSecondaryKeysParams, void>(mockContext);

    return expect(
      prepareRemoveSecondaryKeys.call(proc, {
        ...args,
        identity: entityMockUtils.getIdentityInstance({
          getPrimaryKey: primaryKey,
          getSecondaryKeys: [],
        }),
      })
    ).rejects.toThrow('One of the Signers is not a Secondary Key for the Identity');
  });
});
