import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Assets } from '~/Assets';
import { Asset, Context, TickerReservation, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { KnownAssetType, SecurityIdentifierType, TickerReservationStatus } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);
jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('Assets Class', () => {
  let context: Mocked<Context>;
  let assets: Assets;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    assets = new Assets(context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: reserveTicker', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const args = {
        ticker: 'SOME_TICKER',
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<TickerReservation>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await assets.reserveTicker(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: createAsset', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const ticker = 'FAKE_TICKER';

      const args = {
        ticker,
        name: 'TEST',
        totalSupply: new BigNumber(100),
        isDivisible: true,
        assetType: KnownAssetType.EquityCommon,
        securityIdentifier: [{ type: SecurityIdentifierType.Isin, value: '12345' }],
        fundingRound: 'Series A',
        requireInvestorUniqueness: false,
        reservationRequired: false,
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<Asset>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await assets.createAsset(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: claimClassicTicker', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const args = {
        ticker: 'SOME_TICKER',
        ethereumSignature: 'someSig',
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<TickerReservation>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await assets.claimClassicTicker(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: isTickerAvailable', () => {
    afterEach(() => {
      entityMockUtils.reset();
    });

    test('should return true if ticker is available to reserve it', async () => {
      entityMockUtils.configureMocks({
        tickerReservationOptions: {
          details: {
            owner: entityMockUtils.getIdentityInstance(),
            expiryDate: new Date(),
            status: TickerReservationStatus.Free,
          },
        },
      });

      const isTickerAvailable = await assets.isTickerAvailable({ ticker: 'SOME_TICKER' });

      expect(isTickerAvailable).toBeTruthy();
    });

    test('should return false if ticker is not available to reserve it', async () => {
      entityMockUtils.configureMocks({
        tickerReservationOptions: {
          details: {
            owner: entityMockUtils.getIdentityInstance(),
            expiryDate: new Date(),
            status: TickerReservationStatus.Reserved,
          },
        },
      });

      const isTickerAvailable = await assets.isTickerAvailable({ ticker: 'someTicker' });

      expect(isTickerAvailable).toBeFalsy();
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      entityMockUtils.configureMocks({
        tickerReservationOptions: {
          details: async cbFunc => {
            cbFunc({
              owner: entityMockUtils.getIdentityInstance(),
              expiryDate: new Date(),
              status: TickerReservationStatus.Free,
            });

            return unsubCallback;
          },
        },
      });

      const callback = sinon.stub();
      const result = await assets.isTickerAvailable({ ticker: 'someTicker' }, callback);

      expect(result).toBe(unsubCallback);
      sinon.assert.calledWithExactly(callback, true);
    });
  });

  describe('method: getTickerReservations', () => {
    beforeAll(() => {
      sinon.stub(utilsConversionModule, 'signerValueToSignatory');
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should return a list of ticker reservations if did parameter is set', async () => {
      const fakeTicker = 'TEST';
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      dsMockUtils.createQueryStub('asset', 'assetOwnershipRelations', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(fakeTicker)],
            dsMockUtils.createMockAssetOwnershipRelation('TickerOwned')
          ),
        ],
      });

      const tickerReservations = await assets.getTickerReservations({ owner: did });

      expect(tickerReservations).toHaveLength(1);
      expect(tickerReservations[0].ticker).toBe(fakeTicker);
    });

    test('should return a list of ticker reservations owned by the Identity', async () => {
      const fakeTicker = 'TEST';
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      dsMockUtils.createQueryStub('asset', 'assetOwnershipRelations', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(fakeTicker)],
            dsMockUtils.createMockAssetOwnershipRelation('TickerOwned')
          ),
        ],
      });

      const tickerReservations = await assets.getTickerReservations();

      expect(tickerReservations).toHaveLength(1);
      expect(tickerReservations[0].ticker).toBe(fakeTicker);
    });

    test('should filter out tickers with unreadable characters', async () => {
      const fakeTicker = 'TEST';
      const unreadableTicker = String.fromCharCode(65533);
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      dsMockUtils.createQueryStub('asset', 'assetOwnershipRelations', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(fakeTicker)],
            dsMockUtils.createMockAssetOwnershipRelation('TickerOwned')
          ),
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker('someTicker')],
            dsMockUtils.createMockAssetOwnershipRelation('AssetOwned')
          ),
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(unreadableTicker)],
            dsMockUtils.createMockAssetOwnershipRelation('TickerOwned')
          ),
        ],
      });

      const tickerReservations = await assets.getTickerReservations();

      expect(tickerReservations).toHaveLength(1);
      expect(tickerReservations[0].ticker).toBe(fakeTicker);
    });
  });

  describe('method: getTickerReservation', () => {
    test('should return a specific ticker reservation owned by the Identity', async () => {
      const ticker = 'TEST';
      const expiry = new Date();

      dsMockUtils.createQueryStub('asset', 'tickers', {
        returnValue: dsMockUtils.createMockTickerRegistration({
          owner: dsMockUtils.createMockIdentityId('someDid'),
          expiry: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(expiry.getTime())),
        }),
      });

      const tickerReservation = await assets.getTickerReservation({ ticker });
      expect(tickerReservation.ticker).toBe(ticker);
    });

    test('should throw if ticker reservation does not exist', async () => {
      const ticker = 'TEST';

      dsMockUtils.createQueryStub('asset', 'tickers', {
        returnValue: dsMockUtils.createMockTickerRegistration({
          owner: dsMockUtils.createMockIdentityId(),
          expiry: dsMockUtils.createMockOption(),
        }),
      });

      return expect(assets.getTickerReservation({ ticker })).rejects.toThrow(
        `There is no reservation for ${ticker} ticker`
      );
    });

    test('should throw if ticker is already an Asset', async () => {
      const ticker = 'TEST';

      dsMockUtils.createQueryStub('asset', 'tickers', {
        returnValue: dsMockUtils.createMockTickerRegistration({
          owner: dsMockUtils.createMockIdentityId('someDid'),
          expiry: dsMockUtils.createMockOption(),
        }),
      });

      return expect(assets.getTickerReservation({ ticker })).rejects.toThrow(
        `${ticker} Asset has been created`
      );
    });
  });

  describe('method: getAsset', () => {
    test('should return a specific Asset', async () => {
      const ticker = 'TEST';

      const asset = await assets.getAsset({ ticker });
      expect(asset.ticker).toBe(ticker);
    });

    test('should throw if the Asset does not exist', async () => {
      const ticker = 'TEST';
      entityMockUtils.configureMocks({ assetOptions: { exists: false } });

      return expect(assets.getAsset({ ticker })).rejects.toThrow(
        `There is no Asset with ticker "${ticker}"`
      );
    });
  });

  describe('method: getAssets', () => {
    beforeAll(() => {
      sinon.stub(utilsConversionModule, 'signerValueToSignatory');
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should return a list of Assets owned by the supplied did', async () => {
      const fakeTicker = 'TEST';
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      dsMockUtils.createQueryStub('asset', 'assetOwnershipRelations', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(fakeTicker)],
            dsMockUtils.createMockAssetOwnershipRelation('AssetOwned')
          ),
        ],
      });

      const asset = await assets.getAssets({ owner: 'someDid' });

      expect(asset).toHaveLength(1);
      expect(asset[0].ticker).toBe(fakeTicker);
    });

    test('should return a list of Assets owned by the current Identity if no did is supplied', async () => {
      const fakeTicker = 'TEST';
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      dsMockUtils.createQueryStub('asset', 'assetOwnershipRelations', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(fakeTicker)],
            dsMockUtils.createMockAssetOwnershipRelation('AssetOwned')
          ),
        ],
      });

      const assetResults = await assets.getAssets();

      expect(assetResults).toHaveLength(1);
      expect(assetResults[0].ticker).toBe(fakeTicker);
    });

    test('should filter out Assets whose tickers have unreadable characters', async () => {
      const fakeTicker = 'TEST';
      const unreadableTicker = String.fromCharCode(65533);
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      dsMockUtils.createQueryStub('asset', 'assetOwnershipRelations', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(fakeTicker)],
            dsMockUtils.createMockAssetOwnershipRelation('AssetOwned')
          ),
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker('someTicker')],
            dsMockUtils.createMockAssetOwnershipRelation('TickerOwned')
          ),
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(unreadableTicker)],
            dsMockUtils.createMockAssetOwnershipRelation('AssetOwned')
          ),
        ],
      });

      const assetResults = await assets.getAssets();

      expect(assetResults).toHaveLength(1);
      expect(assetResults[0].ticker).toBe(fakeTicker);
    });
  });
});
