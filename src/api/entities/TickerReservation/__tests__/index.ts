import { Callback, Codec } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities/SecurityToken';
import { reserveTicker } from '~/api/procedures';
import { createSecurityToken } from '~/api/procedures/createSecurityToken';
import { Entity, TransactionQueue } from '~/base';
import { polkadotMockUtils } from '~/testUtils/mocks';
import { KnownTokenType, TickerReservationStatus, TokenIdentifierType } from '~/types';

import { TickerReservation } from '../';

describe('TickerReservation class', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('should extend entity', () => {
    expect(TickerReservation.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker to instance', () => {
      const ticker = 'abc';
      const context = polkadotMockUtils.getContextInstance();
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
      tickersStub = polkadotMockUtils.createQueryStub('asset', 'tickers', {
        returnValue: polkadotMockUtils.createMockTickerRegistration(),
      });
      tokensStub = polkadotMockUtils.createQueryStub('asset', 'tokens', {
        returnValue: polkadotMockUtils.createMockSecurityToken(),
      });
    });

    test('should return details for a free ticker', async () => {
      const ticker = 'abc';
      const context = polkadotMockUtils.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      const details = await tickerReservation.details();

      expect(details).toMatchObject({
        owner: null,
        expiryDate: null,
        status: TickerReservationStatus.Free,
      });
    });

    test('should return details for a reserved ticker', async () => {
      const ticker = 'abc';
      const ownerDid = 'someDid';
      const expiryDate = new Date(new Date().getTime() + 100000);
      const context = polkadotMockUtils.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      tickersStub.returns(
        polkadotMockUtils.createMockTickerRegistration({
          owner: polkadotMockUtils.createMockIdentityId(ownerDid),
          expiry: polkadotMockUtils.createMockOption(
            polkadotMockUtils.createMockMoment(expiryDate.getTime())
          ),
        })
      );

      const details = await tickerReservation.details();

      expect(details).toMatchObject({
        owner: { did: ownerDid },
        expiryDate,
        status: TickerReservationStatus.Reserved,
      });
    });

    test('should return details for a permanently reserved ticker', async () => {
      const ticker = 'abc';
      const ownerDid = 'someDid';
      const expiryDate = null;
      const context = polkadotMockUtils.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      tickersStub.returns(
        polkadotMockUtils.createMockTickerRegistration({
          owner: polkadotMockUtils.createMockIdentityId(ownerDid),
          expiry: polkadotMockUtils.createMockOption(), // null expiry
        })
      );

      const details = await tickerReservation.details();

      expect(details).toMatchObject({
        owner: { did: ownerDid },
        expiryDate,
        status: TickerReservationStatus.Reserved,
      });
    });

    test('should return details for a ticker for which a reservation expired', async () => {
      const ticker = 'abc';
      const ownerDid = 'someDid';
      const expiryDate = new Date(new Date().getTime() - 100000);
      const context = polkadotMockUtils.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      tickersStub.returns(
        polkadotMockUtils.createMockTickerRegistration({
          owner: polkadotMockUtils.createMockIdentityId(ownerDid),
          expiry: polkadotMockUtils.createMockOption(
            polkadotMockUtils.createMockMoment(expiryDate.getTime())
          ),
        })
      );

      const details = await tickerReservation.details();

      expect(details).toMatchObject({
        owner: { did: ownerDid },
        expiryDate,
        status: TickerReservationStatus.Free,
      });
    });

    test('should return details for a ticker for which a token has already been created', async () => {
      const ticker = 'abc';
      const ownerDid = 'someDid';
      const expiryDate = null;
      const context = polkadotMockUtils.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      tickersStub.returns(
        polkadotMockUtils.createMockTickerRegistration({
          owner: polkadotMockUtils.createMockIdentityId(ownerDid),
          expiry: polkadotMockUtils.createMockOption(),
        })
      );
      tokensStub.returns(
        polkadotMockUtils.createMockSecurityToken({
          /* eslint-disable @typescript-eslint/camelcase */
          owner_did: polkadotMockUtils.createMockIdentityId(ownerDid),
          name: polkadotMockUtils.createMockTokenName('someToken'),
          asset_type: polkadotMockUtils.createMockAssetType('Equity'),
          divisible: polkadotMockUtils.createMockBool(true),
          link_id: polkadotMockUtils.createMockU64(3),
          total_supply: polkadotMockUtils.createMockBalance(1000),
          /* eslint-enable @typescript-eslint/camelcase */
        })
      );

      const details = await tickerReservation.details();

      expect(details).toMatchObject({
        owner: { did: ownerDid },
        expiryDate,
        status: TickerReservationStatus.TokenCreated,
      });
    });
  });

  describe('method: extend', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const ticker = 'TEST';
      const context = polkadotMockUtils.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      const args = {
        ticker,
        extendPeriod: true,
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<TickerReservation>;

      sinon
        .stub(reserveTicker, 'prepare')
        .withArgs(args, context)
        .resolves(expectedQueue);

      const queue = await tickerReservation.extend();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: createToken', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const ticker = 'TEST';
      const context = polkadotMockUtils.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      const args = {
        ticker,
        name: 'TEST',
        totalSupply: new BigNumber(100),
        isDivisible: true,
        tokenType: KnownTokenType.Equity,
        tokenIdentifiers: [{ type: TokenIdentifierType.Isin, value: '12345' }],
        fundingRound: 'Series A',
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(createSecurityToken, 'prepare')
        .withArgs(args, context)
        .resolves(expectedQueue);

      const queue = await tickerReservation.createToken(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
