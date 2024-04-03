import {
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesIdentityIdPortfolioKind,
  PolymeshPrimitivesNftNfTs,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareNftControllerTransfer,
  prepareStorage,
  Storage,
} from '~/api/procedures/nftControllerTransfer';
import { Context, DefaultPortfolio, Nft, NumberedPortfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { NftCollection, PortfolioBalance, PortfolioId, RoleType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/NonFungible',
  require('~/testUtils/mocks/entities').mockNftCollectionModule('~/api/entities/Asset/NonFungible')
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);

describe('nftControllerTransfer procedure', () => {
  let mockContext: Mocked<Context>;
  let portfolioIdToPortfolioSpy: jest.SpyInstance<
    DefaultPortfolio | NumberedPortfolio,
    [PortfolioId, Context]
  >;
  let portfolioIdToMeshPortfolioIdSpy: jest.SpyInstance;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let nftToMeshNftSpy: jest.SpyInstance<
    PolymeshPrimitivesNftNfTs,
    [string, (BigNumber | Nft)[], Context]
  >;
  let portfolioToPortfolioKindSpy: jest.SpyInstance<
    PolymeshPrimitivesIdentityIdPortfolioKind,
    [NumberedPortfolio | DefaultPortfolio, Context]
  >;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;
  let originDid: string;
  let signerDid: string;
  let rawPortfolioId: PolymeshPrimitivesIdentityIdPortfolioId;
  let rawDestinationPortfolioKind: PolymeshPrimitivesIdentityIdPortfolioKind;
  let originPortfolio: DefaultPortfolio;
  let destinationPortfolio: DefaultPortfolio;
  let collection: NftCollection;
  let rawNfts: PolymeshPrimitivesNftNfTs;
  let nfts: Nft[];

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    portfolioIdToPortfolioSpy = jest.spyOn(utilsConversionModule, 'portfolioIdToPortfolio');
    portfolioIdToMeshPortfolioIdSpy = jest.spyOn(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
    portfolioToPortfolioKindSpy = jest.spyOn(utilsConversionModule, 'portfolioToPortfolioKind');
    nftToMeshNftSpy = jest.spyOn(utilsConversionModule, 'nftToMeshNft');
    collection = entityMockUtils.getNftCollectionInstance({ ticker });
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    originDid = 'fakeDid';
    signerDid = 'signerDid';
    rawPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(originDid),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    rawDestinationPortfolioKind = dsMockUtils.createMockPortfolioKind('Default');

    nfts = [new Nft({ id: new BigNumber(1), ticker }, mockContext)];
    rawNfts = dsMockUtils.createMockNfts({
      ticker: rawTicker,
      ids: nfts.map(nft => dsMockUtils.createMockU64(nft.id)),
    });
    originPortfolio = entityMockUtils.getDefaultPortfolioInstance({
      did: originDid,
      getCollections: [{ collection, free: nfts, locked: [], total: new BigNumber(1) }],
    });
    destinationPortfolio = entityMockUtils.getDefaultPortfolioInstance({ did: signerDid });
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerSpy.mockReturnValue(rawTicker);

    originPortfolio = entityMockUtils.getDefaultPortfolioInstance({
      did: originDid,
      getCollections: [{ collection, free: nfts, locked: [], total: new BigNumber(1) }],
    });

    when(portfolioIdToPortfolioSpy)
      .calledWith({ did: originDid }, mockContext)
      .mockReturnValue(originPortfolio);

    when(portfolioIdToPortfolioSpy)
      .calledWith({ did: signerDid }, mockContext)
      .mockReturnValue(destinationPortfolio);

    when(portfolioToPortfolioKindSpy)
      .calledWith(destinationPortfolio, mockContext)
      .mockReturnValue(rawDestinationPortfolioKind);

    when(nftToMeshNftSpy)
      .calledWith(
        ticker,
        nfts.map(({ id }) => id),
        mockContext
      )
      .mockReturnValue(rawNfts);

    portfolioIdToMeshPortfolioIdSpy.mockReturnValue(rawPortfolioId);
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

  it('should throw an error in case of self Transfer', () => {
    const selfPortfolio = entityMockUtils.getDefaultPortfolioInstance({
      did: signerDid,
      getAssetBalances: [{ free: new BigNumber(90) }] as PortfolioBalance[],
    });
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      did: signerDid,
      destinationPortfolio,
    });

    return expect(
      prepareNftControllerTransfer.call(proc, {
        ticker,
        originPortfolio: selfPortfolio,
        nfts,
      })
    ).rejects.toThrow('Controller transfers to self are not allowed');
  });

  it('should throw an error if transferring to another identity portfolio', () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      did: signerDid,
      destinationPortfolio: entityMockUtils.getDefaultPortfolioInstance({ did: 'strangerDid' }),
    });

    return expect(
      prepareNftControllerTransfer.call(proc, {
        ticker,
        originPortfolio,
        nfts,
      })
    ).rejects.toThrow("Controller transfer must send to one of the signer's portfolios");
  });

  it('should throw an error if the Portfolio does not have enough balance to transfer', () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      did: signerDid,
      destinationPortfolio,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (originPortfolio.getCollections as any).mockResolvedValue([]);

    return expect(
      prepareNftControllerTransfer.call(proc, {
        ticker,
        originPortfolio,
        nfts,
      })
    ).rejects.toThrow('The origin Portfolio does not have all of the requested NFTs');
  });

  it('should return an nft controller transfer transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      did: signerDid,
      destinationPortfolio,
    });

    const transaction = dsMockUtils.createTxMock('nft', 'controllerTransfer');

    const result = await prepareNftControllerTransfer.call(proc, {
      ticker,
      originPortfolio,
      nfts,
    });

    expect(result).toEqual({
      transaction,
      args: [rawTicker, rawNfts, rawPortfolioId, rawDestinationPortfolioKind],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      const portfolioId = { did: signerDid };

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        did: 'oneDid',
        destinationPortfolio,
      });
      const boundFunc = getAuthorization.bind(proc);

      const roles = [
        {
          type: RoleType.PortfolioCustodian,
          portfolioId,
        },
      ];

      expect(await boundFunc({ ticker, originPortfolio, nfts })).toEqual({
        roles,
        permissions: {
          transactions: [TxTags.nft.ControllerTransfer],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [
            expect.objectContaining({ owner: expect.objectContaining({ did: portfolioId.did }) }),
          ],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the DID and portfolio of signing Identity', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);
      const result = await boundFunc({ ticker, originPortfolio, nfts, destinationPortfolio });

      expect(result).toEqual({
        did: 'someDid',
        destinationPortfolio,
      });
    });

    it('should return the default portfolio if destinationPortfolio is not provided', async () => {
      mockContext.getSigningIdentity.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ did: signerDid })
      );
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);
      const result = await boundFunc({ ticker, originPortfolio, nfts });

      expect(result).toEqual(
        expect.objectContaining({
          did: 'signerDid',
          destinationPortfolio,
        })
      );
    });
  });
});
