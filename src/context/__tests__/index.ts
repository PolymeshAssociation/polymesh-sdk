import sinon from 'sinon';

import { Identity } from '~/api/entities';
import { Context } from '~/context';
import { polkadotMockUtils } from '~/testUtils/mocks';
import { balanceToBigNumber } from '~/utils';

jest.mock(
  '@polkadot/api',
  require('~/testUtils/mocks/polkadot').mockPolkadotModule('@polkadot/api')
);

describe('Context class', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('should throw an error if accessing the transaction submodule without an active account', async () => {
    const context = await Context.create({
      polymeshApi: polkadotMockUtils.getApiInstance(),
    });

    expect(() => context.polymeshApi.tx).toThrow(
      'Cannot perform transactions without an active account'
    );
  });

  describe('method: create', () => {
    test('should throw if seed parameter is not a 32 length string', async () => {
      const context = Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
        seed: 'abc',
      });

      return expect(context).rejects.toThrow(new Error('Seed must be 32 characters in length'));
    });

    test('should create a Context class from a seed with Pair and Identity attached', async () => {
      const newPair = {
        address: 'someAddress1',
        meta: {},
      };
      polkadotMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: newPair,
        },
      });
      const keyToIdentityIdsStub = polkadotMockUtils.createQueryStub(
        'identity',
        'keyToIdentityIds',
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        { returnValue: { unwrap: () => ({ asUnique: '012abc' }) } }
      );

      const context = await Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      sinon.assert.calledOnce(keyToIdentityIdsStub);
      expect(context.currentPair).toEqual(newPair);
      sinon.assert.match(context.getCurrentIdentity() instanceof Identity, true);
    });

    test('should create a Context class from a keyring with Pair and Identity attached', async () => {
      const pairs = [{ address: 'someAddress', meta: {} }];
      polkadotMockUtils.configureMocks({
        keyringOptions: {
          getPairs: pairs,
        },
      });
      const keyToIdentityIdsStub = polkadotMockUtils.createQueryStub(
        'identity',
        'keyToIdentityIds',
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        { returnValue: { unwrap: () => ({ asUnique: '012abc' }) } }
      );

      const context = await Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
        keyring: polkadotMockUtils.getKeyringInstance(),
      });

      sinon.assert.calledOnce(keyToIdentityIdsStub);
      expect(context.currentPair).toEqual(pairs[0]);
      sinon.assert.match(context.getCurrentIdentity() instanceof Identity, true);
    });

    test('should create a Context class from a uri with Pair and Identity attached', async () => {
      const newPair = {
        address: 'someAddress',
        meta: {},
      };
      polkadotMockUtils.configureMocks({
        keyringOptions: {
          addFromUri: newPair,
        },
      });
      const keyToIdentityIdsStub = polkadotMockUtils.createQueryStub(
        'identity',
        'keyToIdentityIds',
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        { returnValue: { unwrap: () => ({ asUnique: '012abc' }) } }
      );

      const context = await Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
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
      };
      polkadotMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: newPair,
        },
      });
      const keyToIdentityIdsStub = polkadotMockUtils.createQueryStub(
        'identity',
        'keyToIdentityIds',
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        { returnValue: { unwrap: () => ({ asUnique: '012abc' }) } }
      );

      const context = await Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
      });

      sinon.assert.notCalled(keyToIdentityIdsStub);
      expect(context.currentPair).toBe(undefined);
      expect(() => context.getCurrentIdentity()).toThrow();
    });

    test('should throw if the account seed is not assotiated with an IdentityId ', () => {
      const newPair = {
        address: 'someAddress',
        meta: {},
      };
      polkadotMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: newPair,
        },
      });
      polkadotMockUtils.createQueryStub('identity', 'keyToIdentityIds');

      const context = Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      expect(context).rejects.toThrow(new Error('There is no Identity associated to this account'));
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
        },
        {
          address: '02',
          meta: {},
          somethingElse: false,
        },
      ];
      polkadotMockUtils.configureMocks({
        keyringOptions: {
          getPairs: pairs,
        },
      });

      const context = await Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
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
      polkadotMockUtils.configureMocks({
        keyringOptions: {
          error: true,
        },
      });
      const context = await Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
      });

      expect(() => context.setPair('012')).toThrow('The address is not present in the keyring set');
    });

    test('should set currentPair to the new value', async () => {
      const newPair = {
        address: 'someAddress',
        meta: {},
      };
      polkadotMockUtils.configureMocks({
        keyringOptions: {
          getPair: newPair,
        },
      });

      const context = await Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
      });

      context.setPair('012');
      expect(context.currentPair).toEqual(newPair);
    });
  });

  describe('method: accountBalance', () => {
    test('should throw if accountId or currentPair is not set', async () => {
      const context = await Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
      });

      expect(context.accountBalance()).rejects.toThrow(
        'There is no account associated with the SDK'
      );
    });

    test('should return the account POLYX balance if currentPair is set', async () => {
      const freeBalance = polkadotMockUtils.createMockBalance(100);
      const returnValue = polkadotMockUtils.createMockAccountData({
        free: freeBalance,
        reserved: polkadotMockUtils.createMockBalance(),
        miscFrozen: polkadotMockUtils.createMockBalance(),
        feeFrozen: polkadotMockUtils.createMockBalance(),
      });
      polkadotMockUtils.createQueryStub(
        'identity',
        'keyToIdentityIds',
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        { returnValue: { unwrap: () => ({ asUnique: '012abc' }) } }
      );
      polkadotMockUtils.createQueryStub('balances', 'account', { returnValue });

      const context = await Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const result = await context.accountBalance();
      expect(result).toEqual(balanceToBigNumber(freeBalance));
    });

    test('should return the account POLYX balance if accountId is set', async () => {
      const freeBalance = polkadotMockUtils.createMockBalance(100);
      const returnValue = polkadotMockUtils.createMockAccountData({
        free: freeBalance,
        reserved: polkadotMockUtils.createMockBalance(),
        miscFrozen: polkadotMockUtils.createMockBalance(),
        feeFrozen: polkadotMockUtils.createMockBalance(),
      });
      polkadotMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: {
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          unwrap: () => ({ asUnique: '012abc' }),
        },
      });
      polkadotMockUtils.createQueryStub('balances', 'account', { returnValue });

      const context = await Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const result = await context.accountBalance('accountId');
      expect(result).toEqual(balanceToBigNumber(freeBalance));
    });
  });

  describe('method: getCurrentIdentity', () => {
    test('should return the current identity', async () => {
      const did = '012abc';
      polkadotMockUtils.createQueryStub(
        'identity',
        'keyToIdentityIds',
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        { returnValue: { unwrap: () => ({ asUnique: did }) } }
      );

      const context = await Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const result = context.getCurrentIdentity();
      expect(result.did).toBe(did);
    });

    test("should throw an error if the current identity isn't defined", async () => {
      const context = await Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
      });

      expect(() => context.getCurrentIdentity()).toThrow(
        'The current account does not have an associated identity'
      );
    });
  });
});
