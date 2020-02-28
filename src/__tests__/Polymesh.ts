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
    test('should instantiate Context and return a Polymesh instance', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: '',
      });

      sinon.assert.match(polymesh instanceof Polymesh, true);
    });

    test('should instantiate Context with a seed and return a Polymesh instance', async () => {
      const accountSeed = 'Alice'.padEnd(32, ' ');
      const createStub = polkadotMockFactory.getContextCreateStub();

      await Polymesh.connect({
        nodeUrl: '',
        accountSeed,
      });

      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, {
        polymeshApi: polkadotMockFactory.getApiInstance(),
        seed: accountSeed,
      });
    });

    test('should instantiate Context with a keyring and return a Polymesh instance', async () => {
      const keyring = {} as polkadotModule.Keyring;
      const createStub = polkadotMockFactory.getContextCreateStub();

      await Polymesh.connect({
        nodeUrl: '',
        keyring,
      });

      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, {
        polymeshApi: polkadotMockFactory.getApiInstance(),
        keyring,
      });
    });

    test('should instantiate Context with a uri and return a Polymesh instance', async () => {
      const accountUri = '//uri';
      const createStub = polkadotMockFactory.getContextCreateStub();

      await Polymesh.connect({
        nodeUrl: '',
        accountUri,
      });

      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, {
        polymeshApi: polkadotMockFactory.getApiInstance(),
        uri: accountUri,
      });
    });

    test('should throw if Context fails in the connection process', async () => {
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

  describe('method: getIdentityBalance', () => {
    test('should throw if identity was not instantiated', async () => {
      polkadotMockFactory.initMocks({ mockContext: { withSeed: false } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wws',
      });

      await expect(polymesh.getIdentityBalance()).rejects.toThrow(
        'The current account does not have an associated identity'
      );
    });

    test(`should return the identity's POLY balance`, async () => {
      const fakeBalance = new BigNumber(20);
      polkadotMockFactory.initMocks({ mockContext: { withSeed: true, balance: fakeBalance } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wws',
        accountSeed: 'seed',
      });

      const result = await polymesh.getIdentityBalance();
      expect(result).toEqual(fakeBalance);
    });
  });

  describe('method: getAccountBalance', () => {
    test('should return the free POLY balance', async () => {
      const fakeBalance = new BigNumber(100);
      polkadotMockFactory.initMocks({ mockContext: { balance: fakeBalance } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wws',
      });

      const result = await polymesh.getAccountBalance();
      expect(result).toEqual(fakeBalance);
    });
  });
});
