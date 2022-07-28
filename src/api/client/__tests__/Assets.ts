import { StorageKey } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Assets } from '~/api/client/Assets';
import { Asset, Context, TickerReservation, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { KnownAssetType, SecurityIdentifierType, TickerReservationStatus } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

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
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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

    it('should return true if ticker is available to reserve it', async () => {
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

    it('should return false if ticker is not available to reserve it', async () => {
      entityMockUtils.configureMocks({
        tickerReservationOptions: {
          details: {
            owner: entityMockUtils.getIdentityInstance(),
            expiryDate: new Date(),
            status: TickerReservationStatus.Reserved,
          },
        },
      });

      const isTickerAvailable = await assets.isTickerAvailable({ ticker: 'SOME_TICKER' });

      expect(isTickerAvailable).toBeFalsy();
    });

    it('should allow subscription', async () => {
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
      const result = await assets.isTickerAvailable({ ticker: 'SOME_TICKER' }, callback);

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

    it('should return a list of ticker reservations if did parameter is set', async () => {
      const fakeTicker = 'TEST';
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

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

    it('should return a list of ticker reservations owned by the Identity', async () => {
      const fakeTicker = 'TEST';
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

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

    it('should filter out tickers with unreadable characters', async () => {
      const fakeTicker = 'TEST';
      const unreadableTicker = String.fromCharCode(65533);
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

      dsMockUtils.createQueryStub('asset', 'assetOwnershipRelations', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(fakeTicker)],
            dsMockUtils.createMockAssetOwnershipRelation('TickerOwned')
          ),
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker('SOME_TICKER')],
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
    it('should return a Ticker Reservation', () => {
      const ticker = 'TEST';
      const tickerReservation = assets.getTickerReservation({ ticker });
      expect(tickerReservation.ticker).toBe(ticker);
    });
  });

  describe('method: getAsset', () => {
    it('should return a specific Asset', async () => {
      const ticker = 'TEST';

      const asset = await assets.getAsset({ ticker });
      expect(asset.ticker).toBe(ticker);
    });

    it('should throw if the Asset does not exist', async () => {
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

    it('should return a list of Assets owned by the supplied did', async () => {
      const fakeTicker = 'TEST';
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

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

    it('should return a list of Assets owned by the signing Identity if no did is supplied', async () => {
      const fakeTicker = 'TEST';
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

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

    it('should filter out Assets whose tickers have unreadable characters', async () => {
      const fakeTicker = 'TEST';
      const unreadableTicker = String.fromCharCode(65533);
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

      dsMockUtils.createQueryStub('asset', 'assetOwnershipRelations', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(fakeTicker)],
            dsMockUtils.createMockAssetOwnershipRelation('AssetOwned')
          ),
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker('SOME_TICKER')],
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

  describe('method: get', () => {
    let requestPaginatedStub: sinon.SinonStub;
    const expectedAssets = [
      {
        name: 'someAsset',
        ticker: 'SOME_ASSET',
      },
      {
        name: 'otherAsset',
        ticker: 'OTHER_ASSET',
      },
    ];

    beforeAll(() => {
      requestPaginatedStub = sinon.stub(utilsInternalModule, 'requestPaginated');
    });

    beforeEach(() => {
      dsMockUtils.createQueryStub('asset', 'assetNames');
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should retrieve all Assets on the chain', async () => {
      const entries = expectedAssets.map(({ name, ticker }) =>
        tuple(
          {
            args: [dsMockUtils.createMockTicker(ticker)],
          } as unknown as StorageKey,
          dsMockUtils.createMockBytes(name)
        )
      );

      requestPaginatedStub.resolves({ entries, lastKey: null });

      const result = await assets.get();

      const expectedData = expectedAssets.map(({ ticker }) => expect.objectContaining({ ticker }));
      expect(result).toEqual({ data: expectedData, next: null });
    });

    it('should retrieve the first page of results', async () => {
      const entries = [
        tuple(
          {
            args: [dsMockUtils.createMockTicker(expectedAssets[0].ticker)],
          } as unknown as StorageKey,
          dsMockUtils.createMockBytes(expectedAssets[0].name)
        ),
      ];

      requestPaginatedStub.resolves({ entries, lastKey: 'someKey' });

      const result = await assets.get({ size: new BigNumber(1) });

      expect(result).toEqual({
        data: [expect.objectContaining({ ticker: expectedAssets[0].ticker })],
        next: 'someKey',
      });
    });
  });
});
