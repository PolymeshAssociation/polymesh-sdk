import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Asset, Context, Entity, TickerReservation, TransactionQueue } from '~/internal';
import { dsMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { KnownAssetType, SecurityIdentifierType, TickerReservationStatus } from '~/types';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('TickerReservation class', () => {
  const ticker = 'FAKE_TICKER';
  let assertTickerValidStub: sinon.SinonStub;
  let context: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    assertTickerValidStub = sinon.stub(utilsInternalModule, 'assertTickerValid');
  });

  afterEach(() => {
    dsMockUtils.reset();
    procedureMockUtils.reset();
    context = dsMockUtils.getContextInstance();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend Entity', () => {
    expect(TickerReservation.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    it('should throw an error if the supplied ticker is invalid', () => {
      assertTickerValidStub.throws();

      expect(() => new TickerReservation({ ticker: 'some_ticker' }, context)).toThrow();

      sinon.reset();
    });

    it('should assign ticker to instance', () => {
      const tickerReservation = new TickerReservation({ ticker }, context);

      expect(tickerReservation.ticker).toBe(ticker);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
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

    it('should return details for a free ticker', async () => {
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

    it('should return details for a reserved ticker', async () => {
      const ownerDid = 'someDid';
      const expiryDate = new Date(new Date().getTime() + 100000);

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

    it('should return details for a permanently reserved ticker', async () => {
      const ownerDid = 'someDid';
      const expiryDate = null;

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

    it('should return details for a ticker for which a reservation expired', async () => {
      const ownerDid = 'someDid';
      const expiryDate = new Date(new Date().getTime() - 100000);

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

    it('should return details for a ticker for which an Asset has already been created', async () => {
      const ownerDid = 'someDid';
      const expiryDate = null;

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
        status: TickerReservationStatus.AssetCreated,
      });
    });

    it('should allow subscription', async () => {
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
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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

  describe('method: createAsset', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const tickerReservation = new TickerReservation({ ticker }, context);

      const args = {
        ticker,
        name: 'TEST',
        totalSupply: new BigNumber(100),
        isDivisible: true,
        assetType: KnownAssetType.EquityCommon,
        securityIdentifiers: [{ type: SecurityIdentifierType.Isin, value: '12345' }],
        fundingRound: 'Series A',
        requireInvestorUniqueness: false,
        reservationRequired: true,
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<Asset>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await tickerReservation.createAsset(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: transferOwnership', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const tickerReservation = new TickerReservation({ ticker }, context);
      const target = 'someOtherDid';
      const expiry = new Date('10/10/2022');

      const args = {
        ticker,
        target,
        expiry,
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<Asset>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await tickerReservation.transferOwnership(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: exists', () => {
    it('should return whether the Reservation exists', async () => {
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

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      const tickerRes = new TickerReservation({ ticker: 'SOME_TICKER' }, context);

      expect(tickerRes.toHuman()).toBe('SOME_TICKER');
    });
  });
});
