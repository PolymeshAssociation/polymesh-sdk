import * as polkadotModule from '@polymathnetwork/polkadot/api';
import { BigNumber } from 'bignumber.js';
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
    test('should instantiate ApiPromise and return a Polymesh instance', async () => {
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
    test('should throw if identity was not instantiated', async () => {
      polkadotMockFactory.initMocks({ mockContext: { withSeed: false } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wws',
      });

      await expect(polymesh.getPolyBalance()).rejects.toThrow(
        `You don't have an attached identity`
      );
    });

    test(`should return the identity's POLY balance`, async () => {
      const fakeBalance = new BigNumber(20);
      polkadotMockFactory.initMocks({ mockContext: { withSeed: true, balance: fakeBalance } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wws',
        accountSeed: 'seed',
      });

      const result = await polymesh.getPolyBalance();
      expect(result).toEqual(fakeBalance);
    });
  });
});
