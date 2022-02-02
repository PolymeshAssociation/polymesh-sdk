import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { AccountManagement } from '~/AccountManagement';
import { Account, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MockContext } from '~/testUtils/mocks/dataSources';
import { AccountBalance, PermissionType, SubCallback } from '~/types';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);
jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('AccountManagement class', () => {
  let context: MockContext;
  let accountManagement: AccountManagement;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    accountManagement = new AccountManagement(context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: removeSecondaryAccounts', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const accounts = [entityMockUtils.getAccountInstance({ address: 'someAccount' })];

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { accounts }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await accountManagement.removeSecondaryAccounts({ accounts });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: revokePermissions', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const account = entityMockUtils.getAccountInstance({ address: 'someAccount' });
      const secondaryAccounts = [
        {
          account,
          permissions: {
            tokens: { type: PermissionType.Include, values: [] },
            transactions: { type: PermissionType.Include, values: [] },
            portfolios: { type: PermissionType.Include, values: [] },
          },
        },
      ];

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { secondaryAccounts }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await accountManagement.revokePermissions({ secondaryAccounts: [account] });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: modifyPermissions', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const secondaryAccounts = [
        {
          account: entityMockUtils.getAccountInstance({ address: 'someAccount' }),
          permissions: { tokens: null, transactions: null, portfolios: null },
        },
      ];

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { secondaryAccounts }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await accountManagement.modifyPermissions({ secondaryAccounts });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: inviteAccount', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const args = {
        targetAccount: 'someAccount',
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await accountManagement.inviteAccount(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: freezeSecondaryAccounts', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const args = {
        freeze: true,
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await accountManagement.freezeSecondaryAccounts();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: unfreezeSecondaryAccounts', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const args = {
        freeze: false,
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await accountManagement.unfreezeSecondaryAccounts();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: subsidizeAccount', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const args = {
        beneficiaryAccount: 'someAccount',
        polyxLimit: new BigNumber(1000),
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await accountManagement.subsidizeAccount(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getAccount', () => {
    test('should return an Account object with the passed address', async () => {
      const params = { address: 'testAddress' };

      const result = accountManagement.getAccount(params);

      expect(result.address).toBe(params.address);
    });

    test('should return the current Account if no address is passed', async () => {
      const address = 'someAddress';
      dsMockUtils.configureMocks({ contextOptions: { currentPairAddress: address } });

      const result = accountManagement.getAccount();

      expect(result.address).toBe(address);
    });
  });

  describe('method: getAccountBalance', () => {
    const fakeBalance = {
      free: new BigNumber(100),
      locked: new BigNumber(0),
      total: new BigNumber(100),
    };
    test('should return the free and locked POLYX balance of the current Account', async () => {
      dsMockUtils.configureMocks({ contextOptions: { balance: fakeBalance } });

      const result = await accountManagement.getAccountBalance();
      expect(result).toEqual(fakeBalance);
    });

    test('should return the free and locked POLYX balance of the supplied account', async () => {
      entityMockUtils.configureMocks({ accountOptions: { getBalance: fakeBalance } });

      let result = await accountManagement.getAccountBalance({ account: 'someId' });
      expect(result).toEqual(fakeBalance);

      result = await accountManagement.getAccountBalance({
        account: new Account({ address: 'someId ' }, dsMockUtils.getContextInstance()),
      });
      expect(result).toEqual(fakeBalance);
    });

    test('should allow subscription (with and without a supplied account id)', async () => {
      const unsubCallback = 'unsubCallback';
      dsMockUtils.configureMocks({ contextOptions: { balance: fakeBalance } });
      entityMockUtils.configureMocks({ accountOptions: { getBalance: fakeBalance } });

      let accountBalanceStub = (
        dsMockUtils.getContextInstance().getCurrentAccount().getBalance as sinon.SinonStub
      ).resolves(unsubCallback);

      const callback = (() => 1 as unknown) as SubCallback<AccountBalance>;
      let result = await accountManagement.getAccountBalance(callback);
      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(accountBalanceStub, callback);

      accountBalanceStub = entityMockUtils.getAccountGetBalanceStub().resolves(unsubCallback);
      const account = 'someId';
      result = await accountManagement.getAccountBalance({ account }, callback);
      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(accountBalanceStub, callback);
    });
  });

  describe('method: getAccounts', () => {
    test('should return the list of signer accounts associated to the SDK', async () => {
      const accounts = [entityMockUtils.getAccountInstance()];
      dsMockUtils.configureMocks({
        contextOptions: {
          getAccounts: accounts,
        },
      });

      const result = accountManagement.getAccounts();

      expect(result).toEqual(accounts);
    });
  });
});
