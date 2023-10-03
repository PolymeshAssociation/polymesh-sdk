import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Nft } from '~/api/entities/Asset/NonFungible/Nft';
import {
  getAuthorization,
  IssueNftParams,
  issueNftResolver,
  prepareIssueNft,
  prepareStorage,
  Storage,
} from '~/api/procedures/issueNft';
import { Context, PolymeshError, Portfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { EntityGetter } from '~/testUtils/mocks/entities';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, MetadataType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset/NonFungible',
  require('~/testUtils/mocks/entities').mockNftCollectionModule('~/api/entities/Asset/NonFungible')
);

describe('issueNft procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;
  let portfolioToPortfolioKindSpy: jest.SpyInstance;
  let nftInputToMetadataValueSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    nftInputToMetadataValueSpy = jest.spyOn(utilsConversionModule, 'nftInputToNftMetadataVec');
    portfolioToPortfolioKindSpy = jest.spyOn(utilsConversionModule, 'portfolioToPortfolioKind');
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
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

  describe('prepareStorage', () => {
    it('should return the NftCollection', () => {
      const proc = procedureMockUtils.getInstance<IssueNftParams, Nft, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = boundFunc({
        ticker,
        metadata: [],
      });

      expect(result).toEqual({
        collection: expect.objectContaining({ ticker }),
      });
    });
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
        ticker,
      };
      nftInputToMetadataValueSpy.mockReturnValue([]);
      mockContext.getSigningIdentity.mockResolvedValue(entityMockUtils.getIdentityInstance());

      const transaction = dsMockUtils.createTxMock('nft', 'issueNft');
      const proc = procedureMockUtils.getInstance<IssueNftParams, Nft, Storage>(mockContext, {
        collection: entityMockUtils.getNftCollectionInstance(),
      });

      const result = await prepareIssueNft.call(proc, args);
      expect(result).toEqual({
        transaction,
        args: [rawTicker, [], defaultPortfolioKind],
        resolver: expect.any(Function),
      });
    });

    it('should issue tokens to Default portfolio if portfolioId is not specified', async () => {
      const args = {
        metadata: [],
        ticker,
      };
      mockContext.getSigningIdentity.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ portfoliosGetPortfolio: getPortfolio })
      );
      nftInputToMetadataValueSpy.mockReturnValue([]);
      const transaction = dsMockUtils.createTxMock('nft', 'issueNft');
      const proc = procedureMockUtils.getInstance<IssueNftParams, Nft, Storage>(mockContext, {
        collection: entityMockUtils.getNftCollectionInstance(),
      });
      const result = await prepareIssueNft.call(proc, args);

      expect(result).toEqual({
        transaction,
        args: [rawTicker, [], defaultPortfolioKind],
        resolver: expect.any(Function),
      });
    });

    it('should issue tokens to Default portfolio if default portfolioId is provided', async () => {
      const args = {
        metadata: [],
        ticker,
        portfolioId: defaultPortfolioId,
      };
      mockContext.getSigningIdentity.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ portfoliosGetPortfolio: getPortfolio })
      );
      nftInputToMetadataValueSpy.mockReturnValue([]);
      const transaction = dsMockUtils.createTxMock('nft', 'issueNft');
      const proc = procedureMockUtils.getInstance<IssueNftParams, Nft, Storage>(mockContext, {
        collection: entityMockUtils.getNftCollectionInstance(),
      });
      const result = await prepareIssueNft.call(proc, args);

      expect(result).toEqual({
        transaction,
        args: [rawTicker, [], defaultPortfolioKind],
        resolver: expect.any(Function),
      });
    });

    it('should issue the Nft to the Numbered portfolio that is specified', async () => {
      const args = {
        metadata: [],
        ticker,
        portfolioId: numberedPortfolioId,
      };
      mockContext.getSigningIdentity.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ portfoliosGetPortfolio: getPortfolio })
      );

      nftInputToMetadataValueSpy.mockReturnValue([]);

      const transaction = dsMockUtils.createTxMock('nft', 'issueNft');
      const proc = procedureMockUtils.getInstance<IssueNftParams, Nft, Storage>(mockContext, {
        collection: entityMockUtils.getNftCollectionInstance(),
      });
      const result = await prepareIssueNft.call(proc, args);

      expect(result).toEqual({
        transaction,
        args: [rawTicker, [], numberedPortfolioKind],
        resolver: expect.any(Function),
      });
    });

    it('should throw if unneeded metadata is provided', () => {
      const args = {
        metadata: [{ type: MetadataType.Local, id: new BigNumber(1), value: 'test' }],
        ticker,
      };
      nftInputToMetadataValueSpy.mockReturnValue([]);
      mockContext.getSigningIdentity.mockResolvedValue(entityMockUtils.getIdentityInstance());

      dsMockUtils.createTxMock('nft', 'issueNft');

      const proc = procedureMockUtils.getInstance<IssueNftParams, Nft, Storage>(mockContext, {
        collection: entityMockUtils.getNftCollectionInstance(),
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'A metadata value was given that is not required for this collection',
      });

      return expect(prepareIssueNft.call(proc, args)).rejects.toThrow(expectedError);
    });

    it('should throw if not all needed metadata is given', () => {
      const args = {
        metadata: [],
        ticker,
      };
      nftInputToMetadataValueSpy.mockReturnValue([]);
      mockContext.getSigningIdentity.mockResolvedValue(entityMockUtils.getIdentityInstance());

      dsMockUtils.createTxMock('nft', 'issueNft');

      const proc = procedureMockUtils.getInstance<IssueNftParams, Nft, Storage>(mockContext, {
        collection: entityMockUtils.getNftCollectionInstance({
          collectionMetadataKeys: [{ type: MetadataType.Global, id: new BigNumber(1) }],
        }),
      });

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
        ticker,
      };
      nftInputToMetadataValueSpy.mockReturnValue([]);
      mockContext.getSigningIdentity.mockResolvedValue(entityMockUtils.getIdentityInstance());

      dsMockUtils.createTxMock('nft', 'issueNft');

      const proc = procedureMockUtils.getInstance<IssueNftParams, Nft, Storage>(mockContext, {
        collection: entityMockUtils.getNftCollectionInstance({
          collectionMetadataKeys: [
            { type: MetadataType.Local, id: new BigNumber(1), ticker },
            { type: MetadataType.Global, id: new BigNumber(2) },
          ],
        }),
      });

      return expect(prepareIssueNft.call(proc, args)).resolves.not.toThrow();
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<IssueNftParams, Nft, Storage>(mockContext, {
        collection: entityMockUtils.getNftCollectionInstance({ ticker }),
      });
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.nft.IssueNft],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });

  describe('issueNftResolver', () => {
    const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
    const id = new BigNumber(1);

    beforeAll(() => {
      entityMockUtils.initMocks({ checkpointOptions: { ticker, id } });
    });

    beforeEach(() => {
      const mockNft = dsMockUtils.createMockNfts({
        ticker: dsMockUtils.createMockTicker(ticker),
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

      expect(result).toEqual(expect.objectContaining({ ticker }));
    });
  });
});
