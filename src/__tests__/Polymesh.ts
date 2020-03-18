import { Keyring } from '@polkadot/api';
import { BigNumber } from 'bignumber.js';
import sinon from 'sinon';

import { TickerReservation } from '~/api/entities';
import { reserveTicker } from '~/api/procedures';
import { TransactionQueue } from '~/base';
import { Polymesh } from '~/Polymesh';
import { polkadotMockUtils } from '~/testUtils/mocks';

jest.mock(
  '@polkadot/api',
  require('~/testUtils/mocks/polkadot').mockPolkadotModule('@polkadot/api')
);
jest.mock('~/context', require('~/testUtils/mocks/polkadot').mockContextModule('~/context'));

describe('Polymesh Class', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  describe('method: create', () => {
    test('should instantiate Context and return a Polymesh instance', async () => {
      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      expect(polymesh instanceof Polymesh).toBe(true);
    });

    test('should instantiate Context with a seed and return a Polymesh instance', async () => {
      const accountSeed = 'Alice'.padEnd(32, ' ');
      const createStub = polkadotMockUtils.getContextCreateStub();

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountSeed,
      });

      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, {
        polymeshApi: polkadotMockUtils.getApiInstance(),
        seed: accountSeed,
      });
    });

    test('should instantiate Context with a keyring and return a Polymesh instance', async () => {
      const keyring = {} as Keyring;
      const createStub = polkadotMockUtils.getContextCreateStub();

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        keyring,
      });

      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, {
        polymeshApi: polkadotMockUtils.getApiInstance(),
        keyring,
      });
    });

    test('should instantiate Context with a uri and return a Polymesh instance', async () => {
      const accountUri = '//uri';
      const createStub = polkadotMockUtils.getContextCreateStub();

      await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri,
      });

      sinon.assert.calledOnce(createStub);
      sinon.assert.calledWith(createStub, {
        polymeshApi: polkadotMockUtils.getApiInstance(),
        uri: accountUri,
      });
    });

    test('should throw if Context fails in the connection process', async () => {
      polkadotMockUtils.throwOnApiCreation();
      const nodeUrl = 'wss://some.url';
      const polymeshApiPromise = Polymesh.connect({
        nodeUrl,
      });

      return expect(polymeshApiPromise).rejects.toThrow(
        `Error while connecting to "${nodeUrl}": "Error"`
      );
    });

    test('should throw if Context create method fails', () => {
      polkadotMockUtils.throwOnContextCreation();
      const nodeUrl = 'wss://some.url';
      const polymeshApiPromise = Polymesh.connect({
        nodeUrl,
      });

      return expect(polymeshApiPromise).rejects.toThrow(
        `Error while connecting to "${nodeUrl}": "Error"`
      );
    });
  });

  describe('method: getIdentityBalance', () => {
    test("should return the identity's POLYX balance", async () => {
      const fakeBalance = new BigNumber(20);
      polkadotMockUtils.initMocks({ contextOptions: { withSeed: true, balance: fakeBalance } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountSeed: 'seed',
      });

      const result = await polymesh.getIdentityBalance();
      expect(result).toEqual(fakeBalance);
    });
  });

  describe('method: getAccountBalance', () => {
    test('should return the free POLYX balance of the current account', async () => {
      const fakeBalance = new BigNumber(100);
      polkadotMockUtils.initMocks({ contextOptions: { balance: fakeBalance } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      const result = await polymesh.getAccountBalance();
      expect(result).toEqual(fakeBalance);
    });

    test('should return the free POLYX balance of the supplied account', async () => {
      const fakeBalance = new BigNumber(100);
      polkadotMockUtils.initMocks({ contextOptions: { balance: fakeBalance } });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      const result = await polymesh.getAccountBalance({ accountId: 'someId' });
      expect(result).toEqual(fakeBalance);
    });
  });

  describe('method: reserveTicker', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = polkadotMockUtils.getContextInstance();

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
      });

      const args = {
        ticker: 'someTicker',
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<TickerReservation>;

      sinon
        .stub(reserveTicker, 'prepare')
        .withArgs(args, context)
        .resolves(expectedQueue);

      const queue = await polymesh.reserveTicker(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getTickerReservations', () => {
    test('should return a list of ticker reservations if did parameter is set', async () => {
      const fakeTicker = 'TEST';

      polkadotMockUtils.initMocks({ contextOptions: { withSeed: true } });

      polkadotMockUtils.createQueryStub('identity', 'links', {
        entries: [
          polkadotMockUtils.createMockOption(
            polkadotMockUtils.createMockLink({
              // eslint-disable-next-line @typescript-eslint/camelcase
              link_data: polkadotMockUtils.createMockLinkData({
                tickerOwned: polkadotMockUtils.createMockTicker(fakeTicker),
              }),
              expiry: polkadotMockUtils.createMockOption(),
              // eslint-disable-next-line @typescript-eslint/camelcase
              link_id: polkadotMockUtils.createMockU64(),
            })
          ),
        ],
      });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const tickerReservations = await polymesh.getTickerReservations({ did: 'someDid' });

      expect(tickerReservations).toHaveLength(1);
      expect(tickerReservations[0].ticker).toBe(fakeTicker);
    });

    test('should return a list of ticker reservations owned by the identity', async () => {
      const fakeTicker = 'TEST';

      polkadotMockUtils.initMocks({ contextOptions: { withSeed: true } });

      polkadotMockUtils.createQueryStub('identity', 'links', {
        entries: [
          polkadotMockUtils.createMockOption(
            polkadotMockUtils.createMockLink({
              // eslint-disable-next-line @typescript-eslint/camelcase
              link_data: polkadotMockUtils.createMockLinkData({
                tickerOwned: polkadotMockUtils.createMockTicker(fakeTicker),
              }),
              expiry: polkadotMockUtils.createMockOption(),
              // eslint-disable-next-line @typescript-eslint/camelcase
              link_id: polkadotMockUtils.createMockU64(),
            })
          ),
        ],
      });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const tickerReservations = await polymesh.getTickerReservations();

      expect(tickerReservations).toHaveLength(1);
      expect(tickerReservations[0].ticker).toBe(fakeTicker);
    });
  });

  describe('method: getTickerReservation', () => {
    test('should return a specific ticker reservation owned by the identity', async () => {
      const ticker = 'TEST';

      polkadotMockUtils.createQueryStub('asset', 'tickers', {
        returnValue: polkadotMockUtils.createMockTickerRegistration({
          owner: polkadotMockUtils.createMockIdentityId('someDid'),
          expiry: polkadotMockUtils.createMockOption(),
        }),
      });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      const tickerReservation = await polymesh.getTickerReservation({ ticker });
      expect(tickerReservation.ticker).toBe(ticker);
    });

    test('should throw if ticker reservation does not exist', async () => {
      const ticker = 'TEST';

      polkadotMockUtils.createQueryStub('asset', 'tickers', {
        returnValue: polkadotMockUtils.createMockTickerRegistration({
          owner: polkadotMockUtils.createMockIdentityId(),
          expiry: polkadotMockUtils.createMockOption(),
        }),
      });

      const polymesh = await Polymesh.connect({
        nodeUrl: 'wss://some.url',
        accountUri: '//uri',
      });

      return expect(polymesh.getTickerReservation({ ticker })).rejects.toThrow(
        `There is no reservation for ${ticker} ticker`
      );
    });
  });
});
