import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { AccountManagement } from '~/api/client/AccountManagement';
import { Account, PolymeshTransaction } from '~/internal';
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
    procedureMockUtils.cleanup();
  });

  describe('method: leaveIdentity', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: undefined, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await accountManagement.leaveIdentity();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: removeSecondaryAccounts', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const accounts = [entityMockUtils.getAccountInstance({ address: 'someAccount' })];

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { accounts }, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await accountManagement.removeSecondaryAccounts({ accounts });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: revokePermissions', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
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

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { secondaryAccounts }, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await accountManagement.revokePermissions({ secondaryAccounts: [account] });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: modifyPermissions', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const secondaryAccounts = [
        {
          account: entityMockUtils.getAccountInstance({ address: 'someAccount' }),
          permissions: { tokens: null, transactions: null, portfolios: null },
        },
      ];

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { secondaryAccounts }, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await accountManagement.modifyPermissions({ secondaryAccounts });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: inviteAccount', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        targetAccount: 'someAccount',
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await accountManagement.inviteAccount(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: freezeSecondaryAccounts', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        freeze: true,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await accountManagement.freezeSecondaryAccounts();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: unfreezeSecondaryAccounts', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        freeze: false,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await accountManagement.unfreezeSecondaryAccounts();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: subsidizeAccount', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        beneficiary: 'someAccount',
        allowance: new BigNumber(1000),
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await accountManagement.subsidizeAccount(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getAccount', () => {
    it('should return an Account object with the passed address', async () => {
      const params = { address: 'testAddress' };

      const result = accountManagement.getAccount(params);

      expect(result.address).toBe(params.address);
    });
  });

  describe('method: getSigningAccount', () => {
    it('should return the signing Account', async () => {
      const address = 'someAddress';
      dsMockUtils.configureMocks({ contextOptions: { signingAddress: address } });

      const result = accountManagement.getSigningAccount();

      expect(result && result.address).toBe(address);
    });

    it('should return null if there is no set signing Account', async () => {
      context.getSigningAccount.throws('err');

      const result = accountManagement.getSigningAccount();

      expect(result).toBeNull();
    });
  });

  describe('method: getAccountBalance', () => {
    const fakeBalance = {
      free: new BigNumber(100),
      locked: new BigNumber(0),
      total: new BigNumber(100),
    };
    it('should return the free and locked POLYX balance of the signing Account', async () => {
      dsMockUtils.configureMocks({ contextOptions: { balance: fakeBalance } });

      const result = await accountManagement.getAccountBalance();
      expect(result).toEqual(fakeBalance);
    });

    it('should return the free and locked POLYX balance of the supplied Account', async () => {
      entityMockUtils.configureMocks({ accountOptions: { getBalance: fakeBalance } });

      let result = await accountManagement.getAccountBalance({ account: 'someId' });
      expect(result).toEqual(fakeBalance);

      result = await accountManagement.getAccountBalance({
        account: new Account({ address: 'someId ' }, dsMockUtils.getContextInstance()),
      });
      expect(result).toEqual(fakeBalance);
    });

    it('should allow subscription (with and without a supplied Account id)', async () => {
      const unsubCallback = 'unsubCallback';
      dsMockUtils.configureMocks({ contextOptions: { balance: fakeBalance } });
      entityMockUtils.configureMocks({ accountOptions: { getBalance: fakeBalance } });

      let accountBalanceStub = (
        dsMockUtils.getContextInstance().getSigningAccount().getBalance as sinon.SinonStub
      ).resolves(unsubCallback);

      const callback = (() => 1 as unknown) as SubCallback<AccountBalance>;
      let result = await accountManagement.getAccountBalance(callback);
      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(accountBalanceStub, callback);

      accountBalanceStub = sinon.stub().resolves(unsubCallback);
      entityMockUtils.configureMocks({
        accountOptions: {
          getBalance: accountBalanceStub,
        },
      });
      const account = 'someId';
      result = await accountManagement.getAccountBalance({ account }, callback);
      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(accountBalanceStub, callback);
    });
  });

  describe('method: getSigningAccounts', () => {
    it('should return the list of signer Accounts associated to the SDK', async () => {
      const accounts = [entityMockUtils.getAccountInstance()];
      dsMockUtils.configureMocks({
        contextOptions: {
          getSigningAccounts: accounts,
        },
      });

      const result = await accountManagement.getSigningAccounts();

      expect(result).toEqual(accounts);
    });
  });
});
