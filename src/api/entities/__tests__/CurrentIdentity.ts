import sinon from 'sinon';

import {
  Context,
  createVenue,
  CurrentIdentity,
  Identity,
  inviteAccount,
  modifySignerPermissions,
  removeSecondaryKeys,
  TransactionQueue,
  Venue,
} from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { SecondaryKey, SubCallback, VenueType } from '~/types';

describe('CurrentIdentity class', () => {
  let context: Context;
  let modifySignerPermissionsPrepareStub: sinon.SinonStub;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();

    modifySignerPermissionsPrepareStub = sinon.stub(modifySignerPermissions, 'prepare');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should extend Identity', () => {
    expect(CurrentIdentity.prototype instanceof Identity).toBe(true);
  });

  describe('method: getSecondaryKeys', () => {
    test('should return a list of Secondaries', async () => {
      const fakeResult = [
        {
          signer: entityMockUtils.getAccountInstance({ address: 'someAddress' }),
          permissions: {
            tokens: null,
            transactions: null,
            transactionGroups: [],
            portfolios: null,
          },
        },
      ];

      dsMockUtils.configureMocks({ contextOptions: { secondaryKeys: fakeResult } });

      const did = 'someDid';

      const identity = new CurrentIdentity({ did }, context);

      const result = await identity.getSecondaryKeys();
      expect(result).toEqual(fakeResult);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      const getSecondaryKeysStub = dsMockUtils
        .getContextInstance()
        .getSecondaryKeys.resolves(unsubCallback);

      const did = 'someDid';

      const identity = new CurrentIdentity({ did }, context);

      const callback = (() => [] as unknown) as SubCallback<SecondaryKey[]>;
      const result = await identity.getSecondaryKeys(callback);
      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(getSecondaryKeysStub, callback);
    });
  });

  describe('method: removeSecondaryKeys', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const did = 'someDid';
      const identity = new CurrentIdentity({ did }, context);

      const signers = [entityMockUtils.getAccountInstance({ address: 'someAccount' })];

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(removeSecondaryKeys, 'prepare')
        .withArgs({ args: { signers }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await identity.removeSecondaryKeys({ signers });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: revokePermissions', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const did = 'someDid';
      const identity = new CurrentIdentity({ did }, context);

      const signers = [entityMockUtils.getAccountInstance({ address: 'someAccount' })];
      const secondaryKeys = [
        {
          signer: signers[0],
          permissions: { tokens: [], transactions: [], portfolios: [] },
        },
      ];

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      modifySignerPermissionsPrepareStub
        .withArgs({ args: { secondaryKeys }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await identity.revokePermissions({ secondaryKeys: signers });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: modifyPermissions', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const did = 'someDid';
      const identity = new CurrentIdentity({ did }, context);

      const secondaryKeys = [
        {
          signer: entityMockUtils.getAccountInstance({ address: 'someAccount' }),
          permissions: { tokens: [], transactions: [], portfolios: [] },
        },
      ];

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      modifySignerPermissionsPrepareStub
        .withArgs({ args: { secondaryKeys }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await identity.modifyPermissions({ secondaryKeys });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: inviteAccount', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const did = 'someDid';
      const identity = new CurrentIdentity({ did }, context);

      const args = {
        targetAccount: 'someAccount',
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(inviteAccount, 'prepare')
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await identity.inviteAccount(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: createVenue', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const did = 'someDid';
      const identity = new CurrentIdentity({ did }, context);

      const args = {
        details: 'details',
        type: VenueType.Distribution,
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Venue>;

      sinon
        .stub(createVenue, 'prepare')
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await identity.createVenue(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
