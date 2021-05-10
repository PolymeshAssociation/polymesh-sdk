import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Account, Context, Entity } from '~/internal';
import { heartbeat, transactions } from '~/middleware/queries';
import { CallIdEnum, ExtrinsicResult, ModuleIdEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AccountBalance, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('Account class', () => {
  let context: Mocked<Context>;

  let address: string;
  let key: string;
  let account: Account;
  let assertFormatValidStub: sinon.SinonStub;
  let addressToKeyStub: sinon.SinonStub;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    assertFormatValidStub = sinon.stub(utilsInternalModule, 'assertFormatValid');
    addressToKeyStub = sinon.stub(utilsConversionModule, 'addressToKey');

    address = 'someAddress';
    key = 'someKey';
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    account = new Account({ address }, context);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    sinon.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
    sinon.restore();
  });

  test('should extend Entity', () => {
    expect(Account.prototype instanceof Entity).toBe(true);
  });

  test('should throw an error if the supplied address is not encoded with the correct SS58 format', () => {
    assertFormatValidStub.throws();

    expect(() => {
      // eslint-disable-next-line no-new
      new Account({ address: 'ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8' }, context);
    }).toThrow();
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
        total: new BigNumber(110),
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
        returnValue: dsMockUtils.createMockIdentityId(did),
      });

      const result = await account.getIdentity();
      expect(result?.did).toBe(did);
    });

    test('should return null if there is no Identity associated to the Account', async () => {
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockIdentityId(),
      });

      const result = await account.getIdentity();

      expect(result).toBe(null);
    });
  });

  describe('method: getTransactionHistory', () => {
    test('should return a list of transactions', async () => {
      const tag = TxTags.identity.CddRegisterDid;
      const moduleId = ModuleIdEnum.Identity;
      const callId = CallIdEnum.CddRegisterDid;
      const blockNumber1 = new BigNumber(1);
      const blockNumber2 = new BigNumber(2);

      addressToKeyStub.returns(key);

      sinon.stub(utilsConversionModule, 'txTagToExtrinsicIdentifier').withArgs(tag).returns({
        moduleId,
        callId,
      });

      /* eslint-disable @typescript-eslint/camelcase */
      const transactionsQueryResponse: ExtrinsicResult = {
        totalCount: 20,
        items: [
          {
            module_id: ModuleIdEnum.Asset,
            call_id: CallIdEnum.RegisterTicker,
            extrinsic_idx: 2,
            spec_version_id: 2006,
            params: [],
            block_id: blockNumber1.toNumber(),
            address: address,
            success: 0,
          },
          {
            module_id: ModuleIdEnum.Asset,
            call_id: CallIdEnum.RegisterTicker,
            extrinsic_idx: 2,
            spec_version_id: 2006,
            params: [],
            block_id: blockNumber2.toNumber(),
            success: 1,
          },
        ],
      };
      /* eslint-enabled @typescript-eslint/camelcase */

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });
      dsMockUtils.createApolloQueryStub(heartbeat(), true);

      dsMockUtils.createApolloQueryStub(
        transactions({
          block_id: blockNumber1.toNumber(),
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
        blockNumber: blockNumber1,
        tag,
        size: 2,
        start: 1,
      });

      expect(result.data[0].blockNumber).toEqual(blockNumber1);
      expect(result.data[1].blockNumber).toEqual(blockNumber2);
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

      expect(result.data[0].blockNumber).toEqual(blockNumber1);
      expect(result.data[0].address).toEqual(address);
      expect(result.data[0].success).toBeFalsy();
      expect(result.count).toEqual(20);
      expect(result.next).toBeNull();
    });
  });

  describe('method: isFrozen', () => {
    test('should return if the Account is frozen or not', async () => {
      const keyToIdentityIdsStub = dsMockUtils.createQueryStub('identity', 'keyToIdentityIds');

      dsMockUtils.createQueryStub('identity', 'didRecords').returns(
        dsMockUtils.createMockDidRecord({
          primary_key: dsMockUtils.createMockAccountId(address),
          roles: [],
          secondary_keys: [],
        })
      );
      dsMockUtils.createQueryStub('identity', 'isDidFrozen');

      keyToIdentityIdsStub.returns(dsMockUtils.createMockIdentityId());

      let result = await account.isFrozen();
      expect(result).toBe(false);

      keyToIdentityIdsStub.returns(dsMockUtils.createMockIdentityId(address));

      result = await account.isFrozen();
      expect(result).toBe(false);

      result = await entityMockUtils
        .getAccountInstance({
          address: 'otherAddress',
          getIdentity: entityMockUtils.getIdentityInstance({
            areScondaryKeysFrozen: false,
          }),
        })
        .isFrozen();
      expect(result).toBe(false);
    });
  });
});
