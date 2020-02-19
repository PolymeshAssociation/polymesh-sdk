import * as polkadotModule from '@polymathnetwork/polkadot/api';
import sinon from 'sinon';
import { ImportMock, MockManager } from 'ts-mock-imports';

import { Polymesh } from '~/Polymesh';
import { PolkadotMockFactory } from '~/testUtils/mocks';

describe('Polymesh Class', () => {
  const polkadotMockFactory = new PolkadotMockFactory();
  polkadotMockFactory.initMocks({ mockContext: true });

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
    test('should instantiate ApiPromise lib and Context class and returns a Polymesh instance', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: '',
      });

      expect(polymesh.context).toBeDefined();
      expect(polymesh.context.polymeshApi).toBeDefined();
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
});
