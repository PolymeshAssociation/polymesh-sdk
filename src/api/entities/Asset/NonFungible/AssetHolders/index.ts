import BigNumber from 'bignumber.js';
import { groupBy } from 'lodash';

import { Identity, Namespace, Nft } from '~/internal';
import { nftCollectionHolders, nftCollectionHoldersNftsQuery } from '~/middleware/queries/assets';
import { Query } from '~/middleware/types';
import {
  AssetHolderLike,
  IdentityHeldNfts,
  MiddlewarePaginationOptions,
  NftCollection,
  NftHolderFreezeStatus,
  ResultSet,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  calculateNextKey,
  getAllMiddlewareNfts,
  getAssetIdForMiddleware,
  getHolderFreezeStatus,
} from '~/utils/internal';

/**
 * Handles all NFT Holders related functionality
 */
export class AssetHolders extends Namespace<NftCollection> {
  /**
   * Retrieve all the NFT Holders with their holdings
   *
   * @note uses the middlewareV2
   * @note supports pagination. A page is a page of holders, each with every NFT it holds, so a
   *   holder with many NFTs takes several middleware requests
   */
  public async get(opts: MiddlewarePaginationOptions): Promise<ResultSet<IdentityHeldNfts>> {
    const {
      context,
      parent: { id: assetId },
    } = this;

    const { size, start } = opts;

    const middlewareAssetId = await getAssetIdForMiddleware(assetId, context);

    const {
      data: {
        assetHolders: { totalCount, nodes },
      },
    } = await context.queryMiddleware<Ensured<Query, 'assetHolders'>>(
      nftCollectionHolders(middlewareAssetId, size, start)
    );

    // the holders are one page; every NFT each of them holds is read for that page
    const identityIds = nodes.map(({ identityId }) => identityId);
    const nfts = identityIds.length
      ? await getAllMiddlewareNfts(context, (pageSize, offset) =>
          nftCollectionHoldersNftsQuery(
            { assetId: middlewareAssetId, identityIds },
            pageSize,
            offset
          )
        )
      : [];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const nftsByHolder = groupBy(nfts, nft => nft.holding!.identityId);

    const data = nodes.map(({ identityId }) => ({
      identity: new Identity({ did: identityId }, context),
      nfts: (nftsByHolder[identityId] ?? []).map(
        ({ nftId }) => new Nft({ id: new BigNumber(nftId), assetId }, context)
      ),
    }));

    const next = calculateNextKey(new BigNumber(totalCount), nodes.length, start);

    return {
      data,
      count: new BigNumber(totalCount),
      next,
    };
  }

  /**
   * Retrieve whether an Asset agent has frozen one holder of this collection, in which case it
   *   cannot send any of the collection's NFTs
   *
   * @param args.holder - an Account or a Portfolio. Freezing applies to the holder given, not to
   *   its Identity: freezing one of an Identity's Accounts leaves its other Accounts and its
   *   Portfolios free
   *
   * @note always reports an unfrozen holder before Polymesh 8.1.1, which cannot freeze one
   */
  public async getFreezeStatus(args: { holder: AssetHolderLike }): Promise<NftHolderFreezeStatus> {
    const { context, parent } = this;

    const { isFrozen } = await getHolderFreezeStatus(args.holder, parent, context);

    return { isFrozen };
  }
}
