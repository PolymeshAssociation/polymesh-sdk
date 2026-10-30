import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { AssetHolders } from '~/api/entities/Asset/NonFungible/AssetHolders';
import { Context, Namespace } from '~/internal';
import { nftCollectionHolders, nftCollectionHoldersNftsQuery } from '~/middleware/queries/assets';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { NftCollection } from '~/types';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset/NonFungible',
  require('~/testUtils/mocks/entities').mockNftCollectionModule('~/api/entities/Asset/NonFungible')
);
jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('AssetHolder class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(AssetHolders.prototype instanceof Namespace).toBe(true);
  });

  describe('method: get', () => {
    const assetId = '0x12341234123412341234123412341234';
    let assetHolders: AssetHolders;
    let collection: NftCollection;
    let context: Context;
    let getAssetIdForMiddlewareSpy: jest.SpyInstance;

    beforeAll(() => {
      dsMockUtils.initMocks();
      getAssetIdForMiddlewareSpy = jest.spyOn(utilsInternalModule, 'getAssetIdForMiddleware');
    });

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      collection = entityMockUtils.getNftCollectionInstance({ assetId });
      assetHolders = new AssetHolders(collection, context);
      when(getAssetIdForMiddlewareSpy).calledWith(assetId, context).mockResolvedValue(assetId);

      dsMockUtils.createApolloQueryMock(
        nftCollectionHolders(assetId, new BigNumber(2), new BigNumber(0)),
        {
          assetHolders: {
            nodes: [
              { identityId: 'someDid', nftCount: 2 },
              { identityId: 'anotherDid', nftCount: 1 },
            ],
            totalCount: 2,
          },
        }
      );
    });

    afterEach(() => {
      dsMockUtils.reset();
    });

    afterAll(() => {
      dsMockUtils.cleanup();
    });

    it('should retrieve all the NFT Holders with NFTs', async () => {
      dsMockUtils.createApolloQueryMock(
        nftCollectionHoldersNftsQuery(
          { assetId, identityIds: ['someDid', 'anotherDid'] },
          new BigNumber(100),
          new BigNumber(0)
        ),
        {
          nfts: {
            nodes: [
              { nftId: '1', holding: { identityId: 'someDid' } },
              { nftId: '2', holding: { identityId: 'anotherDid' } },
              { nftId: '3', holding: { identityId: 'someDid' } },
            ],
            totalCount: 3,
          },
        }
      );

      const result = await assetHolders.get({ size: new BigNumber(2), start: new BigNumber(0) });

      expect(result).toEqual({
        data: [
          expect.objectContaining({
            identity: expect.objectContaining({ did: 'someDid' }),
            nfts: [
              expect.objectContaining({ id: new BigNumber(1) }),
              expect.objectContaining({ id: new BigNumber(3) }),
            ],
          }),
          expect.objectContaining({
            identity: expect.objectContaining({ did: 'anotherDid' }),
            nfts: [expect.objectContaining({ id: new BigNumber(2) })],
          }),
        ],
        next: null,
        count: new BigNumber(2),
      });
    });

    it('should read every NFT of the page, past the middleware page limit', async () => {
      const firstPage = Array.from({ length: 100 }, (_, i) => ({
        nftId: `${i + 1}`,
        holding: { identityId: 'someDid' },
      }));
      const filters = { assetId, identityIds: ['someDid', 'anotherDid'] };

      dsMockUtils.createApolloQueryMock(
        nftCollectionHoldersNftsQuery(filters, new BigNumber(100), new BigNumber(0)),
        { nfts: { nodes: firstPage, totalCount: 101 } }
      );
      dsMockUtils.createApolloQueryMock(
        nftCollectionHoldersNftsQuery(filters, new BigNumber(100), new BigNumber(100)),
        {
          nfts: {
            nodes: [{ nftId: '101', holding: { identityId: 'anotherDid' } }],
            totalCount: 101,
          },
        }
      );

      const { data } = await assetHolders.get({ size: new BigNumber(2), start: new BigNumber(0) });

      expect(data[0]!.nfts).toHaveLength(100);
      expect(data[1]!.nfts).toEqual([expect.objectContaining({ id: new BigNumber(101) })]);
    });
  });

  describe('method: getFreezeStatus', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should report whether the holder is frozen, without a frozen amount', async () => {
      const context = dsMockUtils.getContextInstance();
      const collection = entityMockUtils.getNftCollectionInstance();
      const holder = entityMockUtils.getAccountInstance();

      const getHolderFreezeStatusSpy = jest
        .spyOn(utilsInternalModule, 'getHolderFreezeStatus')
        .mockResolvedValue({ isFrozen: true, frozen: new BigNumber(0) });

      const assetHolders = new AssetHolders(collection, context);

      await expect(assetHolders.getFreezeStatus({ holder })).resolves.toEqual({ isFrozen: true });
      expect(getHolderFreezeStatusSpy).toHaveBeenCalledWith(holder, collection, context);
    });
  });
});
