import sinon from 'sinon';
import { Context } from '~/Context';
import { ImportMock, MockManager } from 'ts-mock-imports';
import * as polkadotModule from '@polymathnetwork/polkadot/api';
import * as identityModule from '~/api/entities/Identity';
import { QueryableStorage } from '@polymathnetwork/polkadot/api/types';

describe('Context class', () => {
  let mockKeyring: MockManager<polkadotModule.Keyring>;
  let mockApiPromise: MockManager<polkadotModule.ApiPromise>;

  beforeEach(() => {
    mockKeyring = ImportMock.mockClass(polkadotModule, 'Keyring');
    mockApiPromise = ImportMock.mockClass<polkadotModule.ApiPromise>(polkadotModule, 'ApiPromise');
  });

  afterEach(() => {
    mockKeyring.restore();
    mockApiPromise.restore();
  });

  describe('method: create', () => {
    test('should throw if accountSeed parameter is not a 32 length string', async () => {
      const context = Context.create({
        polymeshApi: mockApiPromise.getMockInstance(),
        accountSeed: 'abc',
      });

      await expect(context).rejects.toThrow(new Error('Seed must be 32 characters in length'));
    });

    test('should create a Context class with Pair and Identity attached', async () => {
      const keyToIdentityIdsStub = sinon.stub().returns({
        unwrap: () => {
          return { asUnique: '012abc' };
        },
      });
      const keyringAddFromSeedStub = mockKeyring.mock('addFromSeed', 'currentPair');
      mockApiPromise.set('query', ({
        identity: {
          keyToIdentityIds: keyToIdentityIdsStub,
        },
      } as unknown) as QueryableStorage<'promise'>);

      const context = await Context.create({
        polymeshApi: mockApiPromise.getMockInstance(),
        accountSeed: 'Alice'.padEnd(32, ' '),
      });

      sinon.assert.calledOnce(keyringAddFromSeedStub);
      sinon.assert.calledOnce(keyToIdentityIdsStub);
      expect(context.currentPair).toEqual('currentPair');
      sinon.assert.match(context.currentIdentity instanceof identityModule.Identity, true);
    });

    test('should create a Context class without Pair and Identity attached', async () => {
      const keyToIdentityIdsStub = sinon.stub().returns('identityId');
      const keyringAddFromSeedMock = mockKeyring.mock('addFromSeed', true);
      mockApiPromise.set('query', ({
        identity: {
          keyToIdentityIds: keyToIdentityIdsStub,
        },
      } as unknown) as QueryableStorage<'promise'>);

      const context = await Context.create({
        polymeshApi: mockApiPromise.getMockInstance(),
      });

      sinon.assert.notCalled(keyringAddFromSeedMock);
      sinon.assert.notCalled(keyToIdentityIdsStub);
      expect(context.currentPair).toBe(undefined);
      expect(context.currentIdentity).toBe(undefined);
    });

    test('should throw if the account seed is not assotiated with an IdentityId ', async () => {
      const keyToIdentityIdsStub = sinon.stub().returns({
        unwrap: sinon.stub().throws(),
      });
      mockKeyring.mock('addFromSeed', 'currentPair');
      mockApiPromise.set('query', ({
        identity: {
          keyToIdentityIds: keyToIdentityIdsStub,
        },
      } as unknown) as QueryableStorage<'promise'>);

      const context = Context.create({
        polymeshApi: mockApiPromise.getMockInstance(),
        accountSeed: 'Alice'.padEnd(32, ' '),
      });

      await expect(context).rejects.toThrow(new Error('Identity ID does not exist'));
    });
  });

  describe('method: getAccounts', () => {
    test('should retrieve an array of address and meta data', async () => {
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
        polymeshApi: mockApiPromise.getMockInstance(),
      });

      const result = context.getAccounts();
      sinon.assert.calledOnce(keyringGetAccountsStub);
      expect(result[0].address).toBe('01');
      expect(result[1].address).toBe('02');
      expect(result[0].name).toBe('name 01');
      expect(result[1].name).toBe(undefined);
    });
  });

  describe('method: getPair', () => {
    test('should throw error if the pair does not exist in the keyring set', async () => {
      mockKeyring
        .mock('getPair')
        .withArgs('012')
        .throws();
      const context = await Context.create({
        polymeshApi: mockApiPromise.getMockInstance(),
      });

      expect(() => context.setPair('012')).toThrow('The address is not present in the keyring set');
    });

    test('should expect currentPair to be set to the new value', async () => {
      const keyringGetPairStub = mockKeyring.mock('getPair', true);

      const context = await Context.create({
        polymeshApi: mockApiPromise.getMockInstance(),
      });

      context.setPair('012');
      sinon.assert.calledOnce(keyringGetPairStub);
    });
  });
});
