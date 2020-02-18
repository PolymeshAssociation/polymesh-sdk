import * as polkadotModule from '@polymathnetwork/polkadot/api';
import sinon from 'sinon';
import { ImportMock, MockManager, StaticMockManager } from 'ts-mock-imports';

import * as contextModule from '~/Context';
import { Polymesh } from '~/Polymesh';

describe('Polymesh Class', () => {
  let mockApiPromise: StaticMockManager<polkadotModule.Keyring>;
  let mockWsProvider: MockManager<polkadotModule.Keyring>;
  let mockContext: StaticMockManager<contextModule.Context>;

  beforeEach(() => {
    mockApiPromise = ImportMock.mockStaticClass(polkadotModule, 'ApiPromise');
    mockWsProvider = ImportMock.mockClass(polkadotModule, 'WsProvider');
    mockContext = ImportMock.mockStaticClass(contextModule, 'Context');
  });

  afterEach(() => {
    mockApiPromise.restore();
    mockWsProvider.restore();
    mockContext.restore();
  });

  describe('method: create', () => {
    test('should instantiate ApiPromise lib and Context class and returns a Polymesh instance', async () => {
      const apiPromiseCreateMock = mockApiPromise.mock('create', Promise.resolve(true));
      const contextCreateMock = mockContext.mock('create', Promise.resolve(false));

      const polymesh = await Polymesh.connect({
        nodeUrl: '',
      });

      sinon.assert.calledOnce(apiPromiseCreateMock);
      sinon.assert.calledOnce(contextCreateMock);
      sinon.assert.match(polymesh instanceof Polymesh, true);
    });

    test('should throw if ApiPromise fails in the connection process', async () => {
      mockApiPromise.mock('create').throws();

      const polymeshApi = Polymesh.connect({
        nodeUrl: 'wss',
      });

      await expect(polymeshApi).rejects.toThrow(`Error while connecting to "wss": "Error"`);
    });

    test('should throw if Context create method fails', async () => {
      mockContext.mock('create').throws();

      const polymeshApi = Polymesh.connect({
        nodeUrl: 'wss',
        accountSeed: '',
      });

      await expect(polymeshApi).rejects.toThrow(`Error while connecting to "wss": "Error"`);
    });
  });
});
