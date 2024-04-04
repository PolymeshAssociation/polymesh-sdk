import BigNumber from 'bignumber.js';

import { FungibleAsset, Identity, Namespace } from '~/internal';
import { IdentityBalance, PaginationOptions, ResultSet } from '~/types';
import { balanceToBigNumber, identityIdToString, stringToTicker } from '~/utils/conversion';
import { requestPaginated } from '~/utils/internal';

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
      parent: { ticker },
    } = this;

    const rawTicker = stringToTicker(ticker, context);
    const { entries, lastKey: next } = await requestPaginated(query.asset.balanceOf, {
      arg: rawTicker,
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
}
