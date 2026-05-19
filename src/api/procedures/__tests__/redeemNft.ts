import { u64 } from '@polkadot/types';
import { PolymeshPrimitivesAssetAssetId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareRedeemNft,
  prepareStorage,
  redeemNft,
  Storage,
} from '~/api/procedures/redeemNft';
import { Context, NumberedPortfolio, PolymeshError, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, NftCollection, TxTags } from '~/types';
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
jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('redeemNft procedure', () => {
  let mockContext: Mocked<Context>;
  let assetId: string;
  let collection: NftCollection;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let id: BigNumber;
  let collectionId: BigNumber;
  let rawId: u64;
  let rawCollectionId: u64;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetId = '0x12341234123412341234123412341234';
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    collection = entityMockUtils.getNftCollectionInstance({ assetId });
    id = new BigNumber(1);
    collectionId = new BigNumber(2);
    rawId = dsMockUtils.createMockU64(id);
    rawCollectionId = dsMockUtils.createMockU64(collectionId);
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(assetToMeshAssetIdSpy).calledWith(collection, mockContext).mockReturnValue(rawAssetId);
    when(bigNumberToU64Spy).calledWith(id, mockContext).mockReturnValue(rawId);
    when(bigNumberToU64Spy).calledWith(collectionId, mockContext).mockReturnValue(rawCollectionId);
    dsMockUtils.createQueryMock('nft', 'collectionKeys', {
      returnValue: dsMockUtils.createMockBtreeSet(),
    });
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
    const nft = entityMockUtils.getNftInstance({ assetId, id });

    const from = entityMockUtils.getNumberedPortfolioInstance({
      id: new BigNumber(1),
      getCollections: [
        {
          collection,
          free: [nft],
          locked: [],
          total: new BigNumber(1),
        },
      ],
    });
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      fromAssetHolder: from,
    });

    const transaction = dsMockUtils.createTxMock('nft', 'redeemNft');

    const rawAssetHolderKind = dsMockUtils.createMockAssetHolderKind({
      UserPortfolio: dsMockUtils.createMockU64(new BigNumber(1)),
    });

    when(jest.spyOn(utilsConversionModule, 'assetHolderToAssetHolderKind'))
      .calledWith(from, mockContext)
      .mockReturnValue(rawAssetHolderKind);

    const result = await prepareRedeemNft.call(proc, {
      collection,
      id,
      from,
    });
    expect(result).toEqual({
      transaction,
      args: [rawAssetId, rawId, rawAssetHolderKind, 0],
      resolver: undefined,
    });
  });

  it('should return a redeemNft transaction spec when from is an Account (fromAssetHolder instanceof Account)', async () => {
    const nft = entityMockUtils.getNftInstance({ assetId, id });
    const fromAccount = entityMockUtils.getAccountInstance({
      address: 'someAddress',
    });
    fromAccount.getCollections = jest.fn().mockResolvedValue([
      {
        collection,
        free: [nft],
        locked: [],
        total: new BigNumber(1),
      },
    ]);

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      fromAssetHolder: fromAccount,
    });

    const transaction = dsMockUtils.createTxMock('nft', 'redeemNft');

    const rawAssetHolderKind = dsMockUtils.createMockAssetHolderKind('Account');

    when(jest.spyOn(utilsConversionModule, 'assetHolderToAssetHolderKind'))
      .calledWith(fromAccount, mockContext)
      .mockReturnValue(rawAssetHolderKind);

    const result = await prepareRedeemNft.call(proc, {
      collection,
      id,
      fromAccount,
    });

    expect(result).toEqual({
      transaction,
      args: [rawAssetId, rawId, rawAssetHolderKind, 0],
      resolver: undefined,
    });
  });

  it('should throw an error if the portfolio does not have the NFT to redeem', () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      fromAssetHolder: entityMockUtils.getNumberedPortfolioInstance({
        getCollections: [
          {
            collection,
            free: [],
            locked: [],
            total: new BigNumber(0),
          },
        ],
      }),
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'Asset Holder does not hold NFT to redeem',
    });

    return expect(
      prepareRedeemNft.call(proc, {
        collection,
        id,
      })
    ).rejects.toThrow(expectedError);
  });

  it('should throw if getCollections is empty (no matching collection entry)', () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      fromAssetHolder: entityMockUtils.getNumberedPortfolioInstance({
        getCollections: jest.fn().mockResolvedValue([]),
      }),
    });

    return expect(
      prepareRedeemNft.call(proc, {
        collection,
        id,
      })
    ).rejects.toThrow('Asset Holder does not hold NFT to redeem');
  });

  it('should throw if the NFT id is not in the free list for the collection', () => {
    const otherNft = entityMockUtils.getNftInstance({ assetId, id: new BigNumber(99) });
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      fromAssetHolder: entityMockUtils.getNumberedPortfolioInstance({
        getCollections: [
          {
            collection,
            free: [otherNft],
            locked: [],
            total: new BigNumber(1),
          },
        ],
      }),
    });

    return expect(
      prepareRedeemNft.call(proc, {
        collection,
        id,
      })
    ).rejects.toThrow('Asset Holder does not hold NFT to redeem');
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const someDid = 'someDid';

      dsMockUtils.getContextInstance({ did: someDid });

      const fromAssetHolder = entityMockUtils.getDefaultPortfolioInstance({
        did: someDid,
      });

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        fromAssetHolder,
      });

      const params = {
        collection,
        id,
      };
      const boundFunc = getAuthorization.bind(proc);

      const result = boundFunc(params);

      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.nft.RedeemNft],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [fromAssetHolder],
        },
      });
    });

    it('should omit portfolios permission when redeeming from an Account', () => {
      dsMockUtils.getContextInstance({ did: 'someDid' });

      const fromAccount = entityMockUtils.getAccountInstance({
        address: 'someAddress',
      });

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        fromAssetHolder: fromAccount,
      });

      const boundFunc = getAuthorization.bind(proc);

      const result = boundFunc({ collection, id });

      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.nft.RedeemNft],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
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
        fromAssetHolder: expect.objectContaining({
          owner: expect.objectContaining({
            did: 'someDid',
          }),
        }),
      });

      result = await boundFunc({
        from: new BigNumber(1),
      } as Params);

      expect(result).toEqual({
        fromAssetHolder: expect.objectContaining({
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
        fromAssetHolder: from,
      });
    });

    it('should throw if both from and fromAccount are provided', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      return expect(
        boundFunc({ from: new BigNumber(1), fromAccount: '0xdummy' } as Params)
      ).rejects.toThrow('Only one of `from` or `fromAccount` can be provided to redeem');
    });

    it('should return an Account-based asset holder when fromAccount is provided', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc({ fromAccount: '0xdummy' } as Params);

      expect(result).toEqual({
        fromAssetHolder: expect.objectContaining({ address: '0xdummy' }),
      });
    });
  });
});

describe('redeemNft', () => {
  it('should be instance of Procedure', () => {
    expect(redeemNft()).toBeInstanceOf(Procedure);
  });
});
