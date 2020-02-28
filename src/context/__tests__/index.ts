import * as polkadotModule from '@polymathnetwork/polkadot/api';
import { Balance } from '@polymathnetwork/polkadot/types/interfaces';
import sinon from 'sinon';
import { ImportMock, MockManager } from 'ts-mock-imports';

import * as identityModule from '~/api/entities';
import { Context } from '~/context';
import { PolkadotMockFactory } from '~/testUtils/mocks';
import { balanceToBigNumber } from '~/utils';

describe('Context class', () => {
  let mockKeyring: MockManager<polkadotModule.Keyring>;
  const polkadotMockFactory = new PolkadotMockFactory();

  polkadotMockFactory.initMocks();

  beforeEach(() => {
    mockKeyring = ImportMock.mockClass<polkadotModule.Keyring>(polkadotModule, 'Keyring');
  });

  afterEach(() => {
    mockKeyring.restore();
    polkadotMockFactory.reset();
  });

  afterAll(() => {
    polkadotMockFactory.cleanup();
  });

  test('should throw an error if accessing the transaction submodule without an active account', async () => {
    const context = await Context.create({
      polymeshApi: polkadotMockFactory.getApiInstance(),
    });

    expect(() => context.polymeshApi.tx).toThrow(
      'Cannot perform transactions without an active account'
    );
  });

  describe('method: create', () => {
    test('should throw if accountSeed parameter is not a 32 length string', () => {
      const context = Context.create({
        polymeshApi: polkadotMockFactory.getApiInstance(),
        accountSeed: 'abc',
      });

      return expect(context).rejects.toThrow(new Error('Seed must be 32 characters in length'));
    });

    test('should create a Context class with Pair and Identity attached', async () => {
      const keyToIdentityIdsStub = polkadotMockFactory.createQueryStub(
        'identity',
        'keyToIdentityIds',
        { unwrap: () => ({ asUnique: '012abc' }) }
      );
      const keyringAddFromSeedStub = mockKeyring.mock('addFromSeed', 'currentPair');

      const context = await Context.create({
        polymeshApi: polkadotMockFactory.getApiInstance(),
        accountSeed: 'Alice'.padEnd(32, ' '),
      });

      sinon.assert.calledOnce(keyringAddFromSeedStub);
      sinon.assert.calledOnce(keyToIdentityIdsStub);
      expect(context.currentPair).toEqual('currentPair');
      sinon.assert.match(context.currentIdentity instanceof identityModule.Identity, true);
    });

    test('should create a Context class without Pair and Identity attached', async () => {
      const keyToIdentityIdsStub = polkadotMockFactory.createQueryStub(
        'identity',
        'keyToIdentityIds',
        { unwrap: () => ({ asUnique: '012abc' }) }
      );
      const keyringAddFromSeedStub = mockKeyring.mock('addFromSeed', 'currentPair');

      const context = await Context.create({
        polymeshApi: polkadotMockFactory.getApiInstance(),
      });

      sinon.assert.notCalled(keyToIdentityIdsStub);
      sinon.assert.notCalled(keyringAddFromSeedStub);
      expect(context.currentPair).toBe(undefined);
      expect(context.currentIdentity).toBe(undefined);
    });

    test('should throw if the account seed is not assotiated with an IdentityId ', () => {
      mockKeyring.mock('addFromSeed', 'currentPair');
      polkadotMockFactory.createQueryStub('identity', 'keyToIdentityIds');

      const contextPromise = Context.create({
        polymeshApi: polkadotMockFactory.getApiInstance(),
        accountSeed: 'Alice'.padEnd(32, ' '),
      });

      return expect(contextPromise).rejects.toThrow(new Error('Identity ID does not exist'));
    });
  });

  describe('method: getAccounts', () => {
    test('should retrieve an array of addresses and metadata', async () => {
      const addresses = [
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
      const keyringGetAccountsStub = mockKeyring.mock('getPairs', addresses);

      const context = await Context.create({
        polymeshApi: polkadotMockFactory.getApiInstance(),
      });

      const result = context.getAccounts();
      sinon.assert.calledOnce(keyringGetAccountsStub);
      expect(result[0].address).toBe('01');
      expect(result[1].address).toBe('02');
      expect(result[0].name).toBe('name 01');
      expect(result[1].name).toBe(undefined);
    });
  });

  describe('method: setPair', () => {
    test('should throw error if the pair does not exist in the keyring set', async () => {
      mockKeyring
        .mock('getPair')
        .withArgs('012')
        .throws();
      const context = await Context.create({
        polymeshApi: polkadotMockFactory.getApiInstance(),
      });

      expect(() => context.setPair('012')).toThrow('The address is not present in the keyring set');
    });

    test('should set currentPair to the new value', async () => {
      const newPair = { address: 'newAddress' };
      const keyringGetPairStub = mockKeyring.mock('getPair', newPair);

      const context = await Context.create({
        polymeshApi: polkadotMockFactory.getApiInstance(),
      });

      context.setPair('012');
      sinon.assert.calledOnce(keyringGetPairStub);
      expect(context.currentPair).toEqual(newPair);
    });
  });

  describe('method: accountBalance', () => {
    test('should throw if accountId or currentPair is not set', async () => {
      const context = await Context.create({
        polymeshApi: polkadotMockFactory.getApiInstance(),
      });

      expect(context.accountBalance()).rejects.toThrow(
        'There is no account associated with the SDK'
      );
    });

    test('should return the account POLY balance if currentPair is set', async () => {
      const fakeResult = (100 as unknown) as Balance;
      polkadotMockFactory.createQueryStub('identity', 'keyToIdentityIds', {
        unwrap: () => ({ asUnique: '012abc' }),
      });
      mockKeyring.mock('addFromSeed', 'currentPair').returns({
        address: 'address',
      });
      polkadotMockFactory.createQueryStub('balances', 'freeBalance', fakeResult);

      const context = await Context.create({
        polymeshApi: polkadotMockFactory.getApiInstance(),
        accountSeed: 'Alice'.padEnd(32, ' '),
      });

      const result = await context.accountBalance();
      expect(result).toEqual(balanceToBigNumber(fakeResult));
    });

    test('should return the account POLY balance if accountId is set', async () => {
      const fakeResult = (100 as unknown) as Balance;
      polkadotMockFactory.createQueryStub('identity', 'keyToIdentityIds', {
        unwrap: () => ({ asUnique: '012abc' }),
      });
      mockKeyring.mock('addFromSeed', 'currentPair').returns({
        address: undefined,
      });
      polkadotMockFactory.createQueryStub('balances', 'freeBalance', fakeResult);

      const context = await Context.create({
        polymeshApi: polkadotMockFactory.getApiInstance(),
        accountSeed: 'Alice'.padEnd(32, ' '),
      });

      const result = await context.accountBalance('accountId');
      expect(result).toEqual(balanceToBigNumber(fakeResult));
    });
  });
});
