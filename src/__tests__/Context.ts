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

  test('should throw if accountSeed parameter is not a 32 lenght string', async () => {
    const context = Context.create({
      polymeshApi: apiPromise.getMockInstance(),
      accountSeed: 'abc',
    });

    await expect(context).rejects.toThrow(new Error('Seed must be 32 length size'));
  });

  test('should create a Context class with Pair and Identity attached', async () => {
    const keyToIdentityIds = jest.fn(() => true);
    const keyringAddFromSeedMock = mockKeyring.mock('addFromSeed', true);
    apiPromise.set('query', {
      identity: {
        keyToIdentityIds: keyToIdentityIds,
      },
    });

    const context = await Context.create({
      polymeshApi: apiPromise.getMockInstance(),
      accountSeed: 'Alice'.padEnd(32, ' '),
    });

    sinon.assert.calledOnce(keyringAddFromSeedMock);
    expect(keyToIdentityIds).toBeCalled();
    expect(context.currentPair).toBe(true);
    sinon.assert.match(context.currentIdentity instanceof identityModule.Identity, true);
  });

  test('should create a Context class without Pair and Identity attached', async () => {
    const keyToIdentityIds = jest.fn(() => true);
    const keyringAddFromSeedMock = mockKeyring.mock('addFromSeed', true);
    apiPromise.set('query', {
      identity: {
        keyToIdentityIds: keyToIdentityIds,
      },
    });

    const context = await Context.create({
      polymeshApi: apiPromise.getMockInstance(),
    });

    sinon.assert.notCalled(keyringAddFromSeedMock);
    expect(keyToIdentityIds).not.toBeCalled();
    expect(context.currentPair).toBe(undefined);
    expect(context.currentIdentity).toBe(undefined);
  });

  test('should getAddresses method retrieve an array of address and meta data', async () => {
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
        meta: {
          name: 'name 02',
        },
        somethingelse: false,
      },
    ];
    const keyringGetAddressesMock = mockKeyring.mock('getPairs', addresses);

    const context = await Context.create({
      polymeshApi: apiPromise.getMockInstance(),
    });

    const result = context.getAddresses();
    sinon.assert.calledOnce(keyringGetAddressesMock);
    expect(result[0].address).toBe('01');
    expect(result[1].address).toBe('02');
    expect(result[0].meta.name).toBe('name 01');
    expect(result[1].meta.name).toBe('name 02');
  });

  test('throw error if the pair does not exist in the keyrign set', async () => {
    mockKeyring
      .mock('getPair')
      .withArgs('012')
      .throws();
    const context = await Context.create({
      polymeshApi: apiPromise.getMockInstance(),
    });

    try {
      context.setPair('012');
      sinon.assert.fail();
    } catch (e) {}
  });

  test('should set a new currentPair', async () => {
    const keyringGetPairMock = mockKeyring.mock('getPair', true).withArgs('012');

    const context = await Context.create({
      polymeshApi: apiPromise.getMockInstance(),
    });

    try {
      context.setPair('012');
      sinon.assert.calledOnce(keyringGetPairMock);
    } catch (e) {
      sinon.assert.fail();
    }
  });
});
