import { Ticker } from '@polymathnetwork/polkadot/types/interfaces';
import { Callback, Codec } from '@polymathnetwork/polkadot/types/types';

import { Entity } from '~/base';
import {
  createMockAssetType,
  createMockBalance,
  createMockBool,
  createMockIdentityId,
  createMockMoment,
  createMockOption,
  createMockSecurityToken,
  createMockTickerRegistration,
  createMockTokenName,
  createMockU64,
  PolkadotMockFactory,
} from '~/testUtils/mocks';
import { TickerReservationStatus } from '~/types';

import { TickerReservation } from '../';

describe('TickerReservation class', () => {
  const polkadotMockFactory = new PolkadotMockFactory();

  polkadotMockFactory.initMocks({ mockContext: true });

  afterEach(() => {
    polkadotMockFactory.reset();
  });

  afterAll(() => {
    polkadotMockFactory.cleanup();
  });

  test('should extend entity', () => {
    expect(TickerReservation.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker instance', () => {
      const ticker = 'abc';
      const context = polkadotMockFactory.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      expect(tickerReservation.ticker).toBe(ticker);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(TickerReservation.isUniqueIdentifiers({ ticker: 'someTicker' })).toBe(true);
      expect(TickerReservation.isUniqueIdentifiers({})).toBe(false);
      expect(TickerReservation.isUniqueIdentifiers({ ticker: 3 })).toBe(false);
    });
  });

  describe('method: details', () => {
    let tickersStub: sinon.SinonStub<[string | Uint8Array | Ticker, Callback<Codec | Codec[]>]>;
    let tokensStub: sinon.SinonStub<[string | Uint8Array | Ticker, Callback<Codec | Codec[]>]>;

    beforeEach(() => {
      tickersStub = polkadotMockFactory.createQueryStub('asset', 'tickers', {
        returnValue: createMockTickerRegistration(),
      });
      tokensStub = polkadotMockFactory.createQueryStub('asset', 'tokens', {
        returnValue: createMockSecurityToken(),
      });
    });

    test('should return details for a free ticker', async () => {
      const ticker = 'abc';
      const context = polkadotMockFactory.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      const details = await tickerReservation.details();

      expect(details).toEqual({
        ownerDid: null,
        expiryDate: null,
        status: TickerReservationStatus.Free,
      });
    });

    test('should return details for a reserved ticker', async () => {
      const ticker = 'abc';
      const ownerDid = 'someDid';
      const expiryDate = new Date(new Date().getTime() + 100000);
      const context = polkadotMockFactory.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      tickersStub.returns(
        createMockTickerRegistration({
          owner: createMockIdentityId(ownerDid),
          expiry: createMockOption(createMockMoment(expiryDate.getTime())),
        })
      );

      const details = await tickerReservation.details();

      expect(details).toEqual({
        ownerDid,
        expiryDate,
        status: TickerReservationStatus.Reserved,
      });
    });

    test('should return details for a permanently reserved ticker', async () => {
      const ticker = 'abc';
      const ownerDid = 'someDid';
      const expiryDate = null;
      const context = polkadotMockFactory.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      tickersStub.returns(
        createMockTickerRegistration({
          owner: createMockIdentityId(ownerDid),
          expiry: createMockOption(), // null expiry
        })
      );

      const details = await tickerReservation.details();

      expect(details).toEqual({
        ownerDid,
        expiryDate,
        status: TickerReservationStatus.Reserved,
      });
    });

    test('should return details for a ticker for which a reservation expired', async () => {
      const ticker = 'abc';
      const ownerDid = 'someDid';
      const expiryDate = new Date(new Date().getTime() - 100000);
      const context = polkadotMockFactory.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      tickersStub.returns(
        createMockTickerRegistration({
          owner: createMockIdentityId(ownerDid),
          expiry: createMockOption(createMockMoment(expiryDate.getTime())),
        })
      );

      const details = await tickerReservation.details();

      expect(details).toEqual({
        ownerDid,
        expiryDate,
        status: TickerReservationStatus.Free,
      });
    });

    test('should return details for a ticker for which a token has already been created', async () => {
      const ticker = 'abc';
      const ownerDid = 'someDid';
      const expiryDate = null;
      const context = polkadotMockFactory.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      tickersStub.returns(
        createMockTickerRegistration({
          owner: createMockIdentityId(ownerDid),
          expiry: createMockOption(),
        })
      );
      tokensStub.returns(
        createMockSecurityToken({
          /* eslint-disable @typescript-eslint/camelcase */
          owner_did: createMockIdentityId(ownerDid),
          name: createMockTokenName('someToken'),
          asset_type: createMockAssetType('equity'),
          divisible: createMockBool(true),
          link_id: createMockU64(3),
          total_supply: createMockBalance(1000),
          /* eslint-enable @typescript-eslint/camelcase */
        })
      );

      const details = await tickerReservation.details();

      expect(details).toEqual({
        ownerDid,
        expiryDate,
        status: TickerReservationStatus.TokenCreated,
      });
    });
  });
});
