import * as polkadotModule from '@polymathnetwork/polkadot/api';
import sinon from 'sinon';
import { ImportMock, MockManager } from 'ts-mock-imports';

import { Polymesh } from '~/Polymesh';
import { PolkadotMockFactory } from '~/testUtils/mocks';

describe('Polymesh Class', () => {
  const polkadotMockFactory = new PolkadotMockFactory();
  polkadotMockFactory.initMocks({ mockContext: {} });
  let mockWsProvider: MockManager<polkadotModule.Keyring>;

  beforeEach(() => {
    mockWsProvider = ImportMock.mockClass(polkadotModule, 'WsProvider');
  });

  afterEach(() => {
    polkadotMockFactory.reset();
    mockWsProvider.restore();
  });

  afterAll(() => {
    polkadotMockFactory.cleanup();
  });

  describe('method: create', () => {
    test('should instantiate ApiPromise and returns a Polymesh instance', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: '',
      });

      sinon.assert.match(polymesh instanceof Polymesh, true);
    });

    test('should throw if ApiPromise fails in the connection process', async () => {
      polkadotMockFactory.throwOnApiCreation();
      const polymeshApiPromise = Polymesh.connect({
        nodeUrl: 'wss',
      });

      await expect(polymeshApiPromise).rejects.toThrow(`Error while connecting to "wss": "Error"`);
    });

    test('should throw if Context create method fails', async () => {
      polkadotMockFactory.throwOnContextCreation();
      const polymeshApiPromise = Polymesh.connect({
        nodeUrl: 'wss',
        accountSeed: '',
      });

      await expect(polymeshApiPromise).rejects.toThrow(`Error while connecting to "wss": "Error"`);
    });
  });

  describe('method: getPolyBalance', () => {
    test('should return undefined if the identity was not instantiated', async () => {
      polkadotMockFactory.initMocks({ mockContext: {} });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wws',
      });

      const balance = await polymesh.getPolyBalance();
      expect(balance).toBeUndefined();
    });

    test('should return the identity Poly balance', async () => {
      polkadotMockFactory.initMocks({ mockContext: { seed: true } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wws',
        accountSeed: 'seed',
      });

      const balance = await polymesh.getPolyBalance();
      expect(balance).toBeDefined();
    });
  });
});
