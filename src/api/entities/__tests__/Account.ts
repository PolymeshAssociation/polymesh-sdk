import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Account, Context, Entity } from '~/internal';
import { heartbeat, transactions } from '~/middleware/queries';
import { CallIdEnum, ExtrinsicResult, ModuleIdEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  AccountBalance,
  Balance,
  ModuleName,
  Permissions,
  PermissionType,
  SubsidyWithAllowance,
  TxTags,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Account class', () => {
  let context: Mocked<Context>;

  let address: string;
  let key: string;
  let account: Account;
  let assertAddressValidStub: sinon.SinonStub;
  let addressToKeyStub: sinon.SinonStub;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    assertAddressValidStub = sinon.stub(utilsInternalModule, 'assertAddressValid');
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
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
    sinon.restore();
  });

  it('should extend Entity', () => {
    expect(Account.prototype instanceof Entity).toBe(true);
  });

  it('should throw an error if the supplied address is not encoded with the correct SS58 format', () => {
    assertAddressValidStub.throws();

    expect(
      // cSpell: disable-next-line
      () => new Account({ address: 'ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8' }, context)
    ).toThrow();

    sinon.reset();
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(Account.isUniqueIdentifiers({ address: 'someAddress' })).toBe(true);
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

    it("should return the Account's balance", async () => {
      const result = await account.getBalance();

      expect(result).toEqual(fakeResult);
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';
      const callback = sinon.stub();

      context.accountBalance.callsFake((_, cbFunc: (balance: Balance) => void) => {
        cbFunc(fakeResult);
        return unsubCallback;
      });

      const result = await account.getBalance(callback);

      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(callback, fakeResult);
    });
  });

  describe('method: getSubsidy', () => {
    let fakeResult: SubsidyWithAllowance;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      account = new Account({ address }, context);

      fakeResult = {
        subsidy: entityMockUtils.getSubsidyInstance({
          beneficiary: address,
        }),
        allowance: new BigNumber(1000),
      };
      context.accountSubsidy.resolves(fakeResult);
    });

    it('should return the Subsidy with allowance', async () => {
      const result = await account.getSubsidy();

      expect(result).toEqual(fakeResult);
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';
      const callback = sinon.stub();

      context.accountSubsidy.callsFake(
        async (_, cbFunc: (balance: SubsidyWithAllowance) => void) => {
          cbFunc(fakeResult);
          return unsubCallback;
        }
      );

      const result = await account.getSubsidy(callback);

      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(callback, fakeResult);
    });
  });

  describe('method: getIdentity', () => {
    it('should return the Identity associated to the Account', async () => {
      const did = 'someDid';
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockIdentityId(did),
      });

      const result = await account.getIdentity();
      expect(result?.did).toBe(did);
    });

    it('should return null if there is no Identity associated to the Account', async () => {
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockIdentityId(),
      });

      const result = await account.getIdentity();

      expect(result).toBe(null);
    });
  });

  describe('method: getTransactionHistory', () => {
    it('should return a list of transactions', async () => {
      const tag = TxTags.identity.CddRegisterDid;
      const moduleId = ModuleIdEnum.Identity;
      const callId = CallIdEnum.CddRegisterDid;
      const blockNumber1 = new BigNumber(1);
      const blockNumber2 = new BigNumber(2);
      const blockHash1 = 'someHash';
      const blockHash2 = 'otherHash';

      addressToKeyStub.returns(key);

      sinon.stub(utilsConversionModule, 'txTagToExtrinsicIdentifier').withArgs(tag).returns({
        moduleId,
        callId,
      });

      /* eslint-disable @typescript-eslint/naming-convention */
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
            address,
            nonce: 1,
            success: 0,
            signedby_address: 1,
            block: {
              hash: blockHash1,
              id: blockNumber1.toNumber(),
              datetime: '',
            },
          },
          {
            module_id: ModuleIdEnum.Asset,
            call_id: CallIdEnum.RegisterTicker,
            extrinsic_idx: 2,
            spec_version_id: 2006,
            params: [],
            block_id: blockNumber2.toNumber(),
            success: 1,
            signedby_address: 1,
            block: {
              hash: blockHash2,
              id: blockNumber2.toNumber(),
              datetime: '',
            },
          },
        ],
      };
      /* eslint-enable @typescript-eslint/naming-convention */

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });
      dsMockUtils.createApolloQueryStub(heartbeat(), true);

      dsMockUtils.createQueryStub('system', 'blockHash', {
        multi: [dsMockUtils.createMockHash(blockHash1), dsMockUtils.createMockHash(blockHash2)],
      });
      /* eslint-disable @typescript-eslint/naming-convention */
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
      /* eslint-enable @typescript-eslint/naming-convention */

      let result = await account.getTransactionHistory({
        blockNumber: blockNumber1,
        tag,
        size: new BigNumber(2),
        start: new BigNumber(1),
      });

      expect(result.data[0].blockNumber).toEqual(blockNumber1);
      expect(result.data[1].blockNumber).toEqual(blockNumber2);
      expect(result.data[0].blockHash).toEqual(blockHash1);
      expect(result.data[1].blockHash).toEqual(blockHash2);
      expect(result.data[0].address).toEqual(address);
      expect(result.data[1].address).toBeNull();
      expect(result.data[0].nonce).toEqual(new BigNumber(1));
      expect(result.data[1].nonce).toBeNull();
      expect(result.data[0].success).toBeFalsy();
      expect(result.data[1].success).toBeTruthy();
      expect(result.count).toEqual(new BigNumber(20));
      expect(result.next).toEqual(new BigNumber(3));

      dsMockUtils.createRpcStub('chain', 'getBlock', {
        returnValue: dsMockUtils.createMockSignedBlock({
          block: {
            header: {
              parentHash: 'hash',
              number: dsMockUtils.createMockCompact(dsMockUtils.createMockU32(blockNumber1)),
              extrinsicsRoot: 'hash',
              stateRoot: 'hash',
            },
          },
        }),
      });

      result = await account.getTransactionHistory({
        blockHash: blockHash1,
        tag,
        size: new BigNumber(2),
        start: new BigNumber(1),
      });

      expect(result.data[0].blockNumber).toEqual(blockNumber1);
      expect(result.data[1].blockNumber).toEqual(blockNumber2);
      expect(result.data[0].blockHash).toEqual(blockHash1);
      expect(result.data[1].blockHash).toEqual(blockHash2);
      expect(result.data[0].address).toEqual(address);
      expect(result.data[1].address).toBeNull();
      expect(result.data[0].success).toBeFalsy();
      expect(result.data[1].success).toBeTruthy();
      expect(result.count).toEqual(new BigNumber(20));
      expect(result.next).toEqual(new BigNumber(3));

      /* eslint-disable @typescript-eslint/naming-convention */
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
      /* eslint-enable @typescript-eslint/naming-convention */

      result = await account.getTransactionHistory();

      expect(result.data[0].blockNumber).toEqual(blockNumber1);
      expect(result.data[0].address).toEqual(address);
      expect(result.data[0].success).toBeFalsy();
      expect(result.count).toEqual(new BigNumber(20));
      expect(result.next).toBeNull();
    });
  });

  describe('method: isFrozen', () => {
    it('should return if the Account is frozen or not', async () => {
      const keyToIdentityIdsStub = dsMockUtils.createQueryStub('identity', 'keyToIdentityIds');

      /* eslint-disable @typescript-eslint/naming-convention */
      dsMockUtils.createQueryStub('identity', 'didRecords').returns(
        dsMockUtils.createMockDidRecord({
          primary_key: dsMockUtils.createMockAccountId(address),
          roles: [],
          secondary_keys: [],
        })
      );
      /* eslint-enable @typescript-eslint/naming-convention */
      const isDidFrozenStub = dsMockUtils.createQueryStub('identity', 'isDidFrozen', {
        returnValue: dsMockUtils.createMockBool(false),
      });

      keyToIdentityIdsStub.returns(dsMockUtils.createMockIdentityId());

      let result = await account.isFrozen();
      expect(result).toBe(false);

      keyToIdentityIdsStub.returns(dsMockUtils.createMockIdentityId(address));

      result = await account.isFrozen();
      expect(result).toBe(false);

      const otherAddress = 'otherAddress';
      account = new Account({ address: otherAddress }, context);

      result = await account.isFrozen();
      expect(result).toBe(false);

      isDidFrozenStub.resolves(dsMockUtils.createMockBool(true));

      result = await account.isFrozen();
      expect(result).toBe(true);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      expect(account.toHuman()).toBe(account.address);
    });
  });

  describe('method: exists', () => {
    it('should return true', () => {
      return expect(account.exists()).resolves.toBe(true);
    });
  });

  describe('method: getPermissions', () => {
    it('should throw if no Identity is associated with the Account', async () => {
      context = dsMockUtils.getContextInstance();

      account = new Account({ address }, context);

      const getIdentitySpy = jest.spyOn(account, 'getIdentity').mockResolvedValue(null);

      await expect(() => account.getPermissions()).rejects.toThrowError(
        'There is no Identity associated with this Account'
      );

      getIdentitySpy.mockRestore();
    });

    it('should return full permissions if the Account is the primary Account', async () => {
      const identity = entityMockUtils.getIdentityInstance({
        getPrimaryAccount: {
          account: entityMockUtils.getAccountInstance({ address }),
        },
      });

      account = new Account({ address }, context);

      const getIdentitySpy = jest.spyOn(account, 'getIdentity').mockResolvedValue(identity);

      const result = await account.getPermissions();

      expect(result).toEqual({
        assets: null,
        transactions: null,
        transactionGroups: [],
        portfolios: null,
      });

      getIdentitySpy.mockRestore();
    });

    it("should return the Account's permissions if it is a secondary Account", async () => {
      const permissions = {
        assets: null,
        transactions: {
          values: [TxTags.identity.AcceptPrimaryKey],
          type: PermissionType.Include,
        },
        transactionGroups: [],
        portfolios: null,
      };

      const identity = entityMockUtils.getIdentityInstance({
        getSecondaryAccounts: [
          {
            account: entityMockUtils.getAccountInstance({ address }),
            permissions: {
              assets: null,
              transactions: null,
              transactionGroups: [],
              portfolios: null,
            },
          },
          {
            account: entityMockUtils.getAccountInstance({ address: 'otherAddress' }),
            permissions,
          },
        ],
      });

      account = new Account({ address: 'otherAddress' }, context);

      const getIdentitySpy = jest.spyOn(account, 'getIdentity').mockResolvedValue(identity);

      const result = await account.getPermissions();

      expect(result).toEqual(permissions);

      getIdentitySpy.mockRestore();
    });
  });

  describe('method: checkPermissions', () => {
    it('should return whether the Account has the passed permissions', async () => {
      const getPermissionsSpy = jest.spyOn(account, 'getPermissions');

      let permissions: Permissions = {
        assets: null,
        transactions: null,
        transactionGroups: [],
        portfolios: null,
      };

      getPermissionsSpy.mockResolvedValue(permissions);

      let result = await account.checkPermissions({
        assets: null,
        portfolios: null,
        transactions: null,
      });
      expect(result).toEqual({
        result: true,
      });

      const asset = entityMockUtils.getAssetInstance({ ticker: 'SOME_ASSET' });
      permissions = {
        assets: { values: [asset], type: PermissionType.Include },
        transactions: { values: [TxTags.asset.CreateAsset], type: PermissionType.Include },
        transactionGroups: [],
        portfolios: {
          values: [entityMockUtils.getDefaultPortfolioInstance({ did: 'someDid' })],
          type: PermissionType.Include,
        },
      };

      getPermissionsSpy.mockResolvedValue(permissions);

      const portfolio = entityMockUtils.getDefaultPortfolioInstance({ did: 'otherDid' });

      result = await account.checkPermissions({
        assets: [asset],
        portfolios: [portfolio],
        transactions: [TxTags.asset.CreateAsset],
      });

      expect(result).toEqual({
        result: false,
        missingPermissions: {
          portfolios: [portfolio],
        },
      });

      permissions = {
        assets: { values: [asset], type: PermissionType.Exclude },
        transactions: { values: [TxTags.asset.CreateAsset], type: PermissionType.Exclude },
        transactionGroups: [],
        portfolios: {
          values: [entityMockUtils.getDefaultPortfolioInstance({ did: 'someDid' })],
          type: PermissionType.Exclude,
        },
      };

      getPermissionsSpy.mockResolvedValue(permissions);

      result = await account.checkPermissions({
        assets: [asset],
        portfolios: null,
        transactions: null,
      });

      expect(result).toEqual({
        result: false,
        missingPermissions: {
          assets: [asset],
          portfolios: null,
          transactions: null,
        },
      });

      result = await account.checkPermissions({
        assets: null,
        portfolios: [],
        transactions: [TxTags.asset.CreateAsset],
      });

      expect(result).toEqual({
        result: false,
        missingPermissions: {
          assets: null,
          transactions: [TxTags.asset.CreateAsset],
        },
      });

      result = await account.checkPermissions({
        assets: [],
        portfolios: [entityMockUtils.getDefaultPortfolioInstance({ did: 'otherDid' })],
        transactions: [],
      });

      expect(result).toEqual({
        result: true,
      });

      result = await account.checkPermissions({});

      expect(result).toEqual({
        result: true,
      });

      permissions = {
        assets: { values: [asset], type: PermissionType.Exclude },
        transactions: {
          values: [ModuleName.Identity, TxTags.identity.LeaveIdentityAsKey],
          type: PermissionType.Exclude,
          exceptions: [TxTags.identity.AddClaim],
        },
        transactionGroups: [],
        portfolios: {
          values: [entityMockUtils.getDefaultPortfolioInstance({ did: 'someDid' })],
          type: PermissionType.Exclude,
        },
      };

      getPermissionsSpy.mockResolvedValue(permissions);

      result = await account.checkPermissions({
        assets: [],
        portfolios: null,
        transactions: [TxTags.identity.AcceptPrimaryKey, TxTags.identity.LeaveIdentityAsKey],
      });

      expect(result).toEqual({
        result: false,
        missingPermissions: {
          portfolios: null,
          transactions: [TxTags.identity.AcceptPrimaryKey],
        },
      });

      permissions = {
        assets: { values: [asset], type: PermissionType.Exclude },
        transactions: {
          values: [ModuleName.Identity],
          type: PermissionType.Include,
          exceptions: [TxTags.identity.AddClaim],
        },
        transactionGroups: [],
        portfolios: {
          values: [entityMockUtils.getDefaultPortfolioInstance({ did: 'someDid' })],
          type: PermissionType.Exclude,
        },
      };

      getPermissionsSpy.mockResolvedValue(permissions);

      result = await account.checkPermissions({
        assets: [],
        portfolios: null,
        transactions: [TxTags.identity.AddClaim],
      });

      expect(result).toEqual({
        result: false,
        missingPermissions: {
          portfolios: null,
          transactions: [TxTags.identity.AddClaim],
        },
      });
      getPermissionsSpy.mockRestore();
    });

    it('should exempt certain transactions from requiring permissions', async () => {
      const permissions: Permissions = {
        assets: null,
        transactions: null,
        transactionGroups: [],
        portfolios: null,
      };

      const getPermissionsSpy = jest
        .spyOn(account, 'getPermissions')
        .mockResolvedValue(permissions);

      const result = await account.checkPermissions({
        assets: [],
        portfolios: [],
        transactions: [
          TxTags.balances.Transfer,
          TxTags.balances.TransferWithMemo,
          TxTags.staking.AddPermissionedValidator,
          TxTags.sudo.SetKey,
          TxTags.session.PurgeKeys,
        ],
      });

      expect(result).toEqual({
        result: true,
      });
      getPermissionsSpy.mockRestore();
    });
  });

  describe('method: hasPermissions', () => {
    it('should return whether the Account has the passed permissions', async () => {
      const checkPermissionsSpy = jest
        .spyOn(account, 'checkPermissions')
        .mockResolvedValue({ result: true });

      const result = await account.hasPermissions({ assets: [], portfolios: [], transactions: [] });

      expect(result).toEqual(true);
      checkPermissionsSpy.mockRestore();
    });
  });
});
