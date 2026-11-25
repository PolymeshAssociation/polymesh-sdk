import BigNumber from 'bignumber.js';

import { Account, FungibleAsset, Identity, Namespace } from '~/internal';
import { holdingsQuery } from '~/middleware/queries/assets';
import { HolderKind, HoldingsOrderBy, Query } from '~/middleware/types';
import {
  AssetHolderLike,
  AssetHolding,
  HolderFreezeStatus,
  IdentityBalance,
  MiddlewarePaginationOptions,
  PaginationOptions,
  ResultSet,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  assetToMeshAssetId,
  balanceToBigNumber,
  identityIdToString,
  middlewareDateToDate,
  middlewarePortfolioToPortfolio,
  portfolioIdStringToPortfolio,
} from '~/utils/conversion';
import {
  calculateNextKey,
  getAssetIdForMiddleware,
  getHolderFreezeStatus,
  requestPaginated,
} from '~/utils/internal';

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
   * Retrieve, a page at a time, each portfolio and Account that holds this Asset, with its balance
   *   and the part of it that is frozen. `get` gives each Identity's total instead
   *
   * @param opts.orderBy - how to order the results. Defaults to the largest balance first. The
   *   read's own unique key is appended to whatever is passed, so paging cannot repeat or skip a row
   *
   * @note uses the middlewareV2
   * @note supports pagination
   * @note a holder that holds nothing and has nothing frozen is left out
   */
  public async getHoldings(
    opts: MiddlewarePaginationOptions & {
      orderBy?: HoldingsOrderBy | HoldingsOrderBy[];
    } = {}
  ): Promise<ResultSet<AssetHolding>> {
    const { context, parent } = this;
    const { size, start, orderBy } = opts;

    const assetId = await getAssetIdForMiddleware(parent, context);

    const {
      data: {
        holdings: { nodes, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'holdings'>>(
      holdingsQuery({ assetId }, size, start, orderBy)
    );

    const data = nodes.map(
      ({ holderKind, portfolioId, accountId, identityId, amount, frozen, frozenSince }) => ({
        holder:
          holderKind === HolderKind.Account
            ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              new Account({ address: accountId! }, context)
            : middlewarePortfolioToPortfolio(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                portfolioIdStringToPortfolio(portfolioId!),
                context
              ),
        identity: identityId ? new Identity({ did: identityId }, context) : undefined,
        amount: new BigNumber(amount).shiftedBy(-6),
        frozen: new BigNumber(frozen).shiftedBy(-6),
        frozenSince: frozenSince ? middlewareDateToDate(frozenSince) : null,
      })
    );

    const count = new BigNumber(totalCount);

    return {
      data,
      next: calculateNextKey(count, data.length, start),
      count,
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
