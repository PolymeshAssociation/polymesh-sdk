import sinon from 'sinon';

import { CurrentIdentity, Identity } from '~/api/entities';
import { inviteAccount, removeSigningKeys } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { SigningKey, SubCallback } from '~/types';

describe('CurrentIdentity class', () => {
  let context: Context;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
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

  describe('method: getSigningKeys', () => {
    test('should return a list of Signers', async () => {
      const fakeResult = [
        {
          signer: entityMockUtils.getAccountInstance({ address: 'someAddress' }),
          permissions: [],
        },
      ];

      dsMockUtils.configureMocks({ contextOptions: { signingKeys: fakeResult } });

      const did = 'someDid';

      const identity = new CurrentIdentity({ did }, context);

      const result = await identity.getSigningKeys();
      expect(result).toEqual(fakeResult);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      const getSigningKeysStub = dsMockUtils
        .getContextInstance()
        .getSigningKeys.resolves(unsubCallback);

      const did = 'someDid';

      const identity = new CurrentIdentity({ did }, context);

      const callback = (() => [] as unknown) as SubCallback<SigningKey[]>;
      const result = await identity.getSigningKeys(callback);
      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(getSigningKeysStub, callback);
    });
  });

  describe('method: removeSigningKeys', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const did = 'someDid';
      const identity = new CurrentIdentity({ did }, context);

      const signers = [entityMockUtils.getAccountInstance({ address: 'someAccount' })];

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(removeSigningKeys, 'prepare')
        .withArgs({ signers }, context)
        .resolves(expectedQueue);

      const queue = await identity.removeSigningKeys({ signers });

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
        .withArgs(args, context)
        .resolves(expectedQueue);

      const queue = await identity.inviteAccount(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
