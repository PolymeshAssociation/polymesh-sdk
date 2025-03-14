import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { AssetHolders } from '~/api/entities/Asset/NonFungible/AssetHolders';
import { Context, Namespace } from '~/internal';
import { nftCollectionHolders } from '~/middleware/queries/assets';
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

      const nftHoldersResponse = {
        nodes: [
          {
            identityId: 'someDid',
            nftIds: [1],
          },
          {
            identityId: 'anotherDid',
            nftIds: [2],
          },
        ],
        totalCount: 2,
      };

      dsMockUtils.createApolloQueryMock(
        nftCollectionHolders(assetId, new BigNumber(2), new BigNumber(0)),
        {
          nftHolders: nftHoldersResponse,
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
      const result = await assetHolders.get({ size: new BigNumber(2), start: new BigNumber(0) });

      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            identity: expect.objectContaining({ did: 'someDid' }),
            nfts: [expect.objectContaining({ id: new BigNumber(1) })],
          }),
          expect.objectContaining({
            identity: expect.objectContaining({ did: 'anotherDid' }),
            nfts: [expect.objectContaining({ id: new BigNumber(2) })],
          }),
        ]),
        next: null,
      });
    });
  });
});
