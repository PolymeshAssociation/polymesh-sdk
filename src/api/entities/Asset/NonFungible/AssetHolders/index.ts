import BigNumber from 'bignumber.js';

import { Identity, Namespace } from '~/internal';
import { nftCollectionHolders } from '~/middleware/queries/assets';
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
import { calculateNextKey, getAssetIdForMiddleware, getHolderFreezeStatus } from '~/utils/internal';

/**
 * Handles all NFT Holders related functionality
 */
export class AssetHolders extends Namespace<NftCollection> {
  /**
   * Retrieve the Identities holding NFTs of this collection, with how many each holds
   *
   * @note uses the middlewareV2
   * @note supports pagination
   * @note `identity.getHeldNftsOfCollection` lists the NFTs a holder holds
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

    const data = nodes.map(({ identityId, nftCount }) => ({
      identity: new Identity({ did: identityId }, context),
      nftCount: new BigNumber(nftCount),
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
