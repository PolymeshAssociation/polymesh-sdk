import { PolymeshPrimitivesAssetAssetID } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Nft } from '~/api/entities/Asset/NonFungible/Nft';
import {
  getAuthorization,
  issueNftResolver,
  Params,
  prepareIssueNft,
} from '~/api/procedures/issueNft';
import { Context, PolymeshError, Portfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { EntityGetter } from '~/testUtils/mocks/entities';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, MetadataType, NftCollection, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset/NonFungible',
  require('~/testUtils/mocks/entities').mockNftCollectionModule('~/api/entities/Asset/NonFungible')
);
jest.mock(
  '~/api/entities/Asset/NonFungible',
  require('~/testUtils/mocks/entities').mockNftModule('~/api/entities/Asset/NonFungible')
);

describe('issueNft procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpySpy: jest.SpyInstance;
  let assetId: string;
  let collection: NftCollection;
  let rawAssetId: PolymeshPrimitivesAssetAssetID;
  let portfolioToPortfolioKindSpy: jest.SpyInstance;
  let nftInputToMetadataValueSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpySpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    nftInputToMetadataValueSpy = jest.spyOn(utilsConversionModule, 'nftInputToNftMetadataVec');
    portfolioToPortfolioKindSpy = jest.spyOn(utilsConversionModule, 'portfolioToPortfolioKind');
    assetId = '0x1234';
    collection = entityMockUtils.getNftCollectionInstance({ assetId });
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(assetToMeshAssetIdSpySpy).calledWith(collection, mockContext).mockReturnValue(rawAssetId);
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

  describe('issue NFT', () => {
    const defaultPortfolioId = new BigNumber(0);
    const numberedPortfolioId = new BigNumber(1);

    const defaultPortfolioKind = dsMockUtils.createMockPortfolioKind('Default');
    const numberedPortfolioKind = dsMockUtils.createMockPortfolioKind({
      User: dsMockUtils.createMockU64(numberedPortfolioId),
    });

    const getPortfolio: EntityGetter<Portfolio> = jest.fn();
    const mockDefaultPortfolio = entityMockUtils.getDefaultPortfolioInstance();
    const mockNumberedPortfolio = entityMockUtils.getNumberedPortfolioInstance({
      did: 'did',
      id: numberedPortfolioId,
    });

    beforeEach(() => {
      when(mockContext.createType)
        .calledWith('PolymeshPrimitivesIdentityIdPortfolioKind', 'Default')
        .mockReturnValue(defaultPortfolioKind);
      when(mockContext.createType)
        .calledWith('PolymeshPrimitivesIdentityIdPortfolioKind', numberedPortfolioKind)
        .mockReturnValue(numberedPortfolioKind);
      when(getPortfolio)
        .calledWith()
        .mockResolvedValue(mockDefaultPortfolio)
        .calledWith({ portfolioId: defaultPortfolioId })
        .mockResolvedValue(mockDefaultPortfolio)
        .calledWith({ portfolioId: numberedPortfolioId })
        .mockResolvedValue(mockNumberedPortfolio);

      when(portfolioToPortfolioKindSpy)
        .calledWith(mockDefaultPortfolio, mockContext)
        .mockReturnValue(defaultPortfolioKind)
        .calledWith(mockNumberedPortfolio, mockContext)
        .mockReturnValue(numberedPortfolioKind);
    });

    it('should return an issueNft transaction spec', async () => {
      const args = {
        metadata: [],
        collection,
      };
      nftInputToMetadataValueSpy.mockReturnValue([]);
      mockContext.getSigningIdentity.mockResolvedValue(entityMockUtils.getIdentityInstance());

      const transaction = dsMockUtils.createTxMock('nft', 'issueNft');
      const proc = procedureMockUtils.getInstance<Params, Nft>(mockContext);

      const result = await prepareIssueNft.call(proc, args);
      expect(result).toEqual({
        transaction,
        args: [rawAssetId, [], defaultPortfolioKind],
        resolver: expect.any(Function),
      });
    });

    it('should issue tokens to Default portfolio if portfolioId is not specified', async () => {
      const args = {
        metadata: [],
        collection,
      };
      mockContext.getSigningIdentity.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ portfoliosGetPortfolio: getPortfolio })
      );
      nftInputToMetadataValueSpy.mockReturnValue([]);
      const transaction = dsMockUtils.createTxMock('nft', 'issueNft');
      const proc = procedureMockUtils.getInstance<Params, Nft>(mockContext);
      const result = await prepareIssueNft.call(proc, args);

      expect(result).toEqual({
        transaction,
        args: [rawAssetId, [], defaultPortfolioKind],
        resolver: expect.any(Function),
      });
    });

    it('should issue tokens to Default portfolio if default portfolioId is provided', async () => {
      const args = {
        metadata: [],
        collection,
        portfolioId: defaultPortfolioId,
      };
      mockContext.getSigningIdentity.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ portfoliosGetPortfolio: getPortfolio })
      );
      nftInputToMetadataValueSpy.mockReturnValue([]);
      const transaction = dsMockUtils.createTxMock('nft', 'issueNft');
      const proc = procedureMockUtils.getInstance<Params, Nft>(mockContext);
      const result = await prepareIssueNft.call(proc, args);

      expect(result).toEqual({
        transaction,
        args: [rawAssetId, [], defaultPortfolioKind],
        resolver: expect.any(Function),
      });
    });

    it('should issue the Nft to the Numbered portfolio that is specified', async () => {
      const args = {
        metadata: [],
        collection,
        portfolioId: numberedPortfolioId,
      };
      mockContext.getSigningIdentity.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ portfoliosGetPortfolio: getPortfolio })
      );

      nftInputToMetadataValueSpy.mockReturnValue([]);

      const transaction = dsMockUtils.createTxMock('nft', 'issueNft');
      const proc = procedureMockUtils.getInstance<Params, Nft>(mockContext);
      const result = await prepareIssueNft.call(proc, args);

      expect(result).toEqual({
        transaction,
        args: [rawAssetId, [], numberedPortfolioKind],
        resolver: expect.any(Function),
      });
    });

    it('should throw if unneeded metadata is provided', () => {
      const args = {
        metadata: [{ type: MetadataType.Local, id: new BigNumber(1), value: 'test' }],
        collection,
      };
      nftInputToMetadataValueSpy.mockReturnValue([]);
      mockContext.getSigningIdentity.mockResolvedValue(entityMockUtils.getIdentityInstance());

      dsMockUtils.createTxMock('nft', 'issueNft');

      const proc = procedureMockUtils.getInstance<Params, Nft>(mockContext);

      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'A metadata value was given that is not required for this collection',
      });

      return expect(prepareIssueNft.call(proc, args)).rejects.toThrow(expectedError);
    });

    it('should throw if not all needed metadata is given', () => {
      const args = {
        metadata: [],
        collection: entityMockUtils.getNftCollectionInstance({
          collectionKeys: [
            { type: MetadataType.Global, id: new BigNumber(1), specs: {}, name: 'Example Global' },
          ],
          assetId,
        }),
      };
      nftInputToMetadataValueSpy.mockReturnValue([]);
      mockContext.getSigningIdentity.mockResolvedValue(entityMockUtils.getIdentityInstance());

      dsMockUtils.createTxMock('nft', 'issueNft');

      const proc = procedureMockUtils.getInstance<Params, Nft>(mockContext);

      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The collection requires metadata that was not provided',
      });

      return expect(prepareIssueNft.call(proc, args)).rejects.toThrow(expectedError);
    });

    it('should not throw when all required metadata is provided', () => {
      const args = {
        metadata: [
          { type: MetadataType.Local, id: new BigNumber(1), value: 'local' },
          { type: MetadataType.Global, id: new BigNumber(2), value: 'global' },
        ],
        collection: entityMockUtils.getNftCollectionInstance({
          collectionKeys: [
            {
              type: MetadataType.Local,
              id: new BigNumber(1),
              assetId,
              name: 'Example Local',
              specs: {},
            },
            { type: MetadataType.Global, id: new BigNumber(2), specs: {}, name: 'Example Global' },
          ],
          assetId,
        }),
      };
      nftInputToMetadataValueSpy.mockReturnValue([]);
      mockContext.getSigningIdentity.mockResolvedValue(entityMockUtils.getIdentityInstance());

      dsMockUtils.createTxMock('nft', 'issueNft');

      const proc = procedureMockUtils.getInstance<Params, Nft>(mockContext);

      return expect(prepareIssueNft.call(proc, args)).resolves.not.toThrow();
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, Nft>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ collection } as unknown as Params)).toEqual({
        permissions: {
          transactions: [TxTags.nft.IssueNft],
          assets: [collection],
          portfolios: [],
        },
      });
    });
  });

  describe('issueNftResolver', () => {
    const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
    const id = new BigNumber(1);

    beforeEach(() => {
      const mockNft = dsMockUtils.createMockNfts({
        assetId: dsMockUtils.createMockAssetId(assetId),
        ids: [dsMockUtils.createMockU64(id)],
      });
      filterEventRecordsSpy.mockReturnValue([dsMockUtils.createMockIEvent(['someDid', mockNft])]);
    });

    afterEach(() => {
      filterEventRecordsSpy.mockReset();
    });

    it('should create an NFT entity', () => {
      const context = dsMockUtils.getContextInstance();
      const result = issueNftResolver(context)({} as ISubmittableResult);

      expect(result.collection).toEqual(expect.objectContaining({ id: assetId }));
      expect(result.id).toEqual(id);
    });
  });
});
