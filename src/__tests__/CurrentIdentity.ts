import { CurrentIdentity } from '~/CurrentIdentity';
import { TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MockContext } from '~/testUtils/mocks/dataSources';
import { PermissionType } from '~/types';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('CurrentIdentity class', () => {
  let context: MockContext;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
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

  describe('method: removeSecondaryKeys', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const currentIdentity = new CurrentIdentity(context);

      const accounts = [entityMockUtils.getAccountInstance({ address: 'someAccount' })];

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { accounts }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await currentIdentity.removeSecondaryKeys({ accounts });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: revokePermissions', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const currentIdentity = new CurrentIdentity(context);

      const accounts = [entityMockUtils.getAccountInstance({ address: 'someAccount' })];
      const secondaryKeys = [
        {
          account: accounts[0],
          permissions: {
            tokens: { type: PermissionType.Include, values: [] },
            transactions: { type: PermissionType.Include, values: [] },
            portfolios: { type: PermissionType.Include, values: [] },
          },
        },
      ];

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { secondaryKeys }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await currentIdentity.revokePermissions({ secondaryKeys: accounts });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: modifyPermissions', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const currentIdentity = new CurrentIdentity(context);

      const secondaryKeys = [
        {
          account: entityMockUtils.getAccountInstance({ address: 'someAccount' }),
          permissions: { tokens: null, transactions: null, portfolios: null },
        },
      ];

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { secondaryKeys }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await currentIdentity.modifyPermissions({ secondaryKeys });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: inviteAccount', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const currentIdentity = new CurrentIdentity(context);

      const args = {
        targetAccount: 'someAccount',
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await currentIdentity.inviteAccount(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: freezeSecondaryKeys', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const currentIdentity = new CurrentIdentity(context);

      const args = {
        freeze: true,
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await currentIdentity.freezeSecondaryKeys();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: unfreezeSecondaryKeys', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const currentIdentity = new CurrentIdentity(context);

      const args = {
        freeze: false,
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await currentIdentity.unfreezeSecondaryKeys();

      expect(queue).toBe(expectedQueue);
    });
  });
});
