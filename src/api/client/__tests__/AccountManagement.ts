import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { AccountManagement } from '~/api/client/AccountManagement';
import { Account, MultiSig, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MockContext } from '~/testUtils/mocks/dataSources';
import { AccountBalance, PermissionType, SubCallback } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

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
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: undefined, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await accountManagement.leaveIdentity();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: removeSecondaryAccounts', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const args = {
        beneficiary: 'someAccount',
        allowance: new BigNumber(1000),
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
    it('should return an Account object with the passed address', async () => {
      const params = { address: 'testAddress' };
      dsMockUtils.createQueryStub('multiSig', 'multiSigSigners', {
        returnValue: [],
      });

      const result = await accountManagement.getAccount(params);

      expect(result).toBeInstanceOf(Account);
      expect(result.address).toBe(params.address);
    });

    it('should return a MultiSig instance if the address is for a MultiSig', async () => {
      const params = { address: 'testAddress' };
      dsMockUtils.createQueryStub('multiSig', 'multiSigSigners', {
        entries: [[['someSignerAddress'], 'someSignerAddress']],
      });

      const result = await accountManagement.getAccount(params);

      expect(result).toBeInstanceOf(MultiSig);
      expect(result.address).toBe(params.address);
    });
  });

  describe('method: getSigningAccount', () => {
    const stringToAccountIdStub = sinon.stub(utilsConversionModule, 'stringToAccountId');
    it('should return the signing Account', async () => {
      const address = 'someAddress';
      const rawAddress = dsMockUtils.createMockAccountId(address);
      stringToAccountIdStub.withArgs(address, context).returns(rawAddress);
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

  describe('method: createMultiSigAccount', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const args = {
        signers: [entityMockUtils.getAccountInstance()],
        requiredSignatures: new BigNumber(1),
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await accountManagement.createMultiSigAccount(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
