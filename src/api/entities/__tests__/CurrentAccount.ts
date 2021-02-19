import sinon from 'sinon';

import { Account, Context, CurrentAccount, CurrentIdentity, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Permissions, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('CurrentAccount class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();

    sinon.stub(utilsConversionModule, 'addressToKey');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  test('should extend Account', () => {
    expect(CurrentAccount.prototype instanceof Account).toBe(true);
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
      const permissions = { tokens: [], transactions: [], transactionGroups: [], portfolios: [] };
      context = dsMockUtils.getContextInstance({
        secondaryKeys: [
          { signer: entityMockUtils.getAccountInstance({ address }), permissions },
          {
            signer: entityMockUtils.getAccountInstance({ address: 'otherAddress' }),
            permissions: {
              tokens: [],
              transactions: [TxTags.identity.AcceptAuthorization],
              transactionGroups: [],
              portfolios: [],
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
        tokens: [],
        transactions: [],
        transactionGroups: [],
        portfolios: [],
      };
      context = dsMockUtils.getContextInstance({
        secondaryKeys: [{ signer: entityMockUtils.getAccountInstance({ address }), permissions }],
      });

      account = new CurrentAccount({ address }, context);

      result = await account.hasPermissions({ tokens: [], portfolios: [], transactions: [] });

      expect(result).toEqual(true);

      result = await account.hasPermissions({ tokens: null, portfolios: null, transactions: null });

      expect(result).toEqual(false);

      const token = entityMockUtils.getSecurityTokenInstance({ ticker: 'SOME_TOKEN' });
      permissions = {
        tokens: [token],
        transactions: [TxTags.asset.CreateAsset],
        transactionGroups: [],
        portfolios: [entityMockUtils.getDefaultPortfolioInstance({ did: 'someDid' })],
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
