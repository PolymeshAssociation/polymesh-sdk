import sinon from 'sinon';

import {
  Account,
  Context,
  CurrentAccount,
  CurrentIdentity,
  Identity,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Permissions, PermissionType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('CurrentAccount class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();

    sinon.stub(utilsConversionModule, 'addressToKey');
    sinon.stub(utilsInternalModule, 'assertFormatValid');
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

  test('should extend Account', () => {
    expect(CurrentAccount.prototype instanceof Account).toBe(true);
  });

  describe('method: leaveIdentity', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const account = new CurrentAccount({ address: 'someAddress' }, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      const args = {
        account,
      };

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await account.leaveIdentity();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getIdentity', () => {
    test('should return the current Identity', async () => {
      const did = 'someDid';
      sinon.stub(Account.prototype, 'getIdentity').resolves(new Identity({ did }, context));

      const account = new CurrentAccount({ address: 'someAddress' }, context);

      const result = await account.getIdentity();

      expect(result instanceof CurrentIdentity).toBe(true);
      expect(result?.did).toBe(did);
    });
  });

  describe('method: getPermissions', () => {
    test('should return full permissions if the account is the primary key', async () => {
      const address = 'someAddress';

      context = dsMockUtils.getContextInstance({ primaryKey: address });

      const account = new CurrentAccount({ address }, context);

      const result = await account.getPermissions();

      expect(result).toEqual({
        tokens: null,
        transactions: null,
        transactionGroups: [],
        portfolios: null,
      });
    });

    test("should return the account's permissions if it is a secondary key", async () => {
      const address = 'someAddress';
      const permissions = {
        tokens: null,
        transactions: null,
        transactionGroups: [],
        portfolios: null,
      };
      context = dsMockUtils.getContextInstance({
        secondaryKeys: [
          { signer: entityMockUtils.getAccountInstance({ address }), permissions },
          {
            signer: entityMockUtils.getAccountInstance({ address: 'otherAddress' }),
            permissions: {
              tokens: null,
              transactions: {
                values: [TxTags.identity.AcceptAuthorization],
                type: PermissionType.Include,
              },
              transactionGroups: [],
              portfolios: null,
            },
          },
        ],
      });

      const account = new CurrentAccount({ address }, context);

      const result = await account.getPermissions();

      expect(result).toEqual(permissions);
    });
  });

  describe('method: hasPermissions', () => {
    test('should return whether the Account has the passed permissions', async () => {
      const address = 'someAddress';

      context = dsMockUtils.getContextInstance({ primaryKey: address });

      let account = new CurrentAccount({ address }, context);

      let result = await account.hasPermissions({ tokens: [], portfolios: [], transactions: [] });

      expect(result).toEqual(true);

      let permissions: Permissions = {
        tokens: null,
        transactions: null,
        transactionGroups: [],
        portfolios: null,
      };
      context = dsMockUtils.getContextInstance({
        secondaryKeys: [{ signer: entityMockUtils.getAccountInstance({ address }), permissions }],
      });

      account = new CurrentAccount({ address }, context);

      result = await account.hasPermissions({ tokens: null, portfolios: null, transactions: null });
      expect(result).toEqual(true);

      const token = entityMockUtils.getSecurityTokenInstance({ ticker: 'SOME_TOKEN' });
      permissions = {
        tokens: { values: [token], type: PermissionType.Include },
        transactions: { values: [TxTags.asset.CreateAsset], type: PermissionType.Include },
        transactionGroups: [],
        portfolios: {
          values: [entityMockUtils.getDefaultPortfolioInstance({ did: 'someDid' })],
          type: PermissionType.Include,
        },
      };
      context = dsMockUtils.getContextInstance({
        secondaryKeys: [{ signer: entityMockUtils.getAccountInstance({ address }), permissions }],
      });

      account = new CurrentAccount({ address }, context);

      result = await account.hasPermissions({
        tokens: [token],
        portfolios: [entityMockUtils.getDefaultPortfolioInstance({ did: 'otherDid' })],
        transactions: [TxTags.asset.CreateAsset],
      });

      expect(result).toEqual(false);

      permissions = {
        tokens: { values: [token], type: PermissionType.Exclude },
        transactions: { values: [TxTags.asset.CreateAsset], type: PermissionType.Exclude },
        transactionGroups: [],
        portfolios: {
          values: [entityMockUtils.getDefaultPortfolioInstance({ did: 'someDid' })],
          type: PermissionType.Exclude,
        },
      };
      context = dsMockUtils.getContextInstance({
        secondaryKeys: [{ signer: entityMockUtils.getAccountInstance({ address }), permissions }],
      });

      account = new CurrentAccount({ address }, context);

      result = await account.hasPermissions({
        tokens: [token],
        portfolios: null,
        transactions: null,
      });

      expect(result).toEqual(false);

      result = await account.hasPermissions({
        tokens: null,
        portfolios: [],
        transactions: [TxTags.asset.CreateAsset],
      });

      expect(result).toEqual(false);

      result = await account.hasPermissions({
        tokens: [],
        portfolios: [entityMockUtils.getDefaultPortfolioInstance({ did: 'otherDid' })],
        transactions: [],
      });

      expect(result).toEqual(true);

      result = await account.hasPermissions({});

      expect(result).toEqual(true);
    });

    test('should exempt certain transactions from requiring permissions', async () => {
      const address = 'someAddress';

      context = dsMockUtils.getContextInstance({ primaryKey: address });

      const account = new CurrentAccount({ address }, context);

      const result = await account.hasPermissions({
        tokens: [],
        portfolios: [],
        transactions: [
          TxTags.balances.Transfer,
          TxTags.balances.TransferWithMemo,
          TxTags.staking.AddPermissionedValidator,
          TxTags.sudo.SetKey,
          TxTags.session.PurgeKeys,
        ],
      });

      expect(result).toEqual(true);
    });
  });
});
