import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Asset, Context, Entity, PolymeshTransaction, TickerReservation } from '~/internal';
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
  let assertTickerValidSpy: jest.SpyInstance;
  let context: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    assertTickerValidSpy = jest.spyOn(utilsInternalModule, 'assertTickerValid');
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
      assertTickerValidSpy.mockImplementation(() => {
        throw new Error('err');
      });

      expect(() => new TickerReservation({ ticker: 'some_ticker' }, context)).toThrow();

      jest.restoreAllMocks();
    });

    it('should assign ticker to instance', () => {
      const tickerReservation = new TickerReservation({ ticker }, context);

      expect(tickerReservation.ticker).toBe(ticker);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(TickerReservation.isUniqueIdentifiers({ ticker: 'SOME_TICKER' })).toBe(true);
      expect(TickerReservation.isUniqueIdentifiers({})).toBe(false);
      expect(TickerReservation.isUniqueIdentifiers({ ticker: 3 })).toBe(false);
    });
  });

  describe('method: details', () => {
    let queryMultiMock: jest.Mock;

    beforeEach(() => {
      dsMockUtils.createQueryMock('asset', 'tickers');
      dsMockUtils.createQueryMock('asset', 'tokens');
      queryMultiMock = dsMockUtils.getQueryMultiMock();
    });

    it('should return details for a free ticker', async () => {
      const tickerReservation = new TickerReservation({ ticker }, context);

      queryMultiMock.mockResolvedValue([
        dsMockUtils.createMockOption(),
        dsMockUtils.createMockOption(),
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

      queryMultiMock.mockResolvedValue([
        dsMockUtils.createMockOption(
          dsMockUtils.createMockTickerRegistration({
            owner: dsMockUtils.createMockIdentityId(ownerDid),
            expiry: dsMockUtils.createMockOption(
              dsMockUtils.createMockMoment(new BigNumber(expiryDate.getTime()))
            ),
          })
        ),
        dsMockUtils.createMockOption(),
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

      queryMultiMock.mockResolvedValue([
        dsMockUtils.createMockOption(
          dsMockUtils.createMockTickerRegistration({
            owner: dsMockUtils.createMockIdentityId(ownerDid),
            expiry: dsMockUtils.createMockOption(), // null expiry
          })
        ),
        dsMockUtils.createMockOption(),
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

      queryMultiMock.mockResolvedValue([
        dsMockUtils.createMockOption(
          dsMockUtils.createMockTickerRegistration({
            owner: dsMockUtils.createMockIdentityId(ownerDid),
            expiry: dsMockUtils.createMockOption(
              dsMockUtils.createMockMoment(new BigNumber(expiryDate.getTime()))
            ),
          })
        ),
        dsMockUtils.createMockOption(),
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

      queryMultiMock.mockResolvedValue([
        dsMockUtils.createMockOption(
          dsMockUtils.createMockTickerRegistration({
            owner: dsMockUtils.createMockIdentityId(ownerDid),
            expiry: dsMockUtils.createMockOption(),
          })
        ),
        dsMockUtils.createMockOption(
          dsMockUtils.createMockSecurityToken({
            ownerDid: dsMockUtils.createMockIdentityId(ownerDid),
            assetType: dsMockUtils.createMockAssetType('EquityCommon'),
            divisible: dsMockUtils.createMockBool(true),
            totalSupply: dsMockUtils.createMockBalance(new BigNumber(1000)),
          })
        ),
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

      queryMultiMock.mockImplementation(async (_, cbFunc) => {
        cbFunc([dsMockUtils.createMockOption(), dsMockUtils.createMockOption()]);
        return unsubCallback;
      });

      const callback = jest.fn();
      const unsub = await tickerReservation.details(callback);

      expect(unsub).toBe(unsubCallback);
      expect(callback).toHaveBeenCalledWith({
        owner: null,
        expiryDate: null,
        status: TickerReservationStatus.Free,
      });
    });
  });

  describe('method: extend', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const tickerReservation = new TickerReservation({ ticker }, context);

      const args = {
        ticker,
        extendPeriod: true,
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<TickerReservation>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await tickerReservation.extend();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: createAsset', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
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

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Asset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await tickerReservation.createAsset(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: transferOwnership', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const tickerReservation = new TickerReservation({ ticker }, context);
      const target = 'someOtherDid';
      const expiry = new Date('10/10/2022');

      const args = {
        ticker,
        target,
        expiry,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Asset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await tickerReservation.transferOwnership(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: exists', () => {
    it('should return whether the Reservation exists', async () => {
      const tickerRes = new TickerReservation({ ticker: 'SOME_TICKER' }, context);

      dsMockUtils.createQueryMock('asset', 'tickers', {
        size: new BigNumber(10),
      });

      let result = await tickerRes.exists();
      expect(result).toBe(true);

      dsMockUtils.createQueryMock('asset', 'tickers', {
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
