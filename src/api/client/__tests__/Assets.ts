import { StorageKey } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Assets } from '~/api/client/Assets';
import {
  Context,
  FungibleAsset,
  NftCollection,
  PolymeshTransaction,
  TickerReservation,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  GlobalMetadataKey,
  KnownAssetType,
  KnownNftType,
  SecurityIdentifierType,
  TickerReservationStatus,
} from '~/types';
import { tuple } from '~/types/utils';
import { hexToUuid, uuidToHex } from '~/utils';
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
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/Asset/NonFungible',
  require('~/testUtils/mocks/entities').mockNftCollectionModule('~/api/entities/Asset/NonFungible')
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
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        ticker: 'SOME_TICKER',
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<TickerReservation>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await assets.reserveTicker(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: createAsset', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
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

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await assets.createAsset(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: createNftCollection', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const ticker = 'FAKE_TICKER';

      const args = {
        ticker,
        name: 'TEST',
        nftType: KnownNftType.Derivative,
        collectionKeys: [],
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<NftCollection>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await assets.createNftCollection(args);

      expect(tx).toBe(expectedTransaction);
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

      const callback = jest.fn();
      const result = await assets.isTickerAvailable({ ticker: 'SOME_TICKER' }, callback);

      expect(result).toBe(unsubCallback);
      expect(callback).toBeCalledWith(true);
    });
  });

  describe('method: getTickerReservations', () => {
    beforeAll(() => {
      jest.spyOn(utilsConversionModule, 'signerValueToSignatory');
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return a list of ticker reservations if did parameter is set', async () => {
      const fakeTicker = 'TEST';
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

      dsMockUtils.createQueryMock('asset', 'tickersOwnedByUser', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(fakeTicker)],
            dsMockUtils.createMockBool(true)
          ),
        ],
      });

      dsMockUtils.createQueryMock('asset', 'tickerAssetId', {
        multi: [dsMockUtils.createMockOption()],
      });

      const tickerReservations = await assets.getTickerReservations({ owner: did });

      expect(tickerReservations).toHaveLength(1);
      expect(tickerReservations[0].ticker).toBe(fakeTicker);
    });

    it('should return a list of ticker reservations owned by the Identity', async () => {
      const fakeTicker = 'TEST';
      const did = 'someDid';

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

      dsMockUtils.createQueryMock('asset', 'tickersOwnedByUser', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(fakeTicker)],
            dsMockUtils.createMockBool(true)
          ),
        ],
      });

      dsMockUtils.createQueryMock('asset', 'tickerAssetId', {
        multi: [dsMockUtils.createMockOption()],
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

      dsMockUtils.createQueryMock('asset', 'tickersOwnedByUser', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(fakeTicker)],
            dsMockUtils.createMockBool(true)
          ),
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker('SOME_TICKER')],
            dsMockUtils.createMockBool(true)
          ),
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockTicker(unreadableTicker)],
            dsMockUtils.createMockBool(true)
          ),
        ],
      });

      dsMockUtils.createQueryMock('asset', 'tickerAssetId', {
        multi: [
          dsMockUtils.createMockOption(),
          dsMockUtils.createMockOption(
            dsMockUtils.createMockAssetId('0x12341234123412341234123412341234')
          ),
          dsMockUtils.createMockOption(),
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
    it('should return a specific Asset for an asset ID', async () => {
      const assetId = '0x12341234123412341234123412341234';

      entityMockUtils.configureMocks({
        fungibleAssetOptions: { exists: false },
        nftCollectionOptions: { exists: true },
      });

      const asset = await assets.getAsset({ assetId });
      expect(asset).toBeInstanceOf(NftCollection);
    });

    it('should return a specific Asset for a ticker', async () => {
      const ticker = 'TICKER';

      entityMockUtils.configureMocks({
        fungibleAssetOptions: { exists: false },
        nftCollectionOptions: { exists: true },
      });

      jest
        .spyOn(utilsInternalModule, 'getAssetIdForTicker')
        .mockResolvedValue('0x12341234123412341234123412341234');

      const asset = await assets.getAsset({ ticker });
      expect(asset).toBeInstanceOf(NftCollection);
    });

    it('should throw if the Asset does not exist', async () => {
      const assetId = '12341234-1234-1234-1234-123412341234';
      entityMockUtils.configureMocks({
        fungibleAssetOptions: { exists: false },
        nftCollectionOptions: { exists: false },
      });

      return expect(assets.getAsset({ assetId })).rejects.toThrow(
        `No asset exists with asset ID: "${assetId}"`
      );
    });
  });

  describe('method: getAssets', () => {
    beforeAll(() => {
      jest.spyOn(utilsConversionModule, 'signerValueToSignatory');
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return a list of Assets owned by the supplied did', async () => {
      const fakeAssetId = '0x12341234123412341234123412341234';
      const did = 'someDid';

      dsMockUtils.createQueryMock('asset', 'securityTokensOwnedByUser', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockAssetId(fakeAssetId)],
            dsMockUtils.createMockBool(true)
          ),
        ],
      });

      dsMockUtils.createQueryMock('asset', 'assets', {
        multi: [
          dsMockUtils.createMockOption(
            dsMockUtils.createMockSecurityToken({
              ownerDid: dsMockUtils.createMockIdentityId('someDid'),
              assetType: dsMockUtils.createMockAssetType(KnownAssetType.Commodity),
              divisible: dsMockUtils.createMockBool(false),
              totalSupply: dsMockUtils.createMockBalance(new BigNumber(0)),
            })
          ),
        ],
      });

      const asset = await assets.getAssets({ owner: 'someDid' });

      expect(asset).toHaveLength(1);
      expect(asset[0].id).toBe(hexToUuid(fakeAssetId));
    });

    it('should return a list of Assets owned by the signing Identity if no did is supplied', async () => {
      const assetId = '0x12341234123412341234123412341234';
      const did = 'someDid';

      dsMockUtils.createQueryMock('asset', 'securityTokensOwnedByUser', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockAssetId(assetId)],
            dsMockUtils.createMockBool(true)
          ),
        ],
      });

      dsMockUtils.createQueryMock('asset', 'assets', {
        multi: [
          dsMockUtils.createMockOption(
            dsMockUtils.createMockSecurityToken({
              ownerDid: dsMockUtils.createMockIdentityId('someDid'),
              assetType: dsMockUtils.createMockAssetType(KnownAssetType.Commodity),
              divisible: dsMockUtils.createMockBool(false),
              totalSupply: dsMockUtils.createMockBalance(new BigNumber(0)),
            })
          ),
        ],
      });

      const assetResults = await assets.getAssets();

      expect(assetResults).toHaveLength(1);
      expect(assetResults[0].id).toBe(hexToUuid(assetId));
    });
  });

  describe('method: getFungibleAsset', () => {
    const assetId = '0x12341234123412341234123412341234';

    const ticker = 'TEST';
    it('should return a specific Asset for a specific asset ID', async () => {
      const asset = await assets.getFungibleAsset({ assetId });
      expect(asset.id).toBe(assetId);
    });

    it('should return a specific Asset for a ticker', async () => {
      jest.spyOn(utilsInternalModule, 'getAssetIdForTicker').mockResolvedValue(assetId);

      const asset = await assets.getFungibleAsset({ ticker });
      expect(asset.id).toBe(assetId);
    });

    it('should throw if the Asset does not exist', async () => {
      entityMockUtils.configureMocks({ fungibleAssetOptions: { exists: false } });

      await expect(assets.getFungibleAsset({ assetId })).rejects.toThrow(
        `There is no Asset with asset ID "${assetId}"`
      );

      jest.spyOn(utilsInternalModule, 'getAssetIdForTicker').mockResolvedValue(assetId);
      await expect(assets.getFungibleAsset({ ticker })).rejects.toThrow(
        `There is no Asset with ticker "${ticker}"`
      );
    });
  });

  describe('method: getNftCollection', () => {
    const ticker = 'NFTTEST';
    const assetId = '0x12341234123412341234123412341234';

    it('should return the collection for a specific asset ID', async () => {
      const nftCollection = await assets.getNftCollection({ assetId });
      expect(nftCollection.id).toBe(assetId);
    });

    it('should return the collection for a specific ticker', async () => {
      const nftCollection = await assets.getNftCollection({ ticker });
      jest.spyOn(utilsInternalModule, 'getAssetIdForTicker').mockResolvedValue(assetId);
      expect(nftCollection.id).toBe(assetId);
    });

    it('should throw if the collection does not exist', async () => {
      entityMockUtils.configureMocks({ nftCollectionOptions: { exists: false } });

      await expect(assets.getNftCollection({ assetId })).rejects.toThrow(
        `There is no NftCollection with asset ID "${assetId}"`
      );

      jest.spyOn(utilsInternalModule, 'getAssetIdForTicker').mockResolvedValue(assetId);
      await expect(assets.getNftCollection({ ticker })).rejects.toThrow(
        `There is no NftCollection with ticker "${ticker}"`
      );
    });
  });

  describe('method: get', () => {
    let requestPaginatedSpy: jest.SpyInstance;
    const assetId = '0x12341234123482348234123412341234';
    const otherId = '0x11111111111181118111111111111111';
    const expectedAssets = [
      {
        name: 'someAsset',
        id: hexToUuid(assetId),
      },
      {
        name: 'otherAsset',
        id: hexToUuid(otherId),
      },
    ];

    beforeAll(() => {
      requestPaginatedSpy = jest
        .spyOn(utilsInternalModule, 'requestPaginated')
        .mockClear()
        .mockImplementation();
    });

    beforeEach(() => {
      dsMockUtils.createQueryMock('asset', 'assetNames');
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should retrieve all Assets on the chain', async () => {
      const entries = expectedAssets.map(({ name, id }) =>
        tuple(
          {
            args: [dsMockUtils.createMockAssetId(uuidToHex(id))],
          } as unknown as StorageKey,
          dsMockUtils.createMockBytes(name)
        )
      );

      dsMockUtils.createQueryMock('asset', 'assets', {
        multi: [
          dsMockUtils.createMockOption(
            dsMockUtils.createMockSecurityToken({
              ownerDid: dsMockUtils.createMockIdentityId('someDid'),
              assetType: dsMockUtils.createMockAssetType(KnownAssetType.Commodity),
              divisible: dsMockUtils.createMockBool(false),
              totalSupply: dsMockUtils.createMockBalance(new BigNumber(0)),
            })
          ),
          dsMockUtils.createMockOption(
            dsMockUtils.createMockSecurityToken({
              ownerDid: dsMockUtils.createMockIdentityId('someDid'),
              assetType: dsMockUtils.createMockAssetType({
                NonFungible: dsMockUtils.createMockNftType(KnownAssetType.Derivative),
              }),
              divisible: dsMockUtils.createMockBool(false),
              totalSupply: dsMockUtils.createMockBalance(new BigNumber(0)),
            })
          ),
        ],
      });

      requestPaginatedSpy.mockResolvedValue({ entries, lastKey: null });

      const result = await assets.get();

      const expectedData = expectedAssets.map(({ id }) => expect.objectContaining({ id }));
      expect(result).toEqual({ data: expect.arrayContaining(expectedData), next: null });
    });

    it('should retrieve the first page of results', async () => {
      const entries = [
        tuple(
          {
            args: [dsMockUtils.createMockAssetId(uuidToHex(expectedAssets[0].id))],
          } as unknown as StorageKey,
          dsMockUtils.createMockBytes(expectedAssets[0].name)
        ),
      ];

      dsMockUtils.createQueryMock('asset', 'assets', {
        multi: [
          dsMockUtils.createMockOption(
            dsMockUtils.createMockSecurityToken({
              ownerDid: dsMockUtils.createMockIdentityId('someDid'),
              assetType: dsMockUtils.createMockAssetType(KnownAssetType.Commodity),
              divisible: dsMockUtils.createMockBool(false),
              totalSupply: dsMockUtils.createMockBalance(new BigNumber(0)),
            })
          ),
        ],
      });

      requestPaginatedSpy.mockResolvedValue({ entries, lastKey: 'someKey' });

      const result = await assets.get({ size: new BigNumber(1) });

      expect(result).toEqual({
        data: [expect.objectContaining({ id: expectedAssets[0].id })],
        next: 'someKey',
      });
    });
  });

  describe('method: getGlobalMetadataKeys', () => {
    let bytesToStringSpy: jest.SpyInstance;
    let u64ToBigNumberSpy: jest.SpyInstance;
    let meshMetadataSpecToMetadataSpecSpy: jest.SpyInstance;

    const rawIds = [
      dsMockUtils.createMockU64(new BigNumber(1)),
      dsMockUtils.createMockU64(new BigNumber(2)),
    ];
    const globalMetadata: GlobalMetadataKey[] = [
      {
        id: new BigNumber(1),
        name: 'SOME_NAME1',
        specs: {
          url: 'SOME_URL1',
          description: 'SOME_DESCRIPTION1',
          typeDef: 'SOME_TYPEDEF1',
        },
      },
      {
        id: new BigNumber(2),
        name: 'SOME_NAME2',
        specs: {},
      },
    ];
    let rawGlobalMetadata;

    beforeAll(() => {
      u64ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u64ToBigNumber');
      bytesToStringSpy = jest.spyOn(utilsConversionModule, 'bytesToString');
      meshMetadataSpecToMetadataSpecSpy = jest.spyOn(
        utilsConversionModule,
        'meshMetadataSpecToMetadataSpec'
      );
    });

    beforeEach(() => {
      rawIds.forEach(rawId => {
        when(rawId.eq).calledWith(rawId).mockReturnValue(true);
      });
      rawGlobalMetadata = globalMetadata.map(({ id, name, specs }, index) => {
        const rawId = rawIds[index];
        const rawName = dsMockUtils.createMockBytes(name);
        const { url, description, typeDef } = specs;
        const rawUrl = dsMockUtils.createMockBytes(url);
        const rawDescription = dsMockUtils.createMockBytes(description);
        const rawTypeDef = dsMockUtils.createMockBytes(typeDef);
        const rawSpecs = {
          url: dsMockUtils.createMockOption(rawUrl),
          description: dsMockUtils.createMockOption(rawDescription),
          typeDef: dsMockUtils.createMockOption(rawTypeDef),
        };
        when(bytesToStringSpy).calledWith(rawUrl).mockReturnValue(url);
        when(bytesToStringSpy).calledWith(rawDescription).mockReturnValue(description);
        when(bytesToStringSpy).calledWith(rawTypeDef).mockReturnValue(typeDef);
        when(bytesToStringSpy).calledWith(rawName).mockReturnValue(name);
        when(u64ToBigNumberSpy).calledWith(rawId).mockReturnValue(id);

        const rawMetadataSpecs = dsMockUtils.createMockOption(
          dsMockUtils.createMockAssetMetadataSpec(rawSpecs)
        );
        when(meshMetadataSpecToMetadataSpecSpy).calledWith(rawMetadataSpecs).mockReturnValue(specs);

        return {
          rawId,
          rawName: dsMockUtils.createMockOption(rawName),
          rawSpecs: rawMetadataSpecs,
        };
      });

      dsMockUtils.createQueryMock('asset', 'assetMetadataGlobalKeyToName', {
        entries: rawGlobalMetadata.map(({ rawId, rawName }) => tuple([rawId], rawName)),
      });

      dsMockUtils.createQueryMock('asset', 'assetMetadataGlobalSpecs', {
        entries: rawGlobalMetadata.map(({ rawId, rawSpecs }) => tuple([rawId], rawSpecs)),
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should retrieve all Asset Global Metadata on the chain', async () => {
      const result = await assets.getGlobalMetadataKeys();
      expect(result).toEqual(globalMetadata);
    });
  });

  describe('method: registerCustomAssetType', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        name: 'SOME_ASSET_TYPE',
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<BigNumber>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await assets.registerCustomAssetType(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getNextCustomAssetTypeId', () => {
    it('should return the next sequence in custom Asset type storage', async () => {
      const currentMaxCustomAssetTypeId = new BigNumber(2);
      dsMockUtils.createQueryMock('asset', 'customTypeIdSequence', {
        returnValue: dsMockUtils.createMockU32(currentMaxCustomAssetTypeId),
      });

      const result = await assets.getNextCustomAssetTypeId();

      expect(result).toEqual(currentMaxCustomAssetTypeId.plus(1));
    });
  });
});
