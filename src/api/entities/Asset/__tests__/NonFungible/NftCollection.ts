import { bool } from '@polkadot/types';
import { PolymeshPrimitivesAssetIdentifier } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  BaseAsset,
  Context,
  Entity,
  NftCollection,
  PolymeshError,
  PolymeshTransaction,
} from '~/internal';
import { assetQuery } from '~/middleware/queries';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  ErrorCode,
  KnownNftType,
  MetadataType,
  SecurityIdentifier,
  SecurityIdentifierType,
} from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/MetadataEntry',
  require('~/testUtils/mocks/entities').mockMetadataEntryModule('~/api/entities/MetadataEntry')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);
jest.mock(
  '~/api/entities/Asset/NonFungible',
  require('~/testUtils/mocks/entities').mockNftModule('~/api/entities/Asset/NonFungible')
);

describe('NftCollection class', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
    jest.clearAllMocks();
  });

  it('should extend Entity', () => {
    expect(NftCollection.prototype).toBeInstanceOf(Entity);
  });

  describe('constructor', () => {
    it('should assign ticker and did to instance', () => {
      const ticker = 'test';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker }, context);

      expect(nftCollection.ticker).toBe(ticker);
      expect(nftCollection.did).toBe(utilsConversionModule.tickerToDid(ticker));
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(NftCollection.isUniqueIdentifiers({ ticker: 'SOME_TICKER' })).toBe(true);
      expect(NftCollection.isUniqueIdentifiers({})).toBe(false);
      expect(NftCollection.isUniqueIdentifiers({ ticker: 3 })).toBe(false);
    });
  });

  describe('method: transferOwnership', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const ticker = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker }, context);
      const target = 'someOtherDid';
      const expiry = new Date('10/14/3040');

      const args = {
        target,
        expiry,
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<NftCollection>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { ticker, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await nftCollection.transferOwnership(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: investorCount', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const ticker = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker }, context);

      dsMockUtils.createQueryMock('nft', 'numberOfNFTs', {
        entries: [
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId('someDid')],
            dsMockUtils.createMockU64(new BigNumber(3))
          ),
        ],
      });

      const investorCount = await nftCollection.investorCount();

      expect(investorCount).toEqual(new BigNumber(1));
    });
  });

  describe('method: getIdentifiers', () => {
    let ticker: string;
    let isinValue: string;
    let isinMock: PolymeshPrimitivesAssetIdentifier;
    let securityIdentifiers: SecurityIdentifier[];

    let context: Context;
    let nftCollection: NftCollection;

    beforeAll(() => {
      ticker = 'TEST';
      isinValue = 'FAKE ISIN';
      isinMock = dsMockUtils.createMockAssetIdentifier({
        Isin: dsMockUtils.createMockU8aFixed(isinValue),
      });
      securityIdentifiers = [
        {
          type: SecurityIdentifierType.Isin,
          value: isinValue,
        },
      ];
    });

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      nftCollection = new NftCollection({ ticker }, context);
    });

    it('should return the list of security identifiers for an NftCollection', async () => {
      dsMockUtils.createQueryMock('asset', 'identifiers', {
        returnValue: [isinMock],
      });

      const result = await nftCollection.getIdentifiers();

      expect(result[0].value).toBe(isinValue);
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      dsMockUtils.createQueryMock('asset', 'identifiers').mockImplementation(async (_, cbFunc) => {
        cbFunc([isinMock]);

        return unsubCallback;
      });

      const callback = jest.fn();
      const result = await nftCollection.getIdentifiers(callback);

      expect(result).toBe(unsubCallback);
      expect(callback).toBeCalledWith(securityIdentifiers);
    });
  });

  describe('method: createdAt', () => {
    it('should return the event identifier object of the Asset creation', async () => {
      const ticker = 'SOME_TICKER';
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const blockHash = 'someHash';
      const eventIdx = new BigNumber(1);
      const variables = {
        ticker,
      };
      const fakeResult = { blockNumber, blockHash, blockDate, eventIndex: eventIdx };
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker }, context);

      dsMockUtils.createApolloQueryMock(assetQuery(variables), {
        assets: {
          nodes: [
            {
              createdBlock: {
                blockId: blockNumber.toNumber(),
                datetime: blockDate,
                hash: blockHash,
              },
              eventIdx: eventIdx.toNumber(),
            },
          ],
        },
      });

      const result = await nftCollection.createdAt();

      expect(result).toEqual(fakeResult);
    });

    it('should return null if the query result is empty', async () => {
      const ticker = 'SOME_TICKER';
      const variables = {
        ticker,
      };
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker }, context);

      dsMockUtils.createApolloQueryMock(assetQuery(variables), {
        assets: {
          nodes: [],
        },
      });
      const result = await nftCollection.createdAt();
      expect(result).toBeNull();
    });
  });

  describe('method: isFrozen', () => {
    let frozenMock: jest.Mock;
    let boolValue: boolean;
    let rawBoolValue: bool;

    beforeAll(() => {
      boolValue = true;
      rawBoolValue = dsMockUtils.createMockBool(boolValue);
    });

    beforeEach(() => {
      frozenMock = dsMockUtils.createQueryMock('asset', 'frozen');
    });

    it('should return whether the NftCollection is frozen or not', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker }, context);

      frozenMock.mockResolvedValue(rawBoolValue);

      const result = await nftCollection.isFrozen();

      expect(result).toBe(boolValue);
    });

    it('should allow subscription', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker }, context);
      const unsubCallback = 'unsubCallBack';

      frozenMock.mockImplementation(async (_, cbFunc) => {
        cbFunc(rawBoolValue);
        return unsubCallback;
      });

      const callback = jest.fn();
      const result = await nftCollection.isFrozen(callback);

      expect(result).toBe(unsubCallback);
      expect(callback).toBeCalledWith(boolValue);
    });
  });

  describe('method: details', () => {
    let ticker: string;
    let internalDetailsSpy: jest.SpyInstance;

    const did = 'someDid';
    const mockDetails = {
      owner: dsMockUtils.createMockIdentityId('someDid'),
      totalSupply: new BigNumber(0), // chain doesn't track supply for NFTs
      type: dsMockUtils.createMockAssetType({
        NonFungible: dsMockUtils.createMockNftType(KnownNftType.FixedIncome),
      }),
      divisible: false,
    };

    let context: Context;

    beforeEach(() => {
      dsMockUtils.createQueryMock('nft', 'numberOfNFTs', {
        entries: [
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId(did)],
            dsMockUtils.createMockU64(new BigNumber(3))
          ),
        ],
      });
    });

    beforeAll(() => {
      ticker = 'TICKER';
    });

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      internalDetailsSpy = jest.spyOn(BaseAsset.prototype as any, 'details');
      internalDetailsSpy.mockResolvedValue(mockDetails);
    });

    it('should return details about the collection', async () => {
      const nftCollection = new NftCollection({ ticker }, context);

      const result = await nftCollection.details();

      expect(result).toEqual({
        ...mockDetails,
        totalSupply: new BigNumber(3),
      });
    });

    it('should allow subscription', async () => {
      const nftCollection = new NftCollection({ ticker }, context);
      const fakeUnsubCallback = 'unsubCallback';

      internalDetailsSpy.mockImplementation(cb => {
        cb(mockDetails);
        return fakeUnsubCallback;
      });

      const callback = jest.fn();
      const result = await nftCollection.details(callback);

      expect(result).toBe(fakeUnsubCallback);
      expect(callback).toBeCalledWith({ ...mockDetails, totalSupply: new BigNumber(3) });
    });
  });

  describe('method: collectionKeys', () => {
    let u64ToBigNumberSpy: jest.SpyInstance;
    let meshMetadataKeyToMetadataKeySpy: jest.SpyInstance;

    beforeAll(() => {
      u64ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u64ToBigNumber');
      meshMetadataKeyToMetadataKeySpy = jest.spyOn(
        utilsConversionModule,
        'meshMetadataKeyToMetadataKey'
      );
    });

    it('should return required metadata', async () => {
      const context = dsMockUtils.getContextInstance();
      const ticker = 'TICKER';
      const id = new BigNumber(1);
      const collection = new NftCollection({ ticker }, context);
      const mockGlobalKey = dsMockUtils.createMockAssetMetadataKey({
        Global: dsMockUtils.createMockU64(id),
      });
      const mockLocalKey = dsMockUtils.createMockAssetMetadataKey({
        Local: dsMockUtils.createMockU64(id),
      });

      jest.spyOn(collection, 'getCollectionId').mockResolvedValue(id);

      when(meshMetadataKeyToMetadataKeySpy)
        .calledWith(mockGlobalKey, ticker)
        .mockReturnValue({ type: MetadataType.Global, id });

      when(meshMetadataKeyToMetadataKeySpy)
        .calledWith(mockLocalKey, ticker)
        .mockReturnValue({ type: MetadataType.Local, id });

      u64ToBigNumberSpy.mockReturnValue(id);
      dsMockUtils.createQueryMock('nft', 'collectionKeys', {
        returnValue: dsMockUtils.createMockBTreeSet([mockGlobalKey, mockLocalKey]),
      });

      const mockGlobalEntry = entityMockUtils.getMetadataEntryInstance({
        id,
        type: MetadataType.Global,
      });
      const mockLocalEntry = entityMockUtils.getMetadataEntryInstance({
        id,
        ticker,
        type: MetadataType.Local,
      });
      mockGlobalEntry.details.mockResolvedValue({
        name: 'Example Global Name',
        specs: {},
      });
      mockLocalEntry.details.mockResolvedValue({
        name: 'Example Local Name',
        specs: {},
      });
      jest.spyOn(collection.metadata, 'get').mockResolvedValue([mockGlobalEntry, mockLocalEntry]);
      const result = await collection.collectionKeys();

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: MetadataType.Global,
            id: new BigNumber(1),
            name: 'Example Global Name',
            specs: {},
          }),
          expect.objectContaining({
            ticker,
            type: MetadataType.Local,
            id: new BigNumber(1),
            name: 'Example Local Name',
            specs: {},
          }),
        ])
      );
    });

    it('should throw an error if needed metadata details are not found', async () => {
      const context = dsMockUtils.getContextInstance();
      const ticker = 'TICKER';
      const id = new BigNumber(1);
      const collection = new NftCollection({ ticker }, context);
      const mockMetadataKey = dsMockUtils.createMockAssetMetadataKey({
        Global: dsMockUtils.createMockU64(id),
      });

      jest.spyOn(collection, 'getCollectionId').mockResolvedValue(id);

      when(meshMetadataKeyToMetadataKeySpy)
        .calledWith(mockMetadataKey, ticker)
        .mockReturnValue({ type: MetadataType.Global, id });

      u64ToBigNumberSpy.mockReturnValue(id);
      dsMockUtils.createQueryMock('nft', 'collectionKeys', {
        returnValue: dsMockUtils.createMockBTreeSet([mockMetadataKey]),
      });

      const mockMetadataEntry = entityMockUtils.getMetadataEntryInstance({
        id: id.plus(1),
        type: MetadataType.Global,
      });
      jest.spyOn(collection.metadata, 'get').mockResolvedValue([mockMetadataEntry]);

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Failed to find metadata details',
      });

      await expect(collection.collectionKeys()).rejects.toThrow(expectedError);
    });
  });

  describe('method: getCollectionId', () => {
    it('should return and cache the collection ID', async () => {
      const context = dsMockUtils.getContextInstance();
      const ticker = 'TICKER';
      const collection = new NftCollection({ ticker }, context);
      const id = new BigNumber(1);
      const rawId = dsMockUtils.createMockU64(id);

      const idMock = dsMockUtils.createQueryMock('nft', 'collectionTicker', { returnValue: rawId });

      const result = await collection.getCollectionId();

      expect(result).toEqual(new BigNumber(1));

      await collection.getCollectionId();

      expect(idMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('method: issue', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const ticker = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const collection = new NftCollection({ ticker }, context);

      const args = {
        metadata: [],
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<NftCollection>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { ticker, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await collection.issue(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getNft', () => {
    it('should return the NFT if it exists', async () => {
      const ticker = 'TEST';
      const id = new BigNumber(1);
      const context = dsMockUtils.getContextInstance();
      const collection = new NftCollection({ ticker }, context);

      entityMockUtils.configureMocks({
        nftOptions: { exists: true },
      });

      const nft = await collection.getNft({ id });

      expect(nft).toEqual(expect.objectContaining({ id }));
    });

    it('should throw an error if the NFT does not exist', async () => {
      const ticker = 'TEST';
      const id = new BigNumber(1);
      const context = dsMockUtils.getContextInstance();
      const collection = new NftCollection({ ticker }, context);

      entityMockUtils.configureMocks({
        nftOptions: { exists: false },
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The NFT does not exist',
      });

      await expect(collection.getNft({ id })).rejects.toThrow(expectedError);
    });
  });

  describe('method: exists', () => {
    it('should return whether the NftCollection exists', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker }, context);

      dsMockUtils.createQueryMock('nft', 'collectionTicker', {
        returnValue: new BigNumber(10),
      });

      let result = await nftCollection.exists();

      expect(result).toBe(true);

      dsMockUtils.createQueryMock('nft', 'collectionTicker', {
        returnValue: new BigNumber(0),
      });

      result = await nftCollection.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker: 'SOME_TICKER' }, context);

      expect(nftCollection.toHuman()).toBe('SOME_TICKER');
    });
  });
});
