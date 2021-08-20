import BigNumber from 'bignumber.js';
import { ProtocolOp, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import { Account, Context, Identity } from '~/internal';
import { didsWithClaims, heartbeat } from '~/middleware/queries';
import { ClaimTypeEnum, IdentityWithClaimsResult } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { createMockAccountId } from '~/testUtils/mocks/dataSources';
import { ClaimType, CorporateActionKind, TargetTreatment, TransactionArgumentType } from '~/types';
import { GraphqlQuery } from '~/types/internal';
import { tuple } from '~/types/utils';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '@polkadot/api',
  require('~/testUtils/mocks/dataSources').mockPolkadotModule('@polkadot/api')
);
jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);
jest.mock(
  '~/api/entities/DividendDistribution',
  require('~/testUtils/mocks/entities').mockDividendDistributionModule(
    '~/api/entities/DividendDistribution'
  )
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);
jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);

// TODO: refactor tests (too much repeated code)
describe('Context class', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    dsMockUtils.setConstMock('system', 'ss58Prefix', { returnValue: dsMockUtils.createMockU8(42) });
    dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
      returnValue: dsMockUtils.createMockIdentityId('someDid'),
    });
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  test('should throw an error if accessing the transaction submodule without an active account', async () => {
    const context = await Context.create({
      polymeshApi: dsMockUtils.getApiInstance(),
      middlewareApi: dsMockUtils.getMiddlewareApi(),
      keyring: dsMockUtils.getKeyringInstance({ getPairs: [] }),
    });

    expect(() => context.polymeshApi.tx).toThrow(
      'Cannot perform transactions without an active account'
    );
  });

  test('should throw an error if accessing the middleware client without an active connection', async () => {
    const newPair = {
      address: 'someAddress1',
      meta: {},
      publicKey: 'publicKey',
    };
    dsMockUtils.configureMocks({
      keyringOptions: {
        addFromSeed: newPair,
      },
    });

    const context = await Context.create({
      polymeshApi: dsMockUtils.getApiInstance(),
      middlewareApi: null,
      accountSeed: '0x6'.padEnd(66, '0'),
    });

    expect(() => context.middlewareApi).toThrow(
      'Cannot perform this action without an active middleware connection'
    );
  });

  test('should check if the middleware client is equal to the instance passed to the constructor', async () => {
    const newPair = {
      address: 'someAddress1',
      meta: {},
      publicKey: 'publicKey',
    };
    dsMockUtils.configureMocks({
      keyringOptions: {
        addFromSeed: newPair,
      },
    });

    const middlewareApi = dsMockUtils.getMiddlewareApi();

    const context = await Context.create({
      polymeshApi: dsMockUtils.getApiInstance(),
      middlewareApi,
      accountSeed: '0x6'.padEnd(66, '0'),
    });

    expect(context.middlewareApi).toEqual(middlewareApi);
  });

  test('should listen for polkadot disconnection and errors in order to finish cleanup', async () => {
    const polymeshApi = dsMockUtils.getApiInstance();

    let context = await Context.create({
      polymeshApi,
      middlewareApi: null,
      accountSeed: '0x6'.padEnd(66, '0'),
    });

    polymeshApi.emit('disconnected');

    expect(() => context.getSigner).toThrow();

    context = await Context.create({
      polymeshApi,
      middlewareApi: null,
      accountSeed: '0x6'.padEnd(66, '0'),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (context as any).isDisconnected = true;

    polymeshApi.emit('disconnected');

    expect(() => context.getSigner).toThrow();
  });

  describe('method: create', () => {
    beforeEach(() => {
      dsMockUtils.createQueryStub('balances', 'totalIssuance', {
        returnValue: dsMockUtils.createMockBalance(100),
      });
      dsMockUtils.createQueryStub('system', 'blockHash', {
        returnValue: dsMockUtils.createMockHash('someBlockHash'),
      });
    });

    test('should throw if seed parameter is not a 66 length string', async () => {
      const context = Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: 'abc',
      });

      return expect(context).rejects.toThrow(new Error('Seed must be 66 characters in length'));
    });

    test('should create a Context object from a seed with Pair attached', async () => {
      const newPair = {
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: [newPair],
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      expect(context.currentPair).toEqual(newPair);
    });

    test('should create a Context object from a keyring with Pair attached', async () => {
      const pairs = [
        {
          address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          meta: {},
          publicKey: 'publicKey',
        },
      ];
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: pairs,
        },
      });

      sinon.stub(utilsInternalModule, 'assertFormatValid');

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        keyring: dsMockUtils.getKeyringInstance(),
      });

      expect(context.currentPair).toEqual(pairs[0]);
    });

    test('should throw if keyring has incorrect ss58 format set', async () => {
      const pairs = [
        {
          address: '2HFAAoz9ZGHnLL84ytDhVBXggYv4avQCiS5ajtKLudRhUFrh',
          meta: {},
          publicKey: 'publicKey',
        },
      ];
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: pairs,
          encodeAddress: '2HFAAoz9ZGHnLL84ytDhVBXggYv4avQCiS5ajtKLudRhUFrh',
        },
      });

      const context = Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        keyring: dsMockUtils.getKeyringInstance(),
      });

      return expect(context).rejects.toThrow(
        new Error("The supplied keyring is not using the chain's SS58 format")
      );
    });

    test('should create a Context object from a uri with Pair attached', async () => {
      const newPair = {
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: [newPair],
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountUri: '//Alice',
      });

      expect(context.currentPair).toEqual(newPair);
    });

    test('should create a Context object from a mnemonic with Pair attached', async () => {
      const newPair = {
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: [newPair],
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountMnemonic:
          'lorem ipsum dolor sit amet consectetur adipiscing elit nam hendrerit consectetur sagittis',
      });

      expect(context.currentPair).toEqual(newPair);
    });

    test('should create a Context object without Pair attached', async () => {
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: [],
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      expect(context.currentPair).toBe(undefined);
    });
  });

  describe('method: getAccounts', () => {
    test('should retrieve an array of Accounts', async () => {
      const pairs = [
        {
          address: '5GNWrbft4pJcYSak9tkvUy89e2AKimEwHb6CKaJq81KHEj8e',
          meta: {
            name: 'name 01',
          },
          somethingElse: false,
          publicKey: 'publicKey',
        },
        {
          address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          meta: {},
          somethingElse: false,
          publicKey: 'publicKey',
        },
      ];
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: pairs,
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      let result = context.getAccounts();
      expect(result[0].address).toBe(pairs[0].address);
      expect(result[1].address).toBe(pairs[1].address);
      expect(result[0] instanceof Account).toBe(true);
      expect(result[1] instanceof Account).toBe(true);

      context.setPair(result[1].address);

      result = context.getAccounts();
      expect(result[1].address).toBe(pairs[0].address);
      expect(result[0].address).toBe(pairs[1].address);
      expect(result[0] instanceof Account).toBe(true);
      expect(result[1] instanceof Account).toBe(true);
    });

    test('should throw an error if there is no Current Account', async () => {
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: [],
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      expect(() => context.getAccounts()).toThrow('There is no account associated with the SDK');
    });
  });

  describe('method: setPair', () => {
    test('should throw error if the pair does not exist in the keyring set', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      dsMockUtils.getKeyringInstance().getPair.throws(new Error('failed'));

      return expect(() => context.setPair('012')).toThrow(
        'The address is not present in the keyring set'
      );
    });

    test('should set new value for currentPair', async () => {
      const publicKey = 'publicKey';
      const newPublicKey = 'newPublicKey';
      const newAddress = 'newAddress';
      const accountId = dsMockUtils.createMockAccountId(newAddress);
      const newCurrentPair = {
        address: newAddress,
        meta: {},
        publicKey: newPublicKey,
      };

      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: {
            address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            meta: {},
            publicKey,
          },
          getPair: newCurrentPair,
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      sinon
        .stub(utilsConversionModule, 'stringToAccountId')
        .withArgs(newAddress, context)
        .returns(accountId);

      context.setPair(DUMMY_ACCOUNT_ID);

      expect(context.currentPair).toEqual(newCurrentPair);
    });
  });

  describe('method: accountBalance', () => {
    test('should throw if accountId or currentPair is not set', async () => {
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: [],
        },
      });
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      return expect(context.accountBalance()).rejects.toThrow(
        'There is no account associated with the SDK'
      );
    });

    test('should return the account POLYX balance if currentPair is set', async () => {
      const freeBalance = dsMockUtils.createMockBalance(100);
      const returnValue = dsMockUtils.createMockAccountInfo({
        nonce: dsMockUtils.createMockIndex(),
        refcount: dsMockUtils.createMockRefCount(),
        data: dsMockUtils.createMockAccountData({
          free: freeBalance,
          reserved: dsMockUtils.createMockBalance(),
          miscFrozen: dsMockUtils.createMockBalance(),
          feeFrozen: dsMockUtils.createMockBalance(),
        }),
      });

      dsMockUtils.createQueryStub('system', 'account', { returnValue });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      const result = await context.accountBalance();
      expect(result.free).toEqual(utilsConversionModule.balanceToBigNumber(freeBalance));
    });

    test('should return the account POLYX balance if accountId is set', async () => {
      const freeBalance = dsMockUtils.createMockBalance(100);
      const returnValue = dsMockUtils.createMockAccountInfo({
        nonce: dsMockUtils.createMockIndex(),
        refcount: dsMockUtils.createMockRefCount(),
        data: dsMockUtils.createMockAccountData({
          free: freeBalance,
          reserved: dsMockUtils.createMockBalance(),
          miscFrozen: dsMockUtils.createMockBalance(),
          feeFrozen: dsMockUtils.createMockBalance(),
        }),
      });

      dsMockUtils.createQueryStub('system', 'account', { returnValue });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      const result = await context.accountBalance('accountId');
      expect(result.free).toEqual(utilsConversionModule.balanceToBigNumber(freeBalance));
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';
      const free = dsMockUtils.createMockBalance(100);
      const miscFrozen = dsMockUtils.createMockBalance(10);
      const feeFrozen = dsMockUtils.createMockBalance(12);

      const returnValue = dsMockUtils.createMockAccountInfo({
        nonce: dsMockUtils.createMockIndex(),
        refcount: dsMockUtils.createMockRefCount(),
        data: dsMockUtils.createMockAccountData({
          free,
          reserved: dsMockUtils.createMockBalance(),
          miscFrozen,
          feeFrozen,
        }),
      });

      dsMockUtils.createQueryStub('system', 'account').callsFake(async (_, cbFunc) => {
        cbFunc(returnValue);
        return unsubCallback;
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      const callback = sinon.stub();
      const result = await context.accountBalance('accountId', callback);

      expect(result).toEqual(unsubCallback);
      const freeBalance = utilsConversionModule.balanceToBigNumber(free);
      const feeFrozenBalance = utilsConversionModule.balanceToBigNumber(feeFrozen);
      sinon.assert.calledWithExactly(callback, {
        free: freeBalance,
        locked: feeFrozenBalance,
        total: freeBalance.plus(feeFrozenBalance),
      });
    });
  });

  describe('method: getCurrentIdentity', () => {
    test('should return the current Identity', async () => {
      const did = 'someDid';
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockIdentityId(did),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      const result = await context.getCurrentIdentity();
      expect(result.did).toBe(did);
    });

    test('should throw an error if there is no Identity associated to the Current Account', async () => {
      entityMockUtils.getAccountGetIdentityStub().resolves(null);

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      return expect(context.getCurrentIdentity()).rejects.toThrow(
        'The current account does not have an associated Identity'
      );
    });
  });

  describe('method: getCurrentAccount', () => {
    test('should return the current Account', async () => {
      const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

      const pair = {
        address,
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: [pair],
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      const result = context.getCurrentAccount();
      expect(result.address).toBe(address);
    });

    test('should throw an error if there is no account associated with the SDK', async () => {
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: [],
        },
      });
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      let err;

      try {
        context.getCurrentAccount();
      } catch (e) {
        err = e;
      }

      expect(err.message).toBe('There is no account associated with the SDK');
    });
  });

  describe('method: getCurrentPair', () => {
    test('should return the current keyring pair', async () => {
      const pair = {
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: [pair],
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      const result = context.getCurrentPair();

      expect(result).toBe(pair);
    });

    test("should throw an error if the current pair isn't defined", async () => {
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: [],
        },
      });
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      expect(() => context.getCurrentPair()).toThrow(
        'There is no account associated with the current SDK instance'
      );
    });
  });

  describe('method: getSigner', () => {
    test('should return the signer address if the current pair is locked', async () => {
      const pair = {
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        meta: {},
        publicKey: 'publicKey',
        isLocked: true,
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: [pair],
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      expect(context.getSigner()).toBe(pair.address);
    });

    test('should return the signer address if the current pair is locked', async () => {
      const pair = {
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        meta: {},
        publicKey: 'publicKey',
        isLocked: false,
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: [pair],
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      expect(context.getSigner()).toEqual(pair);
    });
  });

  describe('method: getInvalidDids', () => {
    /* eslint-disable @typescript-eslint/naming-convention */
    test('should return which DIDs in the input array are invalid', async () => {
      const inputDids = ['someDid', 'otherDid', 'invalidDid', 'otherInvalidDid'];
      dsMockUtils.createQueryStub('identity', 'didRecords', {
        multi: [
          dsMockUtils.createMockDidRecord({
            roles: [],
            primary_key: createMockAccountId('someId'),
            secondary_keys: [],
          }),
          dsMockUtils.createMockDidRecord({
            roles: [],
            primary_key: createMockAccountId('otherId'),
            secondary_keys: [],
          }),
          dsMockUtils.createMockDidRecord(),
          dsMockUtils.createMockDidRecord(),
        ],
      });

      const newPair = {
        address: 'someAddress',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromUri: newPair,
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountUri: '//Alice',
      });

      const invalidDids = await context.getInvalidDids(inputDids);

      expect(invalidDids).toEqual(inputDids.slice(2, 4));
    });
    /* eslint-enable @typescript-eslint/naming-convention */
  });

  describe('method: getTransactionFees', () => {
    test('should return the fees associated to the supplied transaction', async () => {
      const pair = {
        address: 'someAddress1',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: pair,
        },
      });

      dsMockUtils.createQueryStub('protocolFee', 'coefficient', {
        returnValue: dsMockUtils.createMockPosRatio(1, 2),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      const txTagToProtocolOpStub = sinon.stub(utilsConversionModule, 'txTagToProtocolOp');

      txTagToProtocolOpStub
        .withArgs(TxTags.asset.CreateAsset, context)
        .returns(('someProtocolOp' as unknown) as ProtocolOp);
      txTagToProtocolOpStub.withArgs(TxTags.asset.Freeze, context).throws(); // transaction without fees

      dsMockUtils.createQueryStub('protocolFee', 'baseFees', {
        returnValue: dsMockUtils.createMockBalance(500000000),
      });

      let result = await context.getTransactionFees(TxTags.asset.CreateAsset);

      expect(result).toEqual(new BigNumber(250));

      result = await context.getTransactionFees(TxTags.asset.Freeze);

      expect(result).toEqual(new BigNumber(0));
    });
  });

  describe('method: getTransactionArguments', () => {
    test('should return a representation of the arguments of a transaction', async () => {
      const pair = {
        address: 'someAddress1',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: pair,
        },
      });

      dsMockUtils.createQueryStub('protocolFee', 'coefficient', {
        returnValue: dsMockUtils.createMockPosRatio(1, 2),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      dsMockUtils.createTxStub('asset', 'registerTicker', {
        meta: {
          args: [
            {
              type: 'Ticker',
              name: 'ticker',
            },
          ],
        },
      });

      expect(context.getTransactionArguments({ tag: TxTags.asset.RegisterTicker })).toMatchObject([
        {
          name: 'ticker',
          type: TransactionArgumentType.Text,
          optional: false,
        },
      ]);

      dsMockUtils.createTxStub('identity', 'addClaim', {
        meta: {
          args: [
            {
              type: 'IdentityId',
              name: 'target',
            },
            {
              type: 'PortfolioKind',
              name: 'portfolioKind',
            },
            {
              type: 'Option<Moment>',
              name: 'expiry',
            },
            {
              type: '(IdentityId, u32)',
              name: 'identityPair',
            },
          ],
        },
      });

      expect(context.getTransactionArguments({ tag: TxTags.identity.AddClaim })).toMatchObject([
        {
          name: 'target',
          type: TransactionArgumentType.Did,
          optional: false,
        },
        {
          name: 'portfolioKind',
          type: TransactionArgumentType.RichEnum,
          optional: false,
          internal: [
            {
              name: 'Default',
              type: TransactionArgumentType.Null,
              optional: false,
            },
            {
              name: 'User',
              type: TransactionArgumentType.Number,
              optional: false,
            },
          ],
        },
        {
          name: 'expiry',
          type: TransactionArgumentType.Date,
          optional: true,
        },
        {
          name: 'identityPair',
          type: TransactionArgumentType.Tuple,
          optional: false,
          internal: [
            {
              name: '0',
              optional: false,
              type: TransactionArgumentType.Did,
            },
            {
              name: '1',
              optional: false,
              type: TransactionArgumentType.Number,
            },
          ],
        },
      ]);

      dsMockUtils.createTxStub('identity', 'cddRegisterDid', {
        meta: {
          args: [
            {
              type: 'Compact<Bytes>',
              name: 'someArg',
            },
          ],
        },
      });

      expect(
        context.getTransactionArguments({ tag: TxTags.identity.CddRegisterDid })
      ).toMatchObject([
        {
          type: TransactionArgumentType.Unknown,
          name: 'someArg',
          optional: false,
        },
      ]);

      dsMockUtils.createTxStub('asset', 'createAsset', {
        meta: {
          args: [
            {
              type: 'Vec<IdentityId>',
              name: 'dids',
            },
          ],
        },
      });

      expect(context.getTransactionArguments({ tag: TxTags.asset.CreateAsset })).toMatchObject([
        {
          type: TransactionArgumentType.Array,
          name: 'dids',
          optional: false,
          internal: {
            name: '',
            type: TransactionArgumentType.Did,
            optional: false,
          },
        },
      ]);

      dsMockUtils.createTxStub('asset', 'updateIdentifiers', {
        meta: {
          args: [
            {
              type: '[u8;32]',
              name: 'someArg',
            },
          ],
        },
      });

      expect(
        context.getTransactionArguments({ tag: TxTags.asset.UpdateIdentifiers })
      ).toMatchObject([
        {
          type: TransactionArgumentType.Text,
          name: 'someArg',
          optional: false,
        },
      ]);

      dsMockUtils.createTxStub('asset', 'setFundingRound', {
        meta: {
          args: [
            {
              type: 'AssetOwnershipRelation',
              name: 'relation',
            },
          ],
        },
      });

      expect(context.getTransactionArguments({ tag: TxTags.asset.SetFundingRound })).toMatchObject([
        {
          type: TransactionArgumentType.SimpleEnum,
          name: 'relation',
          optional: false,
          internal: ['NotOwned', 'TickerOwned', 'AssetOwned'],
        },
      ]);

      dsMockUtils.createTxStub('asset', 'unfreeze', {
        meta: {
          args: [
            {
              type: 'VoteCountProposalFound',
              name: 'voteCountProposalFound',
            },
          ],
        },
      });

      expect(context.getTransactionArguments({ tag: TxTags.asset.Unfreeze })).toMatchObject([
        {
          type: TransactionArgumentType.Object,
          name: 'voteCountProposalFound',
          optional: false,
          internal: [
            {
              name: 'ayes',
              type: TransactionArgumentType.Number,
            },
            {
              name: 'nays',
              type: TransactionArgumentType.Number,
            },
          ],
        },
      ]);

      dsMockUtils.createTxStub('asset', 'claimClassicTicker', {
        meta: {
          args: [
            {
              type: 'UInt<8>',
              name: 'someArg',
            },
          ],
        },
      });

      expect(
        context.getTransactionArguments({ tag: TxTags.asset.ClaimClassicTicker })
      ).toMatchObject([
        {
          type: TransactionArgumentType.Unknown,
          name: 'someArg',
          optional: false,
        },
      ]);
    });
  });

  describe('method: issuedClaims', () => {
    test('should return a result set of claims', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      const targetDid = 'someTargetDid';
      const issuerDid = 'someIssuerDid';
      const date = 1589816265000;
      const customerDueDiligenceType = ClaimTypeEnum.CustomerDueDiligence;
      const claim = {
        target: new Identity({ did: targetDid }, context),
        issuer: new Identity({ did: issuerDid }, context),
        issuedAt: new Date(date),
      };
      const fakeClaims = [
        {
          ...claim,
          expiry: new Date(date),
          claim: {
            type: customerDueDiligenceType,
          },
        },
        {
          ...claim,
          expiry: null,
          claim: {
            type: customerDueDiligenceType,
          },
        },
      ];
      /* eslint-disable @typescript-eslint/naming-convention */
      const commonClaimData = {
        targetDID: targetDid,
        issuer: issuerDid,
        issuance_date: date,
        last_update_date: date,
      };
      const didsWithClaimsQueryResponse: IdentityWithClaimsResult = {
        totalCount: 25,
        items: [
          {
            did: targetDid,
            claims: [
              {
                ...commonClaimData,
                expiry: date,
                type: customerDueDiligenceType,
              },
              {
                ...commonClaimData,
                expiry: null,
                type: customerDueDiligenceType,
              },
            ],
          },
        ],
      };
      /* eslint-enabled @typescript-eslint/naming-convention */

      dsMockUtils.createApolloQueryStub(
        didsWithClaims({
          dids: [targetDid],
          trustedClaimIssuers: [targetDid],
          claimTypes: [ClaimTypeEnum.Accredited],
          includeExpired: true,
          count: 1,
          skip: undefined,
        }),
        {
          didsWithClaims: didsWithClaimsQueryResponse,
        }
      );

      let result = await context.issuedClaims({
        targets: [targetDid],
        trustedClaimIssuers: [targetDid],
        claimTypes: [ClaimType.Accredited],
        includeExpired: true,
        size: 1,
      });

      expect(result.data).toEqual(fakeClaims);
      expect(result.count).toEqual(25);
      expect(result.next).toEqual(1);

      dsMockUtils.createApolloQueryStub(
        didsWithClaims({
          dids: undefined,
          trustedClaimIssuers: undefined,
          claimTypes: undefined,
          includeExpired: true,
          count: undefined,
          skip: undefined,
        }),
        {
          didsWithClaims: didsWithClaimsQueryResponse,
        }
      );

      result = await context.issuedClaims();

      expect(result.data).toEqual(fakeClaims);
      expect(result.count).toEqual(25);
      expect(result.next).toBeNull();
    });

    test('should return a result set of claims from chain', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      const targetDid = 'someTargetDid';
      const issuerDid = 'someIssuerDid';
      const cddId = 'someCddId';
      const issuedAt = new Date('10/14/2019');
      const expiryOne = new Date('10/14/2020');
      const expiryTwo = new Date('10/14/2060');

      const claim1stKey = dsMockUtils.createMockClaim1stKey({
        target: dsMockUtils.createMockIdentityId(targetDid),
        claim_type: dsMockUtils.createMockClaimType(ClaimType.CustomerDueDiligence),
      });

      const identityClaim = {
        claim_issuer: dsMockUtils.createMockIdentityId(issuerDid),
        issuance_date: dsMockUtils.createMockMoment(issuedAt.getTime()),
        last_update_date: dsMockUtils.createMockMoment(),
        claim: dsMockUtils.createMockClaim({
          CustomerDueDiligence: dsMockUtils.createMockCddId(cddId),
        }),
      };

      const fakeClaims = [
        {
          target: new Identity({ did: targetDid }, context),
          issuer: new Identity({ did: issuerDid }, context),
          issuedAt,
          expiry: expiryOne,
          claim: {
            type: ClaimType.CustomerDueDiligence,
            id: cddId,
          },
        },
        {
          target: new Identity({ did: targetDid }, context),
          issuer: new Identity({ did: issuerDid }, context),
          issuedAt,
          expiry: null,
          claim: {
            type: ClaimType.CustomerDueDiligence,
            id: cddId,
          },
        },
        {
          target: new Identity({ did: targetDid }, context),
          issuer: new Identity({ did: issuerDid }, context),
          issuedAt,
          expiry: expiryTwo,
          claim: {
            type: ClaimType.CustomerDueDiligence,
            id: cddId,
          },
        },
      ];

      dsMockUtils.configureMocks({
        contextOptions: {
          middlewareAvailable: false,
        },
      });

      const entriesStub = sinon.stub();
      entriesStub.resolves([
        tuple(
          { args: [claim1stKey] },
          {
            ...identityClaim,
            expiry: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(expiryOne.getTime())),
          }
        ),
        tuple(
          { args: [claim1stKey] },
          {
            ...identityClaim,
            expiry: dsMockUtils.createMockOption(),
          }
        ),
        tuple(
          { args: [claim1stKey] },
          {
            ...identityClaim,
            expiry: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(expiryTwo.getTime())),
          }
        ),
      ]);

      dsMockUtils.createQueryStub('identity', 'claims').entries = entriesStub;

      let result = await context.issuedClaims({
        targets: [targetDid],
        claimTypes: [ClaimType.CustomerDueDiligence],
      });

      expect(result.data).toEqual(fakeClaims);

      const { data } = await context.issuedClaims({
        targets: [targetDid],
        claimTypes: [ClaimType.CustomerDueDiligence],
        includeExpired: false,
      });

      expect(data.length).toEqual(2);
      expect(data[0]).toEqual(fakeClaims[1]);
      expect(data[1]).toEqual(fakeClaims[2]);

      sinon.stub(utilsConversionModule, 'signerToString').returns(targetDid);

      result = await context.issuedClaims({
        targets: [targetDid],
        claimTypes: [ClaimType.CustomerDueDiligence],
        trustedClaimIssuers: [targetDid],
      });

      expect(result.data.length).toEqual(0);

      result = await context.issuedClaims({
        targets: [targetDid],
        trustedClaimIssuers: [targetDid],
      });

      expect(result.data.length).toEqual(0);
    });

    test('should throw if the middleware is not available and targets or claimTypes are not set', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      dsMockUtils.configureMocks({
        contextOptions: {
          middlewareAvailable: false,
        },
      });

      await expect(context.issuedClaims()).rejects.toThrow(
        'Cannot perform this action without an active middleware connection'
      );
    });
  });

  describe('method: queryMiddleware', () => {
    test('should throw if the middleware query fails', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      dsMockUtils.throwOnMiddlewareQuery();

      await expect(
        context.queryMiddleware(('query' as unknown) as GraphqlQuery<unknown>)
      ).rejects.toThrow('Error in middleware query: Error');

      dsMockUtils.throwOnMiddlewareQuery({ networkError: {}, message: 'Error' });

      await expect(
        context.queryMiddleware(('query' as unknown) as GraphqlQuery<unknown>)
      ).rejects.toThrow('Error in middleware query: Error');

      dsMockUtils.throwOnMiddlewareQuery({ networkError: { result: { message: 'Some Message' } } });

      await expect(
        context.queryMiddleware(('query' as unknown) as GraphqlQuery<unknown>)
      ).rejects.toThrow('Error in middleware query: Some Message');
    });

    test('should perform a middleware query and return the results', async () => {
      const fakeResult = 'res';
      const fakeQuery = ('fakeQuery' as unknown) as GraphqlQuery<unknown>;

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      dsMockUtils.createApolloQueryStub(fakeQuery, fakeResult);

      const res = await context.queryMiddleware(fakeQuery);

      expect(res.data).toBe(fakeResult);
    });
  });

  describe('method: getLatestBlock', () => {
    test('should return the latest block', async () => {
      const blockNumber = 100;

      dsMockUtils.createRpcStub('chain', 'getHeader', {
        returnValue: {
          number: dsMockUtils.createMockCompact(dsMockUtils.createMockU32(blockNumber)),
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      const result = await context.getLatestBlock();

      expect(result).toEqual(new BigNumber(blockNumber));
    });
  });

  describe('methd: isMiddlewareEnabled', () => {
    test('should return true if the middleware is enabled', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      const result = context.isMiddlewareEnabled();

      expect(result).toBe(true);
    });

    test('should return false if the middleware is not enabled', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      const result = context.isMiddlewareEnabled();

      expect(result).toBe(false);
    });
  });

  describe('methd: isMiddlewareAvailable', () => {
    test('should return true if the middleware is available', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      dsMockUtils.createApolloQueryStub(heartbeat(), true);

      const result = await context.isMiddlewareAvailable();

      expect(result).toBe(true);
    });

    test('should return false if the middleware is not enabled', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: null,
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      dsMockUtils.throwOnMiddlewareQuery();

      const result = await context.isMiddlewareAvailable();

      expect(result).toBe(false);
    });
  });

  describe('method: disconnect', () => {
    test('should disconnect everything and leave the instance unusable', async () => {
      const polymeshApi = dsMockUtils.getApiInstance();
      const middlewareApi = dsMockUtils.getMiddlewareApi();
      const context = await Context.create({
        polymeshApi,
        middlewareApi,
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      await context.disconnect();
      polymeshApi.emit('disconnected');

      sinon.assert.calledOnce(polymeshApi.disconnect);
      sinon.assert.calledOnce(middlewareApi.stop);

      expect(() => context.getAccounts()).toThrow(
        'Client disconnected. Please create a new instance via "Polymesh.connect()"'
      );
    });
  });

  describe('method: addPair', () => {
    test('should add a new pair to the keyring via seed', async () => {
      const newPair = {
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: [newPair],
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      const accountSeed = '0x7'.padEnd(66, '0');

      context.addPair({ accountSeed });

      sinon.assert.calledTwice(dsMockUtils.getKeyringInstance().addFromSeed);
    });

    test('should add a new pair to the keyring via mnemonic', async () => {
      const newPair = {
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: [newPair],
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      const accountMnemonic = 'something';

      context.addPair({ accountMnemonic });

      sinon.assert.calledWith(dsMockUtils.getKeyringInstance().addFromMnemonic, accountMnemonic);
    });

    test('should add a new pair to the keyring via uri', async () => {
      const newPair = {
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: [newPair],
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      const accountUri = 'something';

      context.addPair({ accountUri });

      sinon.assert.calledWith(dsMockUtils.getKeyringInstance().addFromUri, accountUri);
    });

    test('should add a new pair to the keyring via pair', async () => {
      const newPair = {
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: [newPair],
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pair = ('something' as unknown) as any;

      context.addPair({ pair });

      sinon.assert.calledWith(dsMockUtils.getKeyringInstance().addPair, pair);
    });
  });

  describe('method: getDividendDistributionsForTokens', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should return all distributions associated to the passed tokens', async () => {
      const tickers = ['TICKER_0', 'TICKER_1', 'TICKER_2'];
      const rawTickers = tickers.map(dsMockUtils.createMockTicker);

      const polymeshApi = dsMockUtils.getApiInstance();
      const middlewareApi = dsMockUtils.getMiddlewareApi();
      const context = await Context.create({
        polymeshApi,
        middlewareApi,
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      const corporateActions = [
        dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateAction({
            kind: CorporateActionKind.UnpredictableBenefit,
            decl_date: new Date('10/14/1987').getTime(),
            record_date: dsMockUtils.createMockRecordDate({
              date: new Date('10/14/2019').getTime(),
              checkpoint: { Existing: dsMockUtils.createMockU64(2) },
            }),
            targets: {
              identities: ['someDid'],
              treatment: TargetTreatment.Exclude,
            },
            default_withholding_tax: 100000,
            withholding_tax: [tuple('someDid', 300000)],
          })
        ),
        dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateAction({
            kind: CorporateActionKind.Reorganization,
            decl_date: new Date('10/14/1987').getTime(),
            record_date: null,
            targets: {
              identities: [],
              treatment: TargetTreatment.Exclude,
            },
            default_withholding_tax: 0,
            withholding_tax: [],
          })
        ),
        dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateAction({
            kind: CorporateActionKind.UnpredictableBenefit,
            decl_date: new Date('11/26/1989').getTime(),
            record_date: dsMockUtils.createMockRecordDate({
              date: new Date('11/26/2019').getTime(),
              checkpoint: { Existing: dsMockUtils.createMockU64(5) },
            }),
            targets: {
              identities: [],
              treatment: TargetTreatment.Exclude,
            },
            default_withholding_tax: 150000,
            withholding_tax: [tuple('someDid', 200000)],
          })
        ),
      ];

      const distributions = [
        dsMockUtils.createMockOption(
          dsMockUtils.createMockDistribution({
            from: { kind: 'Default', did: 'someDid' },
            currency: 'USD',
            per_share: 10000000,
            amount: 500000000000,
            remaining: 400000000000,
            reclaimed: false,
            payment_at: new Date('10/14/1987').getTime(),
            expires_at: null,
          })
        ),
        dsMockUtils.createMockOption(
          dsMockUtils.createMockDistribution({
            from: { kind: { User: dsMockUtils.createMockU64(2) }, did: 'someDid' },
            currency: 'CAD',
            per_share: 20000000,
            amount: 300000000000,
            remaining: 200000000000,
            reclaimed: false,
            payment_at: new Date('11/26/1989').getTime(),
            expires_at: null,
          })
        ),
        dsMockUtils.createMockOption(),
      ];

      dsMockUtils.createQueryStub('corporateAction', 'corporateActions', {
        entries: [
          [[rawTickers[0], dsMockUtils.createMockU32(1)], corporateActions[0]],
          [[rawTickers[1], dsMockUtils.createMockU32(2)], corporateActions[1]],
          [[rawTickers[1], dsMockUtils.createMockU32(3)], corporateActions[2]],
        ],
      });

      dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
        multi: distributions,
      });

      const stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');

      tickers.forEach((ticker, index) =>
        stringToTickerStub.withArgs(ticker, context).returns(rawTickers[index])
      );

      const result = await context.getDividendDistributionsForTokens({
        tokens: tickers.map(ticker => entityMockUtils.getSecurityTokenInstance({ ticker })),
      });

      expect(result.length).toBe(2);
      expect(result[0].details.fundsReclaimed).toBe(false);
      expect(result[0].details.remainingFunds).toEqual(new BigNumber(400000));
      expect(result[0].distribution.origin).toEqual(
        entityMockUtils.getDefaultPortfolioInstance({ did: 'someDid' })
      );
      expect(result[0].distribution.currency).toBe('USD');
      expect(result[0].distribution.perShare).toEqual(new BigNumber(10));
      expect(result[0].distribution.maxAmount).toEqual(new BigNumber(500000));
      expect(result[0].distribution.expiryDate).toBe(null);
      expect(result[0].distribution.paymentDate).toEqual(new Date('10/14/1987'));

      expect(result[1].details.fundsReclaimed).toBe(false);
      expect(result[1].details.remainingFunds).toEqual(new BigNumber(200000));
      expect(result[1].distribution.origin).toEqual(
        entityMockUtils.getNumberedPortfolioInstance({ did: 'someDid', id: new BigNumber(2) })
      );
      expect(result[1].distribution.currency).toBe('CAD');
      expect(result[1].distribution.perShare).toEqual(new BigNumber(20));
      expect(result[1].distribution.maxAmount).toEqual(new BigNumber(300000));
      expect(result[1].distribution.expiryDate).toBe(null);
      expect(result[1].distribution.paymentDate).toEqual(new Date('11/26/1989'));
    });
  });

  describe('method: clone', () => {
    test('should return a cloned instance', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        accountSeed: '0x6'.padEnd(66, '0'),
      });

      const cloned = context.clone();

      expect(cloned).toEqual(context);
    });
  });
});
