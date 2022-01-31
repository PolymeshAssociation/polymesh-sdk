import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Entity, SecurityToken, TickerReservation, TransactionQueue } from '~/internal';
import { dsMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { KnownTokenType, TickerReservationStatus, TokenIdentifierType } from '~/types';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('TickerReservation class', () => {
  const ticker = 'FAKETICKER';

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  test('should extend Entity', () => {
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
          expiry: dsMockUtils.createMockOption(
            dsMockUtils.createMockMoment(new BigNumber(expiryDate.getTime()))
          ),
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
          expiry: dsMockUtils.createMockOption(
            dsMockUtils.createMockMoment(new BigNumber(expiryDate.getTime()))
          ),
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
          /* eslint-disable @typescript-eslint/naming-convention */
          owner_did: dsMockUtils.createMockIdentityId(ownerDid),
          asset_type: dsMockUtils.createMockAssetType('EquityCommon'),
          divisible: dsMockUtils.createMockBool(true),
          total_supply: dsMockUtils.createMockBalance(new BigNumber(1000)),
          /* eslint-enable @typescript-eslint/naming-convention */
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

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<TickerReservation>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

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
        requireInvestorUniqueness: false,
        reservationRequired: true,
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<SecurityToken>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await tickerReservation.createToken(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: transferOwnership', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const tickerReservation = new TickerReservation({ ticker }, context);
      const target = 'someOtherDid';
      const expiry = new Date('10/10/2022');

      const args = {
        ticker,
        target,
        expiry,
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<SecurityToken>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await tickerReservation.transferOwnership(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: exists', () => {
    test('should return whether the Reservation exists', async () => {
      const context = dsMockUtils.getContextInstance();
      const tickerRes = new TickerReservation({ ticker: 'SOME_TICKER' }, context);

      dsMockUtils.createQueryStub('asset', 'tickers', {
        size: new BigNumber(10),
      });

      let result = await tickerRes.exists();
      expect(result).toBe(true);

      dsMockUtils.createQueryStub('asset', 'tickers', {
        size: new BigNumber(0),
      });

      result = await tickerRes.exists();
      expect(result).toBe(false);
    });
  });

  describe('method: toJson', () => {
    test('should return a human readable version of the entity', () => {
      const context = dsMockUtils.getContextInstance();
      const tickerRes = new TickerReservation({ ticker: 'SOME_TICKER' }, context);

      expect(tickerRes.toJson()).toBe('SOME_TICKER');
    });
  });
});
