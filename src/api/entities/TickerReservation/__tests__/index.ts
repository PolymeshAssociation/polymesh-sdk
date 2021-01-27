import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  createSecurityToken,
  Entity,
  reserveTicker,
  SecurityToken,
  TickerReservation,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils } from '~/testUtils/mocks';
import { KnownTokenType, TickerReservationStatus, TokenIdentifierType } from '~/types';

describe('TickerReservation class', () => {
  const ticker = 'FAKETICKER';

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should extend entity', () => {
    expect(TickerReservation.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker to instance', () => {
      const context = dsMockUtils.getContextInstance();
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
    let queryMultiStub: sinon.SinonStub;

    beforeEach(() => {
      dsMockUtils.createQueryStub('asset', 'tickers');
      dsMockUtils.createQueryStub('asset', 'tokens');
      queryMultiStub = dsMockUtils.getQueryMultiStub();
    });

    test('should return details for a free ticker', async () => {
      const context = dsMockUtils.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      queryMultiStub.resolves([
        dsMockUtils.createMockTickerRegistration(),
        dsMockUtils.createMockSecurityToken(),
      ]);

      const details = await tickerReservation.details();

      expect(details).toMatchObject({
        owner: null,
        expiryDate: null,
        status: TickerReservationStatus.Free,
      });
    });

    test('should return details for a reserved ticker', async () => {
      const ownerDid = 'someDid';
      const expiryDate = new Date(new Date().getTime() + 100000);
      const context = dsMockUtils.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      queryMultiStub.resolves([
        dsMockUtils.createMockTickerRegistration({
          owner: dsMockUtils.createMockIdentityId(ownerDid),
          expiry: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(expiryDate.getTime())),
        }),
        dsMockUtils.createMockSecurityToken(),
      ]);

      const details = await tickerReservation.details();

      expect(details).toMatchObject({
        owner: { did: ownerDid },
        expiryDate,
        status: TickerReservationStatus.Reserved,
      });
    });

    test('should return details for a permanently reserved ticker', async () => {
      const ownerDid = 'someDid';
      const expiryDate = null;
      const context = dsMockUtils.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      queryMultiStub.resolves([
        dsMockUtils.createMockTickerRegistration({
          owner: dsMockUtils.createMockIdentityId(ownerDid),
          expiry: dsMockUtils.createMockOption(), // null expiry
        }),
        dsMockUtils.createMockSecurityToken(),
      ]);

      const details = await tickerReservation.details();

      expect(details).toMatchObject({
        owner: { did: ownerDid },
        expiryDate,
        status: TickerReservationStatus.Reserved,
      });
    });

    test('should return details for a ticker for which a reservation expired', async () => {
      const ownerDid = 'someDid';
      const expiryDate = new Date(new Date().getTime() - 100000);
      const context = dsMockUtils.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      queryMultiStub.resolves([
        dsMockUtils.createMockTickerRegistration({
          owner: dsMockUtils.createMockIdentityId(ownerDid),
          expiry: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(expiryDate.getTime())),
        }),
        dsMockUtils.createMockSecurityToken(),
      ]);

      const details = await tickerReservation.details();

      expect(details).toMatchObject({
        owner: { did: ownerDid },
        expiryDate,
        status: TickerReservationStatus.Free,
      });
    });

    test('should return details for a ticker for which a token has already been created', async () => {
      const ownerDid = 'someDid';
      const expiryDate = null;
      const context = dsMockUtils.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      queryMultiStub.resolves([
        dsMockUtils.createMockTickerRegistration({
          owner: dsMockUtils.createMockIdentityId(ownerDid),
          expiry: dsMockUtils.createMockOption(),
        }),
        dsMockUtils.createMockSecurityToken({
          /* eslint-disable @typescript-eslint/camelcase */
          owner_did: dsMockUtils.createMockIdentityId(ownerDid),
          name: dsMockUtils.createMockAssetName('someToken'),
          asset_type: dsMockUtils.createMockAssetType('EquityCommon'),
          divisible: dsMockUtils.createMockBool(true),
          primary_issuance_agent: dsMockUtils.createMockOption(),
          total_supply: dsMockUtils.createMockBalance(1000),
          /* eslint-enable @typescript-eslint/camelcase */
        }),
      ]);

      const details = await tickerReservation.details();

      expect(details).toMatchObject({
        owner: { did: ownerDid },
        expiryDate,
        status: TickerReservationStatus.TokenCreated,
      });
    });

    test('should allow subscription', async () => {
      const context = dsMockUtils.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      const unsubCallback = 'unsubCallback';

      queryMultiStub.callsFake(async (_, cbFunc) => {
        cbFunc([dsMockUtils.createMockTickerRegistration(), dsMockUtils.createMockSecurityToken()]);
        return unsubCallback;
      });

      const callback = sinon.stub();
      const unsub = await tickerReservation.details(callback);

      expect(unsub).toBe(unsubCallback);
      sinon.assert.calledWith(callback, {
        owner: null,
        expiryDate: null,
        status: TickerReservationStatus.Free,
      });
    });
  });

  describe('method: extend', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      const args = {
        ticker,
        extendPeriod: true,
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<TickerReservation>;

      sinon.stub(reserveTicker, 'prepare').withArgs(args, context).resolves(expectedQueue);

      const queue = await tickerReservation.extend();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: createToken', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);

      const args = {
        ticker,
        name: 'TEST',
        totalSupply: new BigNumber(100),
        isDivisible: true,
        tokenType: KnownTokenType.EquityCommon,
        tokenIdentifiers: [{ type: TokenIdentifierType.Isin, value: '12345' }],
        fundingRound: 'Series A',
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon.stub(createSecurityToken, 'prepare').withArgs(args, context).resolves(expectedQueue);

      const queue = await tickerReservation.createToken(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
