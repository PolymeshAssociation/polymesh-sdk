import sinon from 'sinon';

import { Account, Context, CurrentAccount, CurrentIdentity, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { TxTags } from '~/types';
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

      const account = new CurrentAccount({ address: 'someAddress' }, context);

      const result = await account.getPermissions();

      expect(result).toEqual({
        tokens: null,
        transactions: null,
        portfolios: null,
      });
    });

    test("should return the account's permissions if it is a secondary key", async () => {
      const address = 'someAddress';
      const permissions = { tokens: [], transactions: [], portfolios: [] };
      context = dsMockUtils.getContextInstance({
        secondaryKeys: [
          { signer: entityMockUtils.getAccountInstance({ address }), permissions },
          {
            signer: entityMockUtils.getAccountInstance({ address: 'otherAddress' }),
            permissions: {
              tokens: [],
              transactions: [TxTags.identity.AcceptAuthorization],
              portfolios: [],
            },
          },
        ],
      });

      const account = new CurrentAccount({ address: 'someAddress' }, context);

      const result = await account.getPermissions();

      expect(result).toEqual(permissions);
    });
  });
});
