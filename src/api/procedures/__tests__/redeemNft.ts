import { u64 } from '@polkadot/types';
import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareRedeemNft,
  prepareStorage,
  Storage,
} from '~/api/procedures/redeemNft';
import { Context, NumberedPortfolio, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
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
jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);

describe('redeemNft procedure', () => {
  let mockContext: Mocked<Context>;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;
  let id: BigNumber;
  let rawId: u64;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    id = new BigNumber(1);
    rawId = dsMockUtils.createMockU64(id);
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
    when(bigNumberToU64Spy).calledWith(id, mockContext).mockReturnValue(rawId);
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

  it('should return a redeemNft transaction spec', async () => {
    const nft = entityMockUtils.getNftInstance({ ticker, id });

    const from = entityMockUtils.getNumberedPortfolioInstance({
      id: new BigNumber(1),
      getCollections: [
        {
          collection: entityMockUtils.getNftCollectionInstance({ ticker }),
          free: [nft],
          locked: [],
          total: new BigNumber(1),
        },
      ],
    });
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      fromPortfolio: from,
    });

    const transaction = dsMockUtils.createTxMock('nft', 'redeemNft');

    const rawPortfolioKind = dsMockUtils.createMockPortfolioKind({
      User: dsMockUtils.createMockU64(new BigNumber(1)),
    });

    when(jest.spyOn(utilsConversionModule, 'portfolioToPortfolioKind'))
      .calledWith(from, mockContext)
      .mockReturnValue(rawPortfolioKind);

    const result = await prepareRedeemNft.call(proc, {
      ticker,
      id,
      from,
    });
    expect(result).toEqual({
      transaction,
      args: [rawTicker, rawId, rawPortfolioKind],
      resolver: undefined,
    });
  });

  it('should throw an error if the portfolio does not have the NFT to redeem', () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      fromPortfolio: entityMockUtils.getNumberedPortfolioInstance({
        getCollections: [
          {
            collection: entityMockUtils.getNftCollectionInstance({ ticker }),
            free: [],
            locked: [],
            total: new BigNumber(0),
          },
        ],
      }),
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'Portfolio does not hold NFT to redeem',
    });

    return expect(
      prepareRedeemNft.call(proc, {
        ticker,
        id,
      })
    ).rejects.toThrow(expectedError);
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      const someDid = 'someDid';

      dsMockUtils.getContextInstance({ did: someDid });

      const fromPortfolio = entityMockUtils.getDefaultPortfolioInstance({
        did: someDid,
      });

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        fromPortfolio,
      });

      const params = {
        ticker,
        id,
      };
      const boundFunc = getAuthorization.bind(proc);

      const result = await boundFunc(params);

      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.nft.RedeemNft],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [fromPortfolio],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the Portfolio from which the NFT will be redeemed from', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);
      let result = await boundFunc({} as Params);

      expect(result).toEqual({
        fromPortfolio: expect.objectContaining({
          owner: expect.objectContaining({
            did: 'someDid',
          }),
        }),
      });

      result = await boundFunc({
        from: new BigNumber(1),
      } as Params);

      expect(result).toEqual({
        fromPortfolio: expect.objectContaining({
          id: new BigNumber(1),
          owner: expect.objectContaining({
            did: 'someDid',
          }),
        }),
      });

      const from = new NumberedPortfolio({ did: 'someDid', id: new BigNumber(1) }, mockContext);
      result = await boundFunc({
        from,
      } as Params);

      expect(result).toEqual({
        fromPortfolio: from,
      });
    });
  });
});
