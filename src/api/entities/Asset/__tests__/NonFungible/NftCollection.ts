import { bool } from '@polkadot/types';
import { PolymeshPrimitivesAssetIdentifier } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  BaseAsset,
  Context,
  DefaultPortfolio,
  Entity,
  NftCollection,
  PolymeshError,
  PolymeshTransaction,
} from '~/internal';
import { assetQuery, assetTransactionQuery } from '~/middleware/queries/assets';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  ErrorCode,
  EventIdEnum,
  KnownNftType,
  MetadataType,
  SecurityIdentifier,
  SecurityIdentifierType,
} from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

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
  let getAssetIdForMiddlewareSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    getAssetIdForMiddlewareSpy = jest.spyOn(utilsInternalModule, 'getAssetIdForMiddleware');
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
    it('should assign assetId to instance', () => {
      const assetId = 'test';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ assetId }, context);

      expect(nftCollection.id).toBe(assetId);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(NftCollection.isUniqueIdentifiers({ assetId: '0x1234' })).toBe(true);
      expect(NftCollection.isUniqueIdentifiers({})).toBe(false);
      expect(NftCollection.isUniqueIdentifiers({ assetId: 3 })).toBe(false);
    });
  });

  describe('method: transferOwnership', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const assetId = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ assetId }, context);
      const target = 'someOtherDid';
      const expiry = new Date('10/14/3040');

      const args = {
        target,
        expiry,
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<NftCollection>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { asset: nftCollection, ...args }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await nftCollection.transferOwnership(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: investorCount', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const assetId = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ assetId }, context);

      dsMockUtils.createQueryMock('nft', 'numberOfNFTs', {
        entries: [
          tuple(
            [dsMockUtils.createMockAssetId(assetId), dsMockUtils.createMockIdentityId('someDid')],
            dsMockUtils.createMockU64(new BigNumber(3))
          ),
        ],
      });

      const investorCount = await nftCollection.investorCount();

      expect(investorCount).toEqual(new BigNumber(1));
    });
  });

  describe('method: getIdentifiers', () => {
    let assetId: string;
    let isinValue: string;
    let isinMock: PolymeshPrimitivesAssetIdentifier;
    let securityIdentifiers: SecurityIdentifier[];

    let context: Context;
    let nftCollection: NftCollection;

    beforeAll(() => {
      assetId = 'TEST';
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
      nftCollection = new NftCollection({ assetId }, context);
    });

    it('should return the list of security identifiers for an NftCollection', async () => {
      dsMockUtils.createQueryMock('asset', 'assetIdentifiers', {
        returnValue: [isinMock],
      });

      const result = await nftCollection.getIdentifiers();

      expect(result[0].value).toBe(isinValue);
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      dsMockUtils
        .createQueryMock('asset', 'assetIdentifiers')
        .mockImplementation(async (_, cbFunc) => {
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
      const assetId = '0x1234';
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const blockHash = 'someHash';
      const eventIdx = new BigNumber(1);
      const variables = {
        id: assetId,
      };
      const fakeResult = { blockNumber, blockHash, blockDate, eventIndex: eventIdx };
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ assetId }, context);
      when(getAssetIdForMiddlewareSpy).calledWith(assetId, context).mockResolvedValue(assetId);

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
      const assetId = '0x1234';
      const variables = {
        id: assetId,
      };
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ assetId }, context);
      when(getAssetIdForMiddlewareSpy).calledWith(assetId, context).mockResolvedValue(assetId);

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
      const assetId = '0x1234';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ assetId }, context);

      frozenMock.mockResolvedValue(rawBoolValue);

      const result = await nftCollection.isFrozen();

      expect(result).toBe(boolValue);
    });

    it('should allow subscription', async () => {
      const assetId = '0x1234';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ assetId }, context);
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
    let assetId: string;
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
            [dsMockUtils.createMockAssetId(assetId), dsMockUtils.createMockIdentityId(did)],
            dsMockUtils.createMockU64(new BigNumber(3))
          ),
        ],
      });
    });

    beforeAll(() => {
      assetId = '0x1234';
    });

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      internalDetailsSpy = jest.spyOn(BaseAsset.prototype as any, 'details');
      internalDetailsSpy.mockResolvedValue(mockDetails);
    });

    it('should return details about the collection', async () => {
      const nftCollection = new NftCollection({ assetId }, context);

      const result = await nftCollection.details();

      expect(result).toEqual({
        ...mockDetails,
        totalSupply: new BigNumber(3),
      });
    });

    it('should allow subscription', async () => {
      const nftCollection = new NftCollection({ assetId }, context);
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
      const assetId = '0x1234';
      const id = new BigNumber(1);
      const collection = new NftCollection({ assetId }, context);
      const mockGlobalKey = dsMockUtils.createMockAssetMetadataKey({
        Global: dsMockUtils.createMockU64(id),
      });
      const mockLocalKey = dsMockUtils.createMockAssetMetadataKey({
        Local: dsMockUtils.createMockU64(id),
      });

      jest.spyOn(collection, 'getCollectionId').mockResolvedValue(id);

      when(meshMetadataKeyToMetadataKeySpy)
        .calledWith(mockGlobalKey, assetId)
        .mockReturnValue({ type: MetadataType.Global, id });

      when(meshMetadataKeyToMetadataKeySpy)
        .calledWith(mockLocalKey, assetId)
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
        assetId,
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
      jest.spyOn(utilsInternalModule, 'getAssetIdAndTicker').mockResolvedValue({
        assetId,
        ticker: 'SOME_TICKER',
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
            assetId,
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
      const assetId = '0x1234';
      const id = new BigNumber(1);
      const collection = new NftCollection({ assetId }, context);
      const mockMetadataKey = dsMockUtils.createMockAssetMetadataKey({
        Global: dsMockUtils.createMockU64(id),
      });

      jest.spyOn(collection, 'getCollectionId').mockResolvedValue(id);

      when(meshMetadataKeyToMetadataKeySpy)
        .calledWith(mockMetadataKey, assetId)
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
      const assetId = '0x1234';
      const collection = new NftCollection({ assetId }, context);
      const id = new BigNumber(1);
      const rawId = dsMockUtils.createMockU64(id);

      const idMock = dsMockUtils.createQueryMock('nft', 'collectionAsset', { returnValue: rawId });

      const result = await collection.getCollectionId();

      expect(result).toEqual(new BigNumber(1));

      await collection.getCollectionId();

      expect(idMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('method: issue', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const assetId = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const collection = new NftCollection({ assetId }, context);

      const args = {
        metadata: [],
        portfolioId: new BigNumber(1),
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<NftCollection>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { collection, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await collection.issue(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: controllerTransfer', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const assetId = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const collection = new NftCollection({ assetId }, context);

      const args = {
        originPortfolio: entityMockUtils.getDefaultPortfolioInstance(),
        nfts: [new BigNumber(1)],
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<NftCollection>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { collection, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await collection.controllerTransfer(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getNft', () => {
    it('should return the NFT if it exists', async () => {
      const assetId = 'TEST';
      const id = new BigNumber(1);
      const context = dsMockUtils.getContextInstance();
      const collection = new NftCollection({ assetId }, context);

      entityMockUtils.configureMocks({
        nftOptions: { exists: true },
      });

      const nft = await collection.getNft({ id });

      expect(nft).toEqual(expect.objectContaining({ id }));
    });

    it('should throw an error if the NFT does not exist', async () => {
      const assetId = 'TEST';
      const id = new BigNumber(1);
      const context = dsMockUtils.getContextInstance();
      const collection = new NftCollection({ assetId }, context);

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

  describe('method: getTransactionHistory', () => {
    it('should return the list of the collection transactions', async () => {
      const assetId = '0x1234';
      const context = dsMockUtils.getContextInstance();
      const asset = new NftCollection({ assetId }, context);
      when(getAssetIdForMiddlewareSpy).calledWith(assetId, context).mockResolvedValue(assetId);

      const middlewareAsset = {
        id: assetId,
        ticker: 'SOME_TICKER',
      };
      const transactionResponse = {
        totalCount: new BigNumber(5),
        nodes: [
          {
            asset: middlewareAsset,
            nftIds: ['1'],
            eventId: EventIdEnum.Issued,
            toPortfolioId: 'SOME_DID/0',
            fromPortfolioId: null,
            extrinsicIdx: 1,
            eventIdx: 1,
            createdBlock: {
              blockId: new BigNumber(123),
              hash: 'SOME_HASH',
              datetime: new Date('2022/12/31'),
            },
          },
          {
            asset: middlewareAsset,
            nftIds: ['1'],
            eventId: EventIdEnum.Transfer,
            toPortfolioId: 'OTHER_DID/0',
            fromPortfolioId: 'SOME_DID/0',
            instructionId: 1,
            instructionMemo: 'some memo',
            extrinsicIdx: 1,
            eventIdx: 1,
            createdBlock: {
              blockId: new BigNumber(123),
              hash: 'SOME_HASH',
              datetime: new Date('2022/12/31'),
            },
          },
        ],
      };

      dsMockUtils.createApolloQueryMock(
        assetTransactionQuery({ assetId }, new BigNumber(3), new BigNumber(0)),
        {
          assetTransactions: transactionResponse,
        }
      );

      when(jest.spyOn(utilsInternalModule, 'getAssetIdFromMiddleware'))
        .calledWith(middlewareAsset, context)
        .mockReturnValue(assetId);

      const result = await asset.getTransactionHistory({
        start: new BigNumber(0),
        size: new BigNumber(3),
      });

      expect(result.data[0].asset.id).toEqual(assetId);
      expect(result.data[0].nfts).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: new BigNumber(1) })])
      );
      expect(result.data[0].event).toEqual(transactionResponse.nodes[0].eventId);
      expect(result.data[0].from).toBeNull();
      expect(result.data[0].to instanceof DefaultPortfolio).toBe(true);

      expect(result.data[1].asset.id).toEqual(assetId);
      expect(result.data[1].nfts).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: new BigNumber(1) })])
      );
      expect(result.data[1].event).toEqual(transactionResponse.nodes[1].eventId);
      expect(result.data[1].to instanceof DefaultPortfolio).toBe(true);
      expect(result.data[1].from instanceof DefaultPortfolio).toBe(true);
      expect(result.data[1].instructionId).toEqual(new BigNumber(1));
      expect(result.data[1].instructionMemo).toEqual('some memo');

      expect(result.count).toEqual(transactionResponse.totalCount);
      expect(result.next).toEqual(new BigNumber(2));
    });
  });

  describe('method: exists', () => {
    it('should return whether the NftCollection exists', async () => {
      const assetId = '0x1234';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ assetId }, context);

      dsMockUtils.createQueryMock('nft', 'collectionAsset', {
        returnValue: new BigNumber(10),
      });

      let result = await nftCollection.exists();

      expect(result).toBe(true);

      dsMockUtils.createQueryMock('nft', 'collectionAsset', {
        returnValue: new BigNumber(0),
      });

      result = await nftCollection.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ assetId: '0x1234' }, context);

      expect(nftCollection.toHuman()).toBe('0x1234');
    });
  });
});
