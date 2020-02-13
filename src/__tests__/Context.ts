import sinon from 'sinon';
import { Context } from '~/Context';
import { ImportMock } from 'ts-mock-imports';
import * as polkadotModule from '@polymathnetwork/polkadot/api';
import * as apiPromiseModule from '@polymathnetwork/polkadot/api/promise';
import * as identityModule from '~/api/entities/Identity';

describe('Context Class', () => {
  const mockKeyring = ImportMock.mockClass(polkadotModule, 'Keyring');
  const mockApiPromise = ImportMock.mockClass(polkadotModule, 'ApiPromise');
  const apiPromise = ImportMock.mockStaticClass(apiPromiseModule, 'default');
  const mockIdentity = ImportMock.mockClass(identityModule, 'Identity');

  afterAll(() => {
    mockKeyring.restore();
    mockApiPromise.restore();
    apiPromise.restore();
    mockIdentity.restore();
  });

  describe('method: create', () => {
    test('should throw if accountSeed parameter is not a 32 lenght string', async () => {
      const context = Context.create({
        polymeshApi: apiPromise.getMockInstance(),
        accountSeed: 'abc',
      });

      await expect(context).rejects.toThrow(new Error('Seed must be 32 length size'));
    });

    test('should create a Context class with Pair and Identity attached', async () => {
      const keyToIdentityIdsStub = sinon.stub().returns('identityId');
      const keyringAddFromSeedStub = mockKeyring.mock('addFromSeed', 'currentPair');
      apiPromise.set('query', {
        identity: {
          keyToIdentityIds: keyToIdentityIdsStub,
        },
      });

      const context = await Context.create({
        polymeshApi: apiPromise.getMockInstance(),
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
      apiPromise.set('query', {
        identity: {
          keyToIdentityIds: keyToIdentityIdsStub,
        },
      });

      const context = await Context.create({
        polymeshApi: apiPromise.getMockInstance(),
      });

      sinon.assert.notCalled(keyringAddFromSeedMock);
      sinon.assert.notCalled(keyToIdentityIdsStub);
      expect(context.currentPair).toBe(undefined);
      expect(context.currentIdentity).toBe(undefined);
    });
  });

  describe('method: getAccounts', () => {
    test('should getAccounts method retrieve an array of address and meta data', async () => {
      const addresses = [
        {
          address: '01',
          meta: {
            name: 'name 01',
          },
          somethingelse: false,
        },
        {
          address: '02',
          meta: {},
          somethingelse: false,
        },
      ];
      const keyringGetAccountsStub = mockKeyring.mock('getPairs', addresses);

      const context = await Context.create({
        polymeshApi: apiPromise.getMockInstance(),
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
        polymeshApi: apiPromise.getMockInstance(),
      });

      expect(() => context.setPair('012')).toThrow('The address is not present in the keyring set');
    });

    test('should expect currentPair to be set to the new value', async () => {
      const keyringGetPairStub = mockKeyring.mock('getPair', true);

      const context = await Context.create({
        polymeshApi: apiPromise.getMockInstance(),
      });

      context.setPair('012');
      sinon.assert.calledOnce(keyringGetPairStub);
    });
  });
});
