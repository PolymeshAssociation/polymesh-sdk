import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Account, Entity } from '~/api/entities';
import { Context } from '~/base';
import { heartbeat, transactions } from '~/middleware/queries';
import { CallIdEnum, ExtrinsicResult, ModuleIdEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AccountBalance, TxTags } from '~/types';
import * as utilsModule from '~/utils';

describe('Account class', () => {
  let context: Mocked<Context>;

  let address: string;
  let key: string;
  let account: Account;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();

    address = 'someAddress';
    key = 'someKey';

    sinon
      .stub(utilsModule, 'addressToKey')
      .withArgs(address)
      .returns(key);
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    account = new Account({ address }, context);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
    sinon.restore();
  });

  test('should extend Entity', () => {
    expect(Account.prototype instanceof Entity).toBe(true);
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(Account.isUniqueIdentifiers({ address: 'someAdddress' })).toBe(true);
      expect(Account.isUniqueIdentifiers({})).toBe(false);
      expect(Account.isUniqueIdentifiers({ address: 3 })).toBe(false);
    });
  });

  describe('method: getBalance', () => {
    let fakeResult: AccountBalance;

    beforeAll(() => {
      fakeResult = {
        free: new BigNumber(100),
        locked: new BigNumber(10),
      };
    });

    beforeEach(() => {
      context = dsMockUtils.getContextInstance({ balance: fakeResult });
      account = new Account({ address }, context);
    });

    test("should return the account's balance", async () => {
      const result = await account.getBalance();

      expect(result).toEqual(fakeResult);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';
      const callback = sinon.stub();

      context.accountBalance.callsFake(async (_, cbFunc) => {
        cbFunc(fakeResult);
        return unsubCallback;
      });

      const result = await account.getBalance(callback);

      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(callback, fakeResult);
    });
  });

  describe('method: getIdentity', () => {
    test('should return the Identity associated to the Account', async () => {
      const did = 'someDid';
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId(did),
          })
        ),
      });

      const result = await account.getIdentity();
      expect(result.did).toBe(did);
    });

    test('should throw an error if there is no Identity associated to the Account', () => {
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds').throws();

      return expect(account.getIdentity()).rejects.toThrow(
        'The current account does not have an associated Identity'
      );
    });
  });

  describe('method: getTransactionHistory', () => {
    test('should return a list of transactions', async () => {
      const tag = TxTags.identity.CddRegisterDid;
      const moduleId = ModuleIdEnum.Identity;
      const callId = CallIdEnum.CddRegisterDid;

      sinon
        .stub(utilsModule, 'txTagToExtrinsicIdentifier')
        .withArgs(tag)
        .returns({
          moduleId,
          callId,
        });

      /* eslint-disable @typescript-eslint/camelcase */
      const transactionsQueryResponse: ExtrinsicResult = {
        totalCount: 20,
        items: [
          {
            block_id: 1,
            address: address,
            success: 0,
          },
          {
            block_id: 2,
            success: 1,
          },
        ],
      };
      /* eslint-enabled @typescript-eslint/camelcase */

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });
      dsMockUtils.createApolloQueryStub(heartbeat(), true);

      dsMockUtils.createApolloQueryStub(
        transactions({
          block_id: undefined,
          address: key,
          module_id: moduleId,
          call_id: callId,
          success: undefined,
          count: 2,
          skip: 1,
          orderBy: undefined,
        }),
        {
          transactions: transactionsQueryResponse,
        }
      );

      let result = await account.getTransactionHistory({
        tag,
        size: 2,
        start: 1,
      });

      expect(result.data[0].blockId).toEqual(1);
      expect(result.data[1].blockId).toEqual(2);
      expect(result.data[0].address).toEqual(address);
      expect(result.data[1].address).toBeNull();
      expect(result.data[0].success).toBeFalsy();
      expect(result.data[1].success).toBeTruthy();
      expect(result.count).toEqual(20);
      expect(result.next).toEqual(3);

      dsMockUtils.createApolloQueryStub(
        transactions({
          block_id: undefined,
          address: key,
          module_id: undefined,
          call_id: undefined,
          success: undefined,
          count: undefined,
          skip: undefined,
          orderBy: undefined,
        }),
        {
          transactions: transactionsQueryResponse,
        }
      );

      result = await account.getTransactionHistory();

      expect(result.data[0].blockId).toEqual(1);
      expect(result.data[0].address).toEqual(address);
      expect(result.data[0].success).toBeFalsy();
      expect(result.count).toEqual(20);
      expect(result.next).toBeNull();
    });
  });
});
