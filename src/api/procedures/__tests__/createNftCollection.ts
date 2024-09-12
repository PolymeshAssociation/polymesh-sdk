import { Bytes, u32 } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesAssetIdentifier,
  PolymeshPrimitivesAssetNonFungibleType,
  PolymeshPrimitivesDocument,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareCreateNftCollection,
  prepareStorage,
  Storage,
} from '~/api/procedures/createNftCollection';
import { Context, NftCollection, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  AssetDocument,
  ErrorCode,
  Identity,
  KnownNftType,
  MetadataType,
  RoleType,
  SecurityIdentifier,
  SecurityIdentifierType,
  TickerReservationStatus,
  TxTags,
} from '~/types';
import { InternalNftType, PolymeshTx } from '~/types/internal';
import { uuidToHex } from '~/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);
jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('createNftCollection procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let nameToAssetNameSpy: jest.SpyInstance<Bytes, [string, Context]>;
  let internalNftTypeToNftTypeSpy: jest.SpyInstance<
    PolymeshPrimitivesAssetNonFungibleType,
    [InternalNftType, Context]
  >;
  let securityIdentifierToAssetIdentifierSpy: jest.SpyInstance<
    PolymeshPrimitivesAssetIdentifier,
    [SecurityIdentifier, Context]
  >;
  let assetDocumentToDocumentSpy: jest.SpyInstance<
    PolymeshPrimitivesDocument,
    [AssetDocument, Context]
  >;
  let stringToBytesSpy: jest.SpyInstance<Bytes, [string, Context]>;
  let bigNumberToU32: jest.SpyInstance<u32, [BigNumber, Context]>;
  let ticker: string;
  let assetId: string;
  let signingIdentity: Identity;
  let name: string;
  let nftType: string;
  let securityIdentifiers: SecurityIdentifier[];
  let documents: AssetDocument[];
  let rawTicker: PolymeshPrimitivesTicker;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let rawName: Bytes;
  let rawType: PolymeshPrimitivesAssetNonFungibleType;
  let rawIdentifiers: PolymeshPrimitivesAssetIdentifier[];
  let rawDocuments: PolymeshPrimitivesDocument[];
  let args: Params;
  let protocolFees: BigNumber[];

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: {
        balance: {
          free: new BigNumber(1000),
          locked: new BigNumber(0),
          total: new BigNumber(1000),
        },
      },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    jest.spyOn(utilsInternalModule, 'asBaseAsset').mockImplementation();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    nameToAssetNameSpy = jest.spyOn(utilsConversionModule, 'nameToAssetName');
    internalNftTypeToNftTypeSpy = jest.spyOn(utilsConversionModule, 'internalNftTypeToNftType');
    securityIdentifierToAssetIdentifierSpy = jest.spyOn(
      utilsConversionModule,
      'securityIdentifierToAssetIdentifier'
    );

    assetDocumentToDocumentSpy = jest.spyOn(utilsConversionModule, 'assetDocumentToDocument');
    stringToBytesSpy = jest.spyOn(utilsConversionModule, 'stringToBytes');
    bigNumberToU32 = jest.spyOn(utilsConversionModule, 'bigNumberToU32');
    ticker = 'NFT';
    assetId = '12341234-1234-1234-1234-123412341234';
    name = 'someName';
    signingIdentity = entityMockUtils.getIdentityInstance();
    nftType = KnownNftType.Derivative;
    securityIdentifiers = [
      {
        type: SecurityIdentifierType.Isin,
        value: '12345',
      },
    ];
    documents = [
      {
        name: 'someDocument',
        uri: 'someUri',
        contentHash: 'someHash',
      },
    ];
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawAssetId = dsMockUtils.createMockAssetId(uuidToHex(assetId));
    rawName = dsMockUtils.createMockBytes(name);
    rawType = dsMockUtils.createMockNftType(nftType as KnownNftType);
    rawIdentifiers = securityIdentifiers.map(({ type, value }) =>
      dsMockUtils.createMockAssetIdentifier({
        [type as 'Lei']: dsMockUtils.createMockU8aFixed(value),
      })
    );
    rawDocuments = documents.map(({ uri, contentHash, name: docName, type, filedAt }) =>
      dsMockUtils.createMockDocument({
        name: dsMockUtils.createMockBytes(docName),
        uri: dsMockUtils.createMockBytes(uri),
        contentHash: dsMockUtils.createMockDocumentHash({
          H128: dsMockUtils.createMockU8aFixed(contentHash),
        }),
        docType: dsMockUtils.createMockOption(type ? dsMockUtils.createMockBytes(type) : null),
        filingDate: dsMockUtils.createMockOption(
          filedAt ? dsMockUtils.createMockMoment(new BigNumber(filedAt.getTime())) : null
        ),
      })
    );
    args = {
      ticker,
      name,
      nftType,
      collectionKeys: [],
    };
    protocolFees = [new BigNumber(250), new BigNumber(150), new BigNumber(100)];
  });

  let createAssetTransactionTx: PolymeshTx;
  let registerUniqueTickerTx: PolymeshTx;
  let registerCustomAssetTypeTx: PolymeshTx;
  let linkTickerToAssetIdTx: PolymeshTx;
  let createNftCollectionTransaction: PolymeshTx;
  let registerAssetMetadataLocalTypeTransaction: PolymeshTx;
  let addDocumentsTransaction: PolymeshTx<[PolymeshPrimitivesDocument[], PolymeshPrimitivesTicker]>;

  beforeEach(() => {
    dsMockUtils.createQueryMock('asset', 'tickerConfig', {
      returnValue: dsMockUtils.createMockTickerRegistrationConfig(),
    });

    createAssetTransactionTx = dsMockUtils.createTxMock('asset', 'createAsset');
    registerUniqueTickerTx = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
    linkTickerToAssetIdTx = dsMockUtils.createTxMock('asset', 'linkTickerToAssetId');
    createNftCollectionTransaction = dsMockUtils.createTxMock('nft', 'createNftCollection');
    registerCustomAssetTypeTx = dsMockUtils.createTxMock('asset', 'registerCustomAssetType');
    registerAssetMetadataLocalTypeTransaction = dsMockUtils.createTxMock(
      'asset',
      'registerAssetMetadataLocalType'
    );
    addDocumentsTransaction = dsMockUtils.createTxMock('asset', 'addDocuments');

    mockContext = dsMockUtils.getContextInstance({
      withSigningManager: true,
      getNextAssetId: assetId,
    });

    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
    when(assetToMeshAssetIdSpy)
      .calledWith(expect.objectContaining({ id: assetId }), mockContext)
      .mockReturnValue(rawAssetId);
    when(nameToAssetNameSpy).calledWith(name, mockContext).mockReturnValue(rawName);
    when(internalNftTypeToNftTypeSpy)
      .calledWith(nftType as KnownNftType, mockContext)
      .mockReturnValue(rawType);
    when(securityIdentifierToAssetIdentifierSpy)
      .calledWith(securityIdentifiers[0], mockContext)
      .mockReturnValue(rawIdentifiers[0]);
    when(assetDocumentToDocumentSpy)
      .calledWith(
        { uri: documents[0].uri, contentHash: documents[0].contentHash, name: documents[0].name },
        mockContext
      )
      .mockReturnValue(rawDocuments[0]);

    when(mockContext.getProtocolFees)
      .calledWith({ tags: [TxTags.asset.CreateAsset] })
      .mockResolvedValue([{ tag: TxTags.asset.CreateAsset, fees: protocolFees[1] }]);
    when(mockContext.getProtocolFees)
      .calledWith({ tags: [TxTags.asset.RegisterCustomAssetType] })
      .mockResolvedValue([{ tag: TxTags.asset.RegisterCustomAssetType, fees: protocolFees[2] }]);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if an Asset with that ticker has already been launched for non NFT type', () => {
    const proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(mockContext, {
      customTypeData: null,
      needsLocalMetadata: false,
      status: TickerReservationStatus.AssetCreated,
      assetId,
      isAssetCreated: true,
    });

    return expect(prepareCreateNftCollection.call(proc, args)).rejects.toThrow(
      'Only assets with type NFT can be turned into NFT collections'
    );
  });

  it('should throw an error if the ticker contains non numeric characters', () => {
    const proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(mockContext, {
      customTypeData: null,
      needsLocalMetadata: false,
      status: TickerReservationStatus.Reserved,
      assetId,
      isAssetCreated: false,
    });

    return expect(
      prepareCreateNftCollection.call(proc, { ...args, ticker: 'SOME_TICKER!' })
    ).rejects.toThrow('New Tickers can only contain alphanumeric values "_", "-", ".", and "/"');
  });

  describe('prepareCreateNftCollection', () => {
    const rawDivisible = dsMockUtils.createMockBool(false);
    const rawAssetType = dsMockUtils.createMockAssetType({ NonFungible: rawType });
    let collectionKeysSpy: jest.SpyInstance;
    let metadataSpecToMeshMetadataSpecSpy: jest.SpyInstance;
    beforeEach(() => {
      jest.spyOn(utilsConversionModule, 'nameToAssetName').mockReturnValue(rawName);
      jest.spyOn(utilsConversionModule, 'stringToTicker').mockReturnValue(rawTicker);
      jest.spyOn(utilsConversionModule, 'booleanToBool').mockReturnValue(rawDivisible);
      jest
        .spyOn(utilsConversionModule, 'internalAssetTypeToAssetType')
        .mockReturnValue(rawAssetType);
      jest
        .spyOn(utilsConversionModule, 'securityIdentifierToAssetIdentifier')
        .mockReturnValue('fakeId' as unknown as PolymeshPrimitivesAssetIdentifier);

      collectionKeysSpy = jest.spyOn(utilsConversionModule, 'collectionKeysToMetadataKeys');
      metadataSpecToMeshMetadataSpecSpy = jest.spyOn(
        utilsConversionModule,
        'metadataSpecToMeshMetadataSpec'
      );
    });

    it('should add an Asset creation transaction to the batch', async () => {
      const proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(mockContext, {
        customTypeData: null,
        needsLocalMetadata: false,
        status: TickerReservationStatus.Reserved,
        assetId,
        isAssetCreated: false,
      });
      const rawCollectionKeys = [] as const;
      collectionKeysSpy.mockReturnValue(rawCollectionKeys);
      stringToBytesSpy.mockReturnValue(rawName);

      const result = await prepareCreateNftCollection.call(proc, {
        ticker,
        nftType: KnownNftType.Derivative,
        collectionKeys: [],
        securityIdentifiers: [{ type: SecurityIdentifierType.Lei, value: '' }],
        documents,
      });

      expect(result.transactions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            transaction: createAssetTransactionTx,
            fee: undefined,
            args: [rawName, rawDivisible, rawAssetType, ['fakeId'], null],
          }),
          expect.objectContaining({
            transaction: linkTickerToAssetIdTx,
            args: [rawTicker, rawAssetId],
          }),
          expect.objectContaining({
            transaction: addDocumentsTransaction,
            feeMultiplier: new BigNumber(1),
            args: [rawDocuments, rawAssetId],
          }),
          expect.objectContaining({
            transaction: createNftCollectionTransaction,
            args: expect.arrayContaining([rawAssetId, rawType, []]),
          }),
        ])
      );
    });

    it('should not have createAsset if Asset is already created', async () => {
      entityMockUtils.configureMocks({
        fungibleAssetOptions: {
          details: { assetType: KnownNftType.Derivative, nonFungible: true },
        },
      });

      const proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(mockContext, {
        customTypeData: null,
        needsLocalMetadata: false,
        status: TickerReservationStatus.AssetCreated,
        assetId,
        isAssetCreated: true,
      });
      const rawCollectionKeys = [] as const;
      collectionKeysSpy.mockReturnValue(rawCollectionKeys);
      stringToBytesSpy.mockReturnValue(rawName);

      const result = await prepareCreateNftCollection.call(proc, {
        ticker,
        nftType: KnownNftType.Derivative,
        collectionKeys: [],
      });

      expect(result.transactions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            transaction: createNftCollectionTransaction,
            args: [rawAssetId, rawType, []],
          }),
        ])
      );
    });

    it('should handle custom type data', async () => {
      const typeId = new BigNumber(1);
      const rawId = dsMockUtils.createMockU32(typeId);
      const rawNftType = dsMockUtils.createMockNftType({
        Custom: dsMockUtils.createMockU32(typeId),
      });
      const rawCollectionKeys = [] as const;

      collectionKeysSpy.mockReturnValue(rawCollectionKeys);
      stringToBytesSpy.mockReturnValue(rawName);
      when(internalNftTypeToNftTypeSpy)
        .calledWith({ Custom: rawId }, mockContext)
        .mockReturnValue(rawNftType);

      const paramsWithCustomType = {
        customTypeData: {
          rawId,
          rawValue: dsMockUtils.createMockBytes('someCustomType'),
          isAlreadyCreated: true,
        },
        status: TickerReservationStatus.Free,
        isAssetCreated: false,
        assetId,
        needsLocalMetadata: false,
      };
      let proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(
        mockContext,
        paramsWithCustomType
      );
      let result = await prepareCreateNftCollection.call(proc, {
        ticker,
        nftType: KnownNftType.Derivative,
        collectionKeys: [],
      });

      const nftTransactions = [
        expect.objectContaining({
          transaction: createAssetTransactionTx,
          fee: undefined,
          args: [rawName, rawDivisible, rawAssetType, [], null],
        }),
        expect.objectContaining({
          transaction: registerUniqueTickerTx,
          args: [rawTicker],
        }),
        expect.objectContaining({
          transaction: linkTickerToAssetIdTx,
          args: [rawTicker, rawAssetId],
        }),
        expect.objectContaining({
          transaction: createNftCollectionTransaction,
          args: [rawAssetId, rawNftType, []],
        }),
      ];

      expect(result.transactions).toEqual(expect.arrayContaining([...nftTransactions]));

      const rawUnregisteredType = dsMockUtils.createMockBytes('someCustomType');
      proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(mockContext, {
        ...paramsWithCustomType,
        customTypeData: {
          rawId,
          rawValue: rawUnregisteredType,
          isAlreadyCreated: false,
        },
      });

      result = await prepareCreateNftCollection.call(proc, {
        ticker,
        nftType: 'someCustomType',
        collectionKeys: [],
      });

      expect(result.transactions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            transaction: registerCustomAssetTypeTx,
            args: [rawUnregisteredType],
          }),
          ...nftTransactions,
        ])
      );
    });

    it('should register local metadata if needed', async () => {
      const proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(mockContext, {
        customTypeData: null,
        status: TickerReservationStatus.Free,
        isAssetCreated: false,
        assetId,
        needsLocalMetadata: true,
      });
      const rawCollectionKeys = [
        dsMockUtils.createMockU64(new BigNumber(1)),
        dsMockUtils.createMockU64(new BigNumber(2)),
      ] as const;
      collectionKeysSpy.mockReturnValue(rawCollectionKeys);
      stringToBytesSpy.mockReturnValue(rawName);
      const fakeMetadataSpec = 'fakeMetadataSpec';

      metadataSpecToMeshMetadataSpecSpy.mockReturnValue(fakeMetadataSpec);

      const result = await prepareCreateNftCollection.call(proc, {
        ticker,
        nftType: KnownNftType.Derivative,
        collectionKeys: [
          { type: MetadataType.Local, name: 'Test Metadata', spec: { url: 'https://example.com' } },
          { type: MetadataType.Global, id: new BigNumber(2) },
        ],
      });

      expect(result.transactions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            transaction: createAssetTransactionTx,
            args: [rawName, rawDivisible, rawAssetType, [], null],
          }),
          expect.objectContaining({
            transaction: registerUniqueTickerTx,
            args: [rawTicker],
          }),
          expect.objectContaining({
            transaction: linkTickerToAssetIdTx,
            args: [rawTicker, rawAssetId],
          }),
          expect.objectContaining({
            transaction: registerAssetMetadataLocalTypeTransaction,
            args: [rawAssetId, rawName, fakeMetadataSpec],
          }),
          expect.objectContaining({
            transaction: createNftCollectionTransaction,
            args: [rawAssetId, rawType, rawCollectionKeys],
          }),
        ])
      );
    });
  });

  describe('getAuthorization', () => {
    it('should return all needed permissions', async () => {
      const proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(mockContext, {
        customTypeData: {
          rawId: dsMockUtils.createMockU32(new BigNumber(1)),
          rawValue: dsMockUtils.createMockBytes('SOME_ASSET_TYPE'),
          isAlreadyCreated: false,
        },
        status: TickerReservationStatus.Free,
        isAssetCreated: false,
        assetId,
        needsLocalMetadata: true,
      });

      const boundFunc = getAuthorization.bind(proc);

      const result = await boundFunc({ ...args, documents });

      expect(result).toEqual({
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [
            TxTags.nft.CreateNftCollection,
            TxTags.asset.RegisterCustomAssetType,
            TxTags.asset.CreateAsset,
            TxTags.asset.RegisterUniqueTicker,
            TxTags.asset.LinkTickerToAssetId,
            TxTags.asset.RegisterAssetMetadataLocalType,
            TxTags.asset.AddDocuments,
          ],
        },
      });
    });

    it('should handle ticker already reserved', async () => {
      const proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(mockContext, {
        customTypeData: null,
        status: TickerReservationStatus.Reserved,
        isAssetCreated: false,
        assetId,
        needsLocalMetadata: false,
      });

      const boundFunc = getAuthorization.bind(proc);

      const result = await boundFunc(args);

      expect(result).toEqual({
        roles: [{ ticker, type: RoleType.TickerOwner }],
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [
            TxTags.nft.CreateNftCollection,
            TxTags.asset.CreateAsset,
            TxTags.asset.LinkTickerToAssetId,
          ],
        },
      });
    });

    it('should handle asset already created', async () => {
      const proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(mockContext, {
        customTypeData: null,
        status: TickerReservationStatus.AssetCreated,
        isAssetCreated: true,
        assetId,
        needsLocalMetadata: false,
      });

      const boundFunc = getAuthorization.bind(proc);

      const result = await boundFunc(args);

      expect(result).toEqual({
        permissions: {
          assets: expect.arrayContaining([expect.objectContaining({ id: assetId })]),
          portfolios: [],
          transactions: [TxTags.nft.CreateNftCollection],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    const customId = new BigNumber(1);
    const rawId = dsMockUtils.createMockU32(customId);
    const customType = 'customNftType';
    const rawValue = dsMockUtils.createMockBytes(customType);

    beforeEach(() => {
      mockContext.getSigningIdentity.mockResolvedValue(signingIdentity);

      entityMockUtils.configureMocks({
        tickerReservationOptions: {
          details: {
            owner: entityMockUtils.getIdentityInstance(),
            expiryDate: null,
            status: TickerReservationStatus.Free,
          },
        },
      });

      dsMockUtils.createQueryMock('nft', 'collectionAsset', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(0)),
      });
    });

    describe('with known type', () => {
      it('should indicate if local metadata is needed', async () => {
        const proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(mockContext);
        const boundFunc = prepareStorage.bind(proc);
        stringToBytesSpy.mockReturnValue(rawValue);

        const result = await boundFunc({
          ticker,
          nftType: KnownNftType.Derivative,
          collectionKeys: [
            {
              type: MetadataType.Local,
              name: 'Test Metadata',
              spec: { url: 'https://example.com' },
            },
          ],
        });

        expect(JSON.stringify(result)).toEqual(
          JSON.stringify({
            customTypeData: null,
            needsLocalMetadata: true,
            isAssetCreated: false,
            assetId,
            status: TickerReservationStatus.Free,
          })
        );
      });

      it('should indicate if local metadata is not needed', async () => {
        const proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(mockContext);
        const boundFunc = prepareStorage.bind(proc);
        stringToBytesSpy.mockReturnValue(rawValue);

        const result = await boundFunc({
          ticker,
          nftType: KnownNftType.Derivative,
          collectionKeys: [
            {
              type: MetadataType.Global,
              id: new BigNumber(2),
            },
          ],
        });

        expect(JSON.stringify(result)).toEqual(
          JSON.stringify({
            customTypeData: null,
            needsLocalMetadata: false,
            isAssetCreated: false,
            assetId,
            status: TickerReservationStatus.Free,
          })
        );
      });
    });

    describe('with custom type strings', () => {
      it('should handle custom type strings', async () => {
        const proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(mockContext);
        const boundFunc = prepareStorage.bind(proc);
        stringToBytesSpy.mockReturnValue(rawValue);

        dsMockUtils.createQueryMock('asset', 'customTypesInverse', {
          returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockU64(customId)),
        });

        const result = await boundFunc({
          ticker,
          nftType: customType,
          collectionKeys: [],
        });

        expect(JSON.stringify(result.customTypeData)).toEqual(
          JSON.stringify({
            rawId,
            rawValue,
            isAlreadyCreated: true,
          })
        );
      });

      it('should get next custom type id and prepare storage if custom type string was not registered', async () => {
        const proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(mockContext);
        const boundFunc = prepareStorage.bind(proc);
        stringToBytesSpy.mockReturnValue(rawValue);

        dsMockUtils.createQueryMock('asset', 'customTypesInverse', {
          returnValue: dsMockUtils.createMockOption(),
        });

        dsMockUtils.createQueryMock('asset', 'customTypeIdSequence', {
          returnValue: dsMockUtils.createMockU32(new BigNumber(0)),
        });

        bigNumberToU32.mockReturnValue(rawId);

        const result = await boundFunc({
          ticker,
          nftType: customType,
          collectionKeys: [],
        });

        expect(JSON.stringify(result.customTypeData)).toEqual(
          JSON.stringify({
            rawId,
            rawValue,
            isAlreadyCreated: false,
          })
        );
      });
    });

    describe('with custom type ID', () => {
      it('should handle existing ID', async () => {
        const proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(mockContext);
        const boundFunc = prepareStorage.bind(proc);
        bigNumberToU32.mockReturnValue(rawId);

        dsMockUtils.createQueryMock('asset', 'customTypes', {
          returnValue: rawValue,
        });

        const result = await boundFunc({
          ticker,
          nftType: customId,
          collectionKeys: [],
        });

        expect(JSON.stringify(result.customTypeData)).toEqual(
          JSON.stringify({
            rawId,
            rawValue,
            isAlreadyCreated: true,
          })
        );
      });

      it('should throw if Id does not exist', () => {
        const proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(mockContext);
        const boundFunc = prepareStorage.bind(proc);

        dsMockUtils.createQueryMock('asset', 'customTypes', {
          returnValue: dsMockUtils.createMockOption(),
        });

        const expectedError = new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message:
            'createNftCollection was given a custom type ID that does not have an corresponding value',
        });

        return expect(
          boundFunc({
            ticker,
            nftType: customId,
            collectionKeys: [],
          })
        ).rejects.toThrow(expectedError);
      });
    });

    it('should throw if the ticker is already linked to another asset', async () => {
      entityMockUtils.configureMocks({
        tickerReservationOptions: {
          details: {
            owner: entityMockUtils.getIdentityInstance(),
            expiryDate: null,
            status: TickerReservationStatus.AssetCreated,
            assetId: '88888888-1234-1234-1234-123412341234',
          },
        },
      });
      const proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Ticker is already linked to another asset',
      });

      await expect(
        boundFunc({ ticker, assetId, nftType: KnownNftType.Derivative, collectionKeys: [] })
      ).rejects.toThrow(expectedError);
    });

    it('should throw if the NftCollection already exists', async () => {
      entityMockUtils.configureMocks({
        tickerReservationOptions: {
          details: {
            owner: entityMockUtils.getIdentityInstance(),
            expiryDate: null,
            status: TickerReservationStatus.AssetCreated,
            assetId: '88888888-1234-1234-1234-123412341234',
          },
        },
      });
      const proc = procedureMockUtils.getInstance<Params, NftCollection, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      dsMockUtils.createQueryMock('nft', 'collectionAsset', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(1)),
      });

      let expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'An NFT collection already exists with the ticker',
      });

      await expect(
        boundFunc({ ticker, nftType: KnownNftType.Derivative, collectionKeys: [] })
      ).rejects.toThrow(expectedError);

      entityMockUtils.configureMocks({
        nftCollectionOptions: {
          exists: true,
        },
      });

      expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'An NFT collection already exists with the given asset ID',
      });

      await expect(
        boundFunc({ assetId, nftType: KnownNftType.Derivative, collectionKeys: [] })
      ).rejects.toThrow(expectedError);
    });
  });
});
