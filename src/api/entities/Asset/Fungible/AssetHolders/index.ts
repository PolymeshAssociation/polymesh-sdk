import BigNumber from 'bignumber.js';

import { FungibleAsset, Identity, Namespace } from '~/internal';
import {
  AssetHolderLike,
  HolderFreezeStatus,
  IdentityBalance,
  PaginationOptions,
  ResultSet,
} from '~/types';
import { assetToMeshAssetId, balanceToBigNumber, identityIdToString } from '~/utils/conversion';
import { getHolderFreezeStatus, requestPaginated } from '~/utils/internal';

/**
 * Handles all Asset Holders related functionality
 */
export class AssetHolders extends Namespace<FungibleAsset> {
  /**
   * Retrieve all the Asset Holders with their respective balance
   *
   * @note supports pagination
   */
  public async get(paginationOpts?: PaginationOptions): Promise<ResultSet<IdentityBalance>> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
      parent,
    } = this;

    const rawAssetId = assetToMeshAssetId(parent, context);
    const { entries, lastKey: next } = await requestPaginated(query.asset.balanceOf, {
      arg: rawAssetId,
      paginationOpts,
    });

    const data: { identity: Identity; balance: BigNumber }[] = entries.map(
      ([storageKey, balance]) => ({
        identity: new Identity({ did: identityIdToString(storageKey.args[1]) }, context),
        balance: balanceToBigNumber(balance),
      })
    );

    return {
      data,
      next,
    };
  }

  /**
   * Retrieve how an Asset agent has frozen one holder of this Asset: whether it is frozen outright,
   *   and how much of its balance is frozen
   *
   * @param args.holder - an Account or a Portfolio. Freezing applies to the holder given, not to
   *   its Identity: freezing one of an Identity's Accounts leaves its other Accounts and its
   *   Portfolios free
   *
   * @note a holder's balance already excludes the frozen amount from `free`. See
   *   {@link api/entities/Portfolio/types!PortfolioBalance | PortfolioBalance}
   * @note always reports an unfrozen holder before Polymesh 8.1.1, which cannot freeze one
   */
  public getFreezeStatus(args: { holder: AssetHolderLike }): Promise<HolderFreezeStatus> {
    const { context, parent } = this;

    return getHolderFreezeStatus(args.holder, parent, context);
  }
}
