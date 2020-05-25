import sinon from 'sinon';

import { Identity } from '~/api/entities';
import { Context } from '~/context';
import { apolloMockUtils, dsMockUtils } from '~/testUtils/mocks';
import * as utilsModule from '~/utils';

jest.mock(
  '@polkadot/api',
  require('~/testUtils/mocks/dataSources').mockPolkadotModule('@polkadot/api')
);

// TODO: refactor tests (too much repeated code)
describe('Context class', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
    apolloMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should throw an error if accessing the transaction submodule without an active account', async () => {
    const context = await Context.create({
      polymeshApi: dsMockUtils.getApiInstance(),
      harvesterClient: apolloMockUtils.getHarvesterClient(),
    });

    expect(() => context.polymeshApi.tx).toThrow(
      'Cannot perform transactions without an active account'
    );
  });

  describe('method: create', () => {
    test('should throw if seed parameter is not a 32 length string', async () => {
      const context = Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        harvesterClient: apolloMockUtils.getHarvesterClient(),
        seed: 'abc',
      });

      return expect(context).rejects.toThrow(new Error('Seed must be 32 characters in length'));
    });

    test('should create a Context class from a seed with Pair and Identity attached', async () => {
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
      const keyToIdentityIdsStub = dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        harvesterClient: apolloMockUtils.getHarvesterClient(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      sinon.assert.calledOnce(keyToIdentityIdsStub);
      expect(context.currentPair).toEqual(newPair);
      sinon.assert.match(context.getCurrentIdentity() instanceof Identity, true);
    });

    test('should create a Context class from a keyring with Pair and Identity attached', async () => {
      const pairs = [{ address: 'someAddress', meta: {}, publicKey: 'publicKey' }];
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: pairs,
        },
      });
      const keyToIdentityIdsStub = dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        harvesterClient: apolloMockUtils.getHarvesterClient(),
        keyring: dsMockUtils.getKeyringInstance(),
      });

      sinon.assert.calledOnce(keyToIdentityIdsStub);
      expect(context.currentPair).toEqual(pairs[0]);
      sinon.assert.match(context.getCurrentIdentity() instanceof Identity, true);
    });

    test('should create a Context class from a uri with Pair and Identity attached', async () => {
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
      const keyToIdentityIdsStub = dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        harvesterClient: apolloMockUtils.getHarvesterClient(),
        uri: '//Alice',
      });

      sinon.assert.calledOnce(keyToIdentityIdsStub);
      expect(context.currentPair).toEqual(newPair);
      sinon.assert.match(context.getCurrentIdentity() instanceof Identity, true);
    });

    test('should create a Context class without Pair and Identity attached', async () => {
      const newPair = {
        address: 'someAddress',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: newPair,
        },
      });
      const keyToIdentityIdsStub = dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        harvesterClient: apolloMockUtils.getHarvesterClient(),
      });

      sinon.assert.notCalled(keyToIdentityIdsStub);
      expect(context.currentPair).toBe(undefined);
      expect(() => context.getCurrentIdentity()).toThrow();
    });

    test('should throw if the account seed is not assotiated with an IdentityId ', () => {
      const newPair = {
        address: 'someAddress',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: newPair,
        },
      });
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds');

      const context = Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        harvesterClient: apolloMockUtils.getHarvesterClient(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      return expect(context).rejects.toThrow(
        new Error('There is no Identity associated to this account')
      );
    });
  });

  describe('method: getAccounts', () => {
    test('should retrieve an array of addresses and metadata', async () => {
      const pairs = [
        {
          address: '01',
          meta: {
            name: 'name 01',
          },
          somethingElse: false,
          publicKey: 'publicKey',
        },
        {
          address: '02',
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
        harvesterClient: apolloMockUtils.getHarvesterClient(),
      });

      const result = context.getAccounts();
      expect(result[0].address).toBe(pairs[0].address);
      expect(result[1].address).toBe(pairs[1].address);
      expect(result[0].name).toBe(pairs[0].meta.name);
      expect(result[1].name).toBe(undefined);
    });
  });

  describe('method: setPair', () => {
    test('should throw error if the pair does not exist in the keyring set', async () => {
      dsMockUtils.configureMocks({
        keyringOptions: {
          error: true,
        },
      });
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        harvesterClient: apolloMockUtils.getHarvesterClient(),
      });

      await expect(context.setPair('012')).rejects.toThrow(
        'The address is not present in the keyring set'
      );
    });

    test("should throw error if the address doesn't have an associated identity", async () => {
      const publicKey = 'publicKey';
      const newPublicKey = 'newPublicKey';
      const newAddress = 'newAddress';
      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: {
            address: 'address',
            meta: {},
            publicKey,
          },
          getPair: {
            address: newAddress,
            meta: {},
            publicKey: newPublicKey,
          },
        },
      });

      dsMockUtils
        .createQueryStub('identity', 'keyToIdentityIds')
        .withArgs(publicKey)
        .returns(
          dsMockUtils.createMockOption(
            dsMockUtils.createMockLinkedKeyInfo({
              Unique: dsMockUtils.createMockIdentityId('currentIdentityId'),
            })
          )
        );

      dsMockUtils
        .createQueryStub('identity', 'keyToIdentityIds')
        .withArgs(newPublicKey)
        .returns(dsMockUtils.createMockOption());

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        harvesterClient: apolloMockUtils.getHarvesterClient(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      await expect(context.setPair(newAddress)).rejects.toThrow(
        'There is no Identity associated to this account'
      );
    });

    test('should set new values for currentPair and getCurrentIdentity', async () => {
      const publicKey = 'publicKey';
      const newPublicKey = 'newPublicKey';
      const newAddress = 'newAddress';
      const newIdentityId = 'newIdentityId';
      const accountKey = dsMockUtils.createMockAccountKey(newAddress);
      const newCurrentPair = {
        address: newAddress,
        meta: {},
        publicKey: newPublicKey,
      };

      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: {
            address: 'address',
            meta: {},
            publicKey,
          },
          getPair: newCurrentPair,
        },
      });

      dsMockUtils
        .createQueryStub('identity', 'keyToIdentityIds')
        .withArgs(publicKey)
        .returns(
          dsMockUtils.createMockOption(
            dsMockUtils.createMockLinkedKeyInfo({
              Unique: dsMockUtils.createMockIdentityId('currentIdentityId'),
            })
          )
        );

      dsMockUtils
        .createQueryStub('identity', 'keyToIdentityIds')
        .withArgs(accountKey)
        .returns(
          dsMockUtils.createMockOption(
            dsMockUtils.createMockLinkedKeyInfo({
              Unique: dsMockUtils.createMockIdentityId(newIdentityId),
            })
          )
        );

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        harvesterClient: apolloMockUtils.getHarvesterClient(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      sinon
        .stub(utilsModule, 'stringToAccountKey')
        .withArgs(newAddress, context)
        .returns(accountKey);

      await context.setPair('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');

      expect(context.currentPair).toEqual(newCurrentPair);
      expect(context.getCurrentIdentity().did).toEqual(newIdentityId);
    });
  });

  describe('method: accountBalance', () => {
    test('should throw if accountId or currentPair is not set', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        harvesterClient: apolloMockUtils.getHarvesterClient(),
      });

      expect(context.accountBalance()).rejects.toThrow(
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
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });
      dsMockUtils.createQueryStub('system', 'account', { returnValue });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        harvesterClient: apolloMockUtils.getHarvesterClient(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const result = await context.accountBalance();
      expect(result).toEqual(utilsModule.balanceToBigNumber(freeBalance));
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
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });
      dsMockUtils.createQueryStub('system', 'account', { returnValue });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        harvesterClient: apolloMockUtils.getHarvesterClient(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const result = await context.accountBalance('accountId');
      expect(result).toEqual(utilsModule.balanceToBigNumber(freeBalance));
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';

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
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });
      dsMockUtils.createQueryStub('system', 'account').callsFake(async (_, cbFunc) => {
        cbFunc(returnValue);
        return unsubCallback;
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        harvesterClient: apolloMockUtils.getHarvesterClient(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const callback = sinon.stub();
      const result = await context.accountBalance('accountId', callback);

      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(callback, utilsModule.balanceToBigNumber(freeBalance));
    });
  });

  describe('method: getCurrentIdentity', () => {
    test('should return the current identity', async () => {
      const did = 'someDid';
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId(did),
          })
        ),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        harvesterClient: apolloMockUtils.getHarvesterClient(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const result = context.getCurrentIdentity();
      expect(result.did).toBe(did);
    });

    test("should throw an error if the current identity isn't defined", async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        harvesterClient: apolloMockUtils.getHarvesterClient(),
      });

      expect(() => context.getCurrentIdentity()).toThrow(
        'The current account does not have an associated identity'
      );
    });
  });

  describe('method: getCurrentPair', () => {
    test('should return the current keyring pair', async () => {
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
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        harvesterClient: apolloMockUtils.getHarvesterClient(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const result = context.getCurrentPair();

      expect(result).toBe(pair);
    });

    test("should throw an error if the current pair isn't defined", async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        harvesterClient: apolloMockUtils.getHarvesterClient(),
      });

      expect(() => context.getCurrentPair()).toThrow(
        'There is no account associated with the current SDK instance'
      );
    });
  });
});
