import { Balance } from '@polkadot/types/interfaces';
import sinon from 'sinon';

import { Identity } from '~/api/entities';
import { Context } from '~/context';
import { polkadotMockUtils } from '~/testUtils/mocks';
import * as utilsModule from '~/utils';

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
        publicKey: 'publicKey',
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
      const pairs = [{ address: 'someAddress', meta: {}, publicKey: 'publicKey' }];
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
        publicKey: 'publicKey',
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
        publicKey: 'publicKey',
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
        publicKey: 'publicKey',
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
          publicKey: 'publicKey',
        },
        {
          address: '02',
          meta: {},
          somethingElse: false,
          publicKey: 'publicKey',
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

      await expect(context.setPair('012')).rejects.toThrow(
        'The address is not present in the keyring set'
      );
    });

    test("should throw error if the address doesn't have an associated identity", async () => {
      const publicKey = 'publicKey';
      const newPublicKey = 'newPublicKey';
      const newAddress = 'newAddress';
      polkadotMockUtils.configureMocks({
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

      polkadotMockUtils
        .createQueryStub('identity', 'keyToIdentityIds')
        .withArgs(publicKey)
        .returns(
          polkadotMockUtils.createMockOption(
            polkadotMockUtils.createMockLinkedKeyInfo({
              Unique: polkadotMockUtils.createMockIdentityId('currentIdentityId'),
            })
          )
        );

      polkadotMockUtils
        .createQueryStub('identity', 'keyToIdentityIds')
        .withArgs(newPublicKey)
        .returns(polkadotMockUtils.createMockOption());

      const context = await Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
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
      const accountKey = polkadotMockUtils.createMockAccountKey(newAddress);
      const newCurrentPair = {
        address: newAddress,
        meta: {},
        publicKey: newPublicKey,
      };

      polkadotMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: {
            address: 'address',
            meta: {},
            publicKey,
          },
          getPair: newCurrentPair,
        },
      });

      polkadotMockUtils
        .createQueryStub('identity', 'keyToIdentityIds')
        .withArgs(publicKey)
        .returns(
          polkadotMockUtils.createMockOption(
            polkadotMockUtils.createMockLinkedKeyInfo({
              Unique: polkadotMockUtils.createMockIdentityId('currentIdentityId'),
            })
          )
        );

      polkadotMockUtils
        .createQueryStub('identity', 'keyToIdentityIds')
        .withArgs(accountKey)
        .returns(
          polkadotMockUtils.createMockOption(
            polkadotMockUtils.createMockLinkedKeyInfo({
              Unique: polkadotMockUtils.createMockIdentityId(newIdentityId),
            })
          )
        );

      const context = await Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
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
        polymeshApi: polkadotMockUtils.getApiInstance(),
      });

      expect(context.accountBalance()).rejects.toThrow(
        'There is no account associated with the SDK'
      );
    });

    test('should return the account POLYX balance if currentPair is set', async () => {
      const returnValue = (100 as unknown) as Balance;
      polkadotMockUtils.createQueryStub(
        'identity',
        'keyToIdentityIds',
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        { returnValue: { unwrap: () => ({ asUnique: '012abc' }) } }
      );
      polkadotMockUtils.createQueryStub('balances', 'freeBalance', { returnValue });

      const context = await Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const result = await context.accountBalance();
      expect(result).toEqual(utilsModule.balanceToBigNumber(returnValue));
    });

    test('should return the account POLYX balance if accountId is set', async () => {
      const returnValue = (100 as unknown) as Balance;
      polkadotMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: {
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          unwrap: () => ({ asUnique: '012abc' }),
        },
      });
      polkadotMockUtils.createQueryStub('balances', 'freeBalance', { returnValue });

      const context = await Context.create({
        polymeshApi: polkadotMockUtils.getApiInstance(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const result = await context.accountBalance('accountId');
      expect(result).toEqual(utilsModule.balanceToBigNumber(returnValue));
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
