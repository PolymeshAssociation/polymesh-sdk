import { ImportMock } from 'ts-mock-imports';
import { Polymesh } from '~/Polymesh';
import sinon from 'sinon';
import * as contextModule from '~/Context';
import * as pokadotModule from '@polymathnetwork/polkadot/api';

describe('Polymesh Class', () => {
  const mockApiPromise = ImportMock.mockStaticClass(pokadotModule, 'ApiPromise');
  const mockWsProvider = ImportMock.mockClass(pokadotModule, 'WsProvider');
  const mockContext = ImportMock.mockStaticClass(contextModule, 'Context');

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

      await expect(polymeshApi).rejects.toThrow('Connection error');
    });

    test('should throw if Context create method fails', async () => {
      mockContext.mock('create').throws();

      const polymeshApi = Polymesh.connect({
        nodeUrl: 'wss',
        accountSeed: '',
      });

      await expect(polymeshApi).rejects.toThrow('Connection error');
    });
  });
});
