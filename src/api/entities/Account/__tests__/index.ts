import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  AccountIdentityRelation,
  AccountKeyType,
  HistoricPolyxTransaction,
} from '~/api/entities/Account/types';
import { Account, Context, Entity } from '~/internal';
import { CallIdEnum, ModuleIdEnum } from '~/middleware/enums';
import { extrinsicsByArgs } from '~/middleware/queries';
import { ExtrinsicsOrderBy } from '~/middleware/types';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  createMockAccountId,
  createMockIdentityId,
  createMockOption,
  createMockPermissions,
  createMockU64,
} from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import {
  AccountBalance,
  Balance,
  ModuleName,
  Permissions,
  PermissionType,
  ResultSet,
  SubsidyWithAllowance,
  TxTags,
  UnsubCallback,
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
  let account: Account;
  let assertAddressValidSpy: jest.SpyInstance;
  let addressToKeySpy: jest.SpyInstance;
  let getSecondaryAccountPermissionsSpy: jest.SpyInstance;
  let keyToAddressSpy: jest.SpyInstance;
  let txTagToExtrinsicIdentifierSpy: jest.SpyInstance;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    assertAddressValidSpy = jest
      .spyOn(utilsInternalModule, 'assertAddressValid')
      .mockImplementation();
    addressToKeySpy = jest.spyOn(utilsConversionModule, 'addressToKey').mockImplementation();
    getSecondaryAccountPermissionsSpy = jest.spyOn(
      utilsInternalModule,
      'getSecondaryAccountPermissions'
    );
    keyToAddressSpy = jest.spyOn(utilsConversionModule, 'keyToAddress');
    txTagToExtrinsicIdentifierSpy = jest.spyOn(utilsConversionModule, 'txTagToExtrinsicIdentifier');

    address = 'someAddress';
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
    jest.restoreAllMocks();
  });

  it('should extend Entity', () => {
    expect(Account.prototype).toBeInstanceOf(Entity);
  });

  it('should throw an error if the supplied address is not encoded with the correct SS58 format', () => {
    assertAddressValidSpy.mockImplementationOnce(() => {
      throw new Error('err');
    });

    expect(
      // cSpell: disable-next-line
      () => new Account({ address: 'ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8' }, context)
    ).toThrow();
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
      const unsubCallback = 'unsubCallback' as unknown as Promise<UnsubCallback>;
      const callback = jest.fn();

      context.accountBalance = jest.fn();
      context.accountBalance.mockImplementation((_, cbFunc: (balance: Balance) => void) => {
        cbFunc(fakeResult);
        return unsubCallback;
      });

      const result = await account.getBalance(callback);

      expect(result).toEqual(unsubCallback);
      expect(callback).toBeCalledWith(fakeResult);
    });
  });

  describe('method: getSubsidy', () => {
    let fakeResult: SubsidyWithAllowance;

    beforeEach(() => {
      fakeResult = {
        subsidy: entityMockUtils.getSubsidyInstance({
          beneficiary: address,
        }),
        allowance: new BigNumber(1000),
      };

      context = dsMockUtils.getContextInstance({
        subsidy: fakeResult,
      });
      account = new Account({ address }, context);
    });

    it('should return the Subsidy with allowance', async () => {
      const result = await account.getSubsidy();

      expect(result).toEqual(fakeResult);
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback' as unknown as Promise<UnsubCallback>;
      const callback = jest.fn();

      context.accountSubsidy.mockImplementation(
        async (_, cbFunc: (balance: SubsidyWithAllowance) => void) => {
          cbFunc(fakeResult);
          return unsubCallback;
        }
      );

      const result = await account.getSubsidy(callback);

      expect(result).toEqual(unsubCallback);
      expect(callback).toBeCalledWith(fakeResult);
    });
  });

  describe('method: getIdentity', () => {
    it('should return the Identity associated to the Account', async () => {
      const did = 'someDid';
      dsMockUtils.createQueryMock('identity', 'keyRecords', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockKeyRecord({
            PrimaryKey: createMockIdentityId(did),
          })
        ),
      });

      let result = await account.getIdentity();
      expect(result?.did).toBe(did);

      const secondaryDid = 'secondaryDid';
      dsMockUtils.createQueryMock('identity', 'keyRecords', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockKeyRecord({
            SecondaryKey: [
              dsMockUtils.createMockIdentityId(secondaryDid),
              dsMockUtils.createMockPermissions(),
            ],
          })
        ),
      });
      result = await account.getIdentity();
      expect(result?.did).toBe(secondaryDid);

      const multiDid = 'multiDid';
      const keyRecordsMock = dsMockUtils.createQueryMock('identity', 'keyRecords');

      keyRecordsMock.mockReturnValueOnce(
        dsMockUtils.createMockOption(
          dsMockUtils.createMockKeyRecord({
            MultiSigSignerKey: createMockAccountId('someAddress'),
          })
        )
      );

      keyRecordsMock.mockReturnValueOnce(
        dsMockUtils.createMockOption(
          dsMockUtils.createMockKeyRecord({
            PrimaryKey: createMockIdentityId(did),
          })
        )
      );

      dsMockUtils.createQueryMock('identity', 'keyRecords', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockKeyRecord({
            PrimaryKey: createMockIdentityId(did),
          })
        ),
      });

      dsMockUtils.createQueryMock('multiSig', 'multiSigToIdentity', {
        returnValue: multiDid,
      });

      result = await account.getIdentity();
      expect(result?.did).toBe(did);
    });

    it('should return null if there is no Identity associated to the Account', async () => {
      dsMockUtils.createQueryMock('identity', 'keyRecords', {
        returnValue: dsMockUtils.createMockOption(null),
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
      const addressKey = 'd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d';
      const order = ExtrinsicsOrderBy.CreatedAtAsc;

      addressToKeySpy.mockReturnValue(addressKey);
      keyToAddressSpy.mockReturnValue(address);

      when(txTagToExtrinsicIdentifierSpy).calledWith(tag).mockReturnValue({
        moduleId,
        callId,
      });

      const extrinsicsQueryResponse = {
        totalCount: 20,
        nodes: [
          {
            moduleId: ModuleIdEnum.Asset,
            callId: CallIdEnum.RegisterTicker,
            extrinsicIdx: 2,
            specVersionId: 2006,
            paramsTxt: '[]',
            blockId: blockNumber1.toNumber(),
            address,
            nonce: 1,
            success: 0,
            signedbyAddress: 1,
            block: {
              hash: blockHash1,
            },
          },
          {
            moduleId: ModuleIdEnum.Asset,
            callId: CallIdEnum.RegisterTicker,
            extrinsicIdx: 2,
            specVersionId: 2006,
            paramsTxt: '[]',
            blockId: blockNumber2.toNumber(),
            success: 1,
            signedbyAddress: 1,
            block: {
              hash: blockHash2,
              id: blockNumber2.toNumber(),
              datetime: '',
            },
          },
        ],
      };

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

      dsMockUtils.createApolloQueryMock(
        extrinsicsByArgs(
          {
            blockId: blockNumber1.toString(),
            address: addressKey,
            moduleId,
            callId,
            success: undefined,
          },
          new BigNumber(2),
          new BigNumber(1),
          order
        ),
        {
          extrinsics: extrinsicsQueryResponse,
        }
      );

      dsMockUtils.createRpcMock('chain', 'getBlock', {
        returnValue: dsMockUtils.createMockSignedBlock({
          block: {
            header: {
              parentHash: 'hash',
              number: dsMockUtils.createMockCompact(dsMockUtils.createMockU32(blockNumber1)),
              extrinsicsRoot: 'hash',
              stateRoot: 'hash',
            },
            extrinsics: undefined,
          },
        }),
      });

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

      dsMockUtils.createApolloQueryMock(
        extrinsicsByArgs(
          {
            blockId: blockNumber1.toString(),
            address: addressKey,
            moduleId,
            callId,
            success: 0,
          },
          new BigNumber(2),
          new BigNumber(1),
          order
        ),
        {
          extrinsics: extrinsicsQueryResponse,
        }
      );

      result = await account.getTransactionHistory({
        blockHash: blockHash1,
        tag,
        success: false,
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

      dsMockUtils.createApolloQueryMock(
        extrinsicsByArgs(
          {
            blockId: undefined,
            address: addressKey,
            moduleId: undefined,
            callId: undefined,
            success: 1,
          },
          undefined,
          undefined,
          ExtrinsicsOrderBy.ModuleIdAsc
        ),
        {
          extrinsics: extrinsicsQueryResponse,
        }
      );

      result = await account.getTransactionHistory({
        success: true,
        orderBy: ExtrinsicsOrderBy.ModuleIdAsc,
      });

      expect(result.data[0].blockNumber).toEqual(blockNumber1);
      expect(result.data[0].address).toEqual(address);
      expect(result.data[0].success).toBeFalsy();
      expect(result.count).toEqual(new BigNumber(20));
      expect(result.next).toEqual(new BigNumber(result.data.length));

      dsMockUtils.createApolloQueryMock(
        extrinsicsByArgs(
          {
            blockId: undefined,
            address: addressKey,
            moduleId: undefined,
            callId: undefined,
            success: undefined,
          },
          undefined,
          undefined,
          order
        ),
        {
          extrinsics: { nodes: [] },
        }
      );

      result = await account.getTransactionHistory();
      expect(result.data).toEqual([]);
      expect(result.next).toBeNull();
    });
  });

  describe('method: isFrozen', () => {
    it('should return if the Account is frozen or not', async () => {
      const didRecordsMock = dsMockUtils.createQueryMock('identity', 'didRecords');

      const keyRecordsMock = dsMockUtils.createQueryMock('identity', 'keyRecords').mockReturnValue(
        dsMockUtils.createMockOption(
          dsMockUtils.createMockKeyRecord({
            SecondaryKey: [
              dsMockUtils.createMockIdentityId('someDid'),
              dsMockUtils.createMockPermissions(),
            ],
          })
        )
      );

      didRecordsMock.mockReturnValue(
        dsMockUtils.createMockOption(
          dsMockUtils.createMockIdentityDidRecord({
            primaryKey: dsMockUtils.createMockOption(dsMockUtils.createMockAccountId(address)),
          })
        )
      );

      const isDidFrozenMock = dsMockUtils.createQueryMock('identity', 'isDidFrozen', {
        returnValue: dsMockUtils.createMockBool(false),
      });

      let result = await account.isFrozen();
      expect(result).toBe(false);

      const otherAddress = 'otherAddress';
      account = new Account({ address: otherAddress }, context);

      result = await account.isFrozen();
      expect(result).toBe(false);

      isDidFrozenMock.mockResolvedValue(dsMockUtils.createMockBool(true));

      result = await account.isFrozen();
      expect(result).toBe(true);

      keyRecordsMock.mockResolvedValue(dsMockUtils.createMockOption());

      result = await account.isFrozen();
      expect(result).toBe(false);
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
      getSecondaryAccountPermissionsSpy.mockReturnValue([]);
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

      getSecondaryAccountPermissionsSpy.mockReturnValue([
        {
          account: entityMockUtils.getAccountInstance({ address: 'otherAddress' }),
          permissions,
        },
      ]);

      const identity = entityMockUtils.getIdentityInstance({});

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

  describe('method: getCurrentNonce', () => {
    it('should return the current nonce of the Account', async () => {
      const nonce = new BigNumber(123);
      jest.spyOn(utilsConversionModule, 'stringToAccountId').mockImplementation();
      dsMockUtils
        .createRpcMock('system', 'accountNextIndex')
        .mockResolvedValue(dsMockUtils.createMockU32(nonce));

      const result = await account.getCurrentNonce();
      expect(result).toEqual(nonce);
    });
  });

  describe('method: getMultiSig', () => {
    it('should return null if the Account is not a MultiSig signer', async () => {
      dsMockUtils.createQueryMock('identity', 'keyRecords', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockKeyRecord({
            PrimaryKey: dsMockUtils.createMockAccountId(),
          })
        ),
      });
      account = new Account({ address }, context);

      let result = await account.getMultiSig();

      expect(result).toBeNull();

      dsMockUtils.createQueryMock('identity', 'keyRecords', {
        returnValue: dsMockUtils.createMockOption(),
      });

      result = await account.getMultiSig();
      expect(result).toBeNull();
    });

    it('should return the MultiSig the Account is a signer for', async () => {
      dsMockUtils.createQueryMock('identity', 'keyRecords', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockKeyRecord({
            MultiSigSignerKey: dsMockUtils.createMockAccountId('multiAddress'),
          })
        ),
      });

      account = new Account({ address }, context);

      const result = await account.getMultiSig();

      expect(result?.address).toEqual('someAddress');
    });
  });

  describe('method: getAccountInfo', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockQueryMulti: any;
    beforeEach(() => {
      mockQueryMulti = context.polymeshApi.queryMulti;
      dsMockUtils.createQueryMock('identity', 'keyRecords', {
        returnValue: createMockOption(),
      });
      dsMockUtils.createQueryMock('multiSig', 'multiSigSignsRequired', {
        returnValue: createMockU64(new BigNumber(0)),
      });

      dsMockUtils.createQueryMock('contracts', 'contractInfoOf', {
        returnValue: dsMockUtils.createMockOption(),
      });
    });

    it('should return unassigned', async () => {
      mockQueryMulti.mockResolvedValue([
        dsMockUtils.createMockOption(),
        dsMockUtils.createMockU64(new BigNumber(0)),
        dsMockUtils.createMockOption(),
      ]);

      const result = await account.getTypeInfo();

      expect(result).toEqual({
        keyType: AccountKeyType.Normal,
        relation: AccountIdentityRelation.Unassigned,
      });
    });

    it('should return the type for a normal primary key', async () => {
      mockQueryMulti.mockResolvedValue([
        dsMockUtils.createMockOption(
          dsMockUtils.createMockKeyRecord({
            PrimaryKey: createMockAccountId('multiSigAddress'),
          })
        ),
        dsMockUtils.createMockU64(new BigNumber(0)),
        dsMockUtils.createMockOption(),
      ]);

      const result = await account.getTypeInfo();

      expect(result).toEqual({
        keyType: AccountKeyType.Normal,
        relation: AccountIdentityRelation.Primary,
      });
    });

    it('should return the type for a MultiSig secondary key', async () => {
      mockQueryMulti.mockResolvedValue([
        dsMockUtils.createMockOption(
          dsMockUtils.createMockKeyRecord({
            SecondaryKey: [createMockAccountId('secondaryAddress'), createMockPermissions()],
          })
        ),
        dsMockUtils.createMockU64(new BigNumber(2)),
        dsMockUtils.createMockOption(),
      ]);

      const result = await account.getTypeInfo();

      expect(result).toEqual({
        keyType: AccountKeyType.MultiSig,
        relation: AccountIdentityRelation.Secondary,
      });
    });

    it('should return the type for a SmartContract', async () => {
      mockQueryMulti.mockResolvedValue([
        dsMockUtils.createMockOption(
          dsMockUtils.createMockKeyRecord({
            MultiSigSignerKey: createMockAccountId('multiSigAddress'),
          })
        ),
        dsMockUtils.createMockU64(new BigNumber(0)),
        dsMockUtils.createMockOption(dsMockUtils.createMockContractInfo()),
      ]);

      const result = await account.getTypeInfo();

      expect(result).toEqual({
        keyType: AccountKeyType.SmartContract,
        relation: AccountIdentityRelation.MultiSigSigner,
      });
    });
  });

  describe('method: getPolyxTransactions', () => {
    it('should return the polyx transactions for the current Account', async () => {
      const fakeResult = 'someTransactions' as unknown as ResultSet<HistoricPolyxTransaction>;
      context = dsMockUtils.getContextInstance({
        getPolyxTransactions: fakeResult,
      });
      account = new Account({ address }, context);
      const result = await account.getPolyxTransactions({});

      expect(result).toEqual(fakeResult);
    });
  });
});
