import BigNumber from 'bignumber.js';

import { Identity, Namespace, Nft } from '~/internal';
import { nftCollectionHolders } from '~/middleware/queries/assets';
import { Query } from '~/middleware/types';
import { IdentityHeldNfts, NftCollection, ResultSet } from '~/types';
import { Ensured } from '~/types/utils';
import { calculateNextKey } from '~/utils/internal';

/**
 * Handles all NFT Holders related functionality
 */
export class AssetHolders extends Namespace<NftCollection> {
  /**
   * Retrieve all the NFT Holders with their holdings
   *
   * @note uses the middlewareV2
   */
  public async get(opts: {
    size?: BigNumber;
    start?: BigNumber;
  }): Promise<ResultSet<IdentityHeldNfts>> {
    const {
      context,
      parent: { id: assetId },
    } = this;

    const { size, start } = opts;

    const {
      data: {
        nftHolders: { totalCount, nodes },
      },
    } = await context.queryMiddleware<Ensured<Query, 'nftHolders'>>(
      nftCollectionHolders(assetId, size, start)
    );

    const data = nodes.map(({ nftIds, identityId }) => ({
      identity: new Identity({ did: identityId }, context),
      nfts: nftIds.map((id: string) => new Nft({ id: new BigNumber(id), assetId }, context)),
    }));

    const next = calculateNextKey(new BigNumber(totalCount), nodes.length, start);

    return {
      data,
      next,
    };
  }
}
