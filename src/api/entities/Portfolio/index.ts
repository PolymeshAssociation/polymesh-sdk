import { StorageKey, u64 } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesIdentityIdPortfolioId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  HistoricSettlement,
  PortfolioBalance,
  PortfolioCollection,
} from '~/api/entities/Portfolio/types';
import {
  BaseAsset,
  Context,
  Entity,
  FungibleAsset,
  Identity,
  moveFunds,
  Nft,
  NftCollection,
  PolymeshError,
  quitCustody,
  togglePortfolioPreApproval,
} from '~/internal';
import { portfolioMovementsQuery } from '~/middleware/queries/portfolios';
import { settlementsQuery } from '~/middleware/queries/settlements';
import { Query } from '~/middleware/types';
import {
  Asset,
  ErrorCode,
  MoveFundsParams,
  NoArgsProcedureMethod,
  PaginationOptions,
  ProcedureMethod,
  ResultSet,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  assetIdToString,
  assetToMeshAssetId,
  balanceToBigNumber,
  boolToBoolean,
  identityIdToString,
  portfolioIdToMeshPortfolioId,
  toHistoricalSettlements,
  u64ToBigNumber,
} from '~/utils/conversion';
import {
  asAsset,
  asAssetId,
  asBaseAsset,
  asFungibleAsset,
  createProcedureMethod,
  getAssetIdForMiddleware,
  getIdentity,
  requestPaginated,
  toHumanReadable,
} from '~/utils/internal';

export interface UniqueIdentifiers {
  did: string;
  id?: BigNumber | undefined;
}

export interface HumanReadable {
  did: string;
  id?: string | undefined;
}

const notExistsMessage = "The Portfolio doesn't exist or was removed by its owner";

/**
 * Represents a base Portfolio for a specific Identity in the Polymesh blockchain
 */
export abstract class Portfolio extends Entity<UniqueIdentifiers, HumanReadable> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { did, id } = identifier as UniqueIdentifiers;

    return typeof did === 'string' && (id === undefined || id instanceof BigNumber);
  }

  /**
   * Identity of the Portfolio's owner
   */
  public owner: Identity;

  /**
   * internal Portfolio identifier (unused for default Portfolio)
   */
  protected _id?: BigNumber | undefined;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { did, id } = identifiers;

    this.owner = new Identity({ did }, context);
    this._id = id;

    this.moveFunds = createProcedureMethod(
      { getProcedureAndArgs: args => [moveFunds, { ...args, from: this }] },
      context
    );
    this.quitCustody = createProcedureMethod(
      { getProcedureAndArgs: () => [quitCustody, { portfolio: this }], voidArgs: true },
      context
    );
    this.preApproveAsset = createProcedureMethod(
      {
        getProcedureAndArgs: args => [
          togglePortfolioPreApproval,
          { ...args, portfolio: this, preApprove: true },
        ],
      },
      context
    );
    this.removeAssetPreApproval = createProcedureMethod(
      {
        getProcedureAndArgs: args => [
          togglePortfolioPreApproval,
          { ...args, portfolio: this, preApprove: false },
        ],
      },
      context
    );
  }

  /**
   * Return whether an Identity is the Portfolio owner
   *
   * @param args.identity - defaults to the signing Identity
   */
  public async isOwnedBy(args?: { identity: string | Identity }): Promise<boolean> {
    const { owner, context } = this;

    const identity = await getIdentity(args?.identity, context);

    return owner.isEqual(identity);
  }

  /**
   * Return whether an Identity is the Portfolio custodian
   *
   * @param args.identity - optional, defaults to the signing Identity
   */
  public async isCustodiedBy(args?: { identity: string | Identity }): Promise<boolean> {
    const { context } = this;

    const [portfolioCustodian, targetIdentity] = await Promise.all([
      this.getCustodian(),
      getIdentity(args?.identity, context),
    ]);

    return portfolioCustodian.isEqual(targetIdentity);
  }

  /**
   * Returns whether or not this Portfolio has pre-approved a particular asset
   */
  public async isAssetPreApproved(asset: BaseAsset | string): Promise<boolean> {
    const {
      owner: { did },
      _id: id,
      context,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
    } = this;

    const baseAsset = await asBaseAsset(asset, context);
    const rawAssetId = assetToMeshAssetId(baseAsset, context);

    const rawPortfolioId = portfolioIdToMeshPortfolioId({ did, number: id }, context);

    const rawIsApproved = await portfolio.preApprovedPortfolios(rawPortfolioId, rawAssetId);

    return boolToBoolean(rawIsApproved);
  }

  /**
   * Returns a list of all assets this Portfolio has pre-approved. These assets will not require affirmation when being received in settlements
   */
  public async preApprovedAssets(paginationOpts?: PaginationOptions): Promise<ResultSet<Asset>> {
    const {
      owner: { did },
      _id: id,
      context,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
    } = this;

    const rawPortfolioId = portfolioIdToMeshPortfolioId({ did, number: id }, context);

    const { entries, lastKey: next } = await requestPaginated(portfolio.preApprovedPortfolios, {
      arg: rawPortfolioId,
      paginationOpts,
    });

    const data = await Promise.all(
      entries.map(([storageKey]) => {
        const {
          args: [, rawAssetId],
        } = storageKey;
        const assetId = assetIdToString(rawAssetId);

        return asAsset(assetId, context);
      })
    );

    return { data, next };
  }

  /**
   * Retrieve the balances of all fungible assets in this Portfolio
   *
   * @param args.assets - array of FungibleAssets (or tickers) for which to fetch balances (optional, all balances are retrieved if not passed)
   */
  public async getAssetBalances(args?: {
    assets: (string | FungibleAsset)[];
  }): Promise<PortfolioBalance[]> {
    const {
      owner: { did },
      _id: portfolioId,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
      context,
    } = this;

    const rawPortfolioId = portfolioIdToMeshPortfolioId({ did, number: portfolioId }, context);
    const [exists, totalBalanceEntries, lockedBalanceEntries] = await Promise.all([
      this.exists(),
      portfolio.portfolioAssetBalances.entries(rawPortfolioId),
      portfolio.portfolioLockedAssets.entries(rawPortfolioId),
    ]);

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: notExistsMessage,
      });
    }

    const assetBalances: Record<string, PortfolioBalance> = {};

    totalBalanceEntries.forEach(([key, balance]) => {
      const assetId = assetIdToString(key.args[1]);
      const total = balanceToBigNumber(balance);

      assetBalances[assetId] = {
        asset: new FungibleAsset({ assetId }, context),
        total,
        locked: new BigNumber(0),
        free: total,
      };
    });

    lockedBalanceEntries.forEach(([key, balance]) => {
      const assetId = assetIdToString(key.args[1]);
      const locked = balanceToBigNumber(balance);

      if (!locked.isZero()) {
        const tickerBalance = assetBalances[assetId]!;

        tickerBalance.locked = locked;
        tickerBalance.free = assetBalances[assetId]!.total.minus(locked);
      }
    });

    if (args?.assets.length) {
      const filteredBalances: PortfolioBalance[] = [];
      for (const asset of args.assets) {
        const argAsset = await asFungibleAsset(asset, context);
        const portfolioBalance = {
          total: new BigNumber(0),
          locked: new BigNumber(0),
          free: new BigNumber(0),
          asset: argAsset,
        };

        filteredBalances.push(assetBalances[argAsset.id] ?? portfolioBalance);
      }

      return filteredBalances;
    }

    return Object.values(assetBalances);
  }

  /**
   * Retrieve the NFTs held in this portfolio
   *
   *  @param args.collections - array of NftCollection (or tickers) for which to fetch holdings (optional, all holdings are retrieved if not passed)
   */
  public async getCollections(args?: {
    collections: (string | NftCollection)[];
  }): Promise<PortfolioCollection[]> {
    const {
      owner: { did },
      _id: portfolioId,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
      context,
    } = this;

    const rawPortfolioId = portfolioIdToMeshPortfolioId({ did, number: portfolioId }, context);

    // portfolioNFT uses key [portfolioId, assetId, nftId]. Cast required to query with a single
    // arg as Polkadot defaults to N-1 args.
    const [exists, heldCollectionEntries, lockedCollectionEntries] = await Promise.all([
      this.exists(),
      (
        portfolio.portfolioNFT as unknown as {
          entries: (
            arg1: PolymeshPrimitivesIdentityIdPortfolioId
          ) => Promise<
            [
              StorageKey<
                [PolymeshPrimitivesIdentityIdPortfolioId, PolymeshPrimitivesAssetAssetId, u64]
              >,
              boolean
            ][]
          >;
        }
      ).entries(rawPortfolioId),
      portfolio.portfolioLockedNFT.entries(rawPortfolioId),
    ]);

    if (!exists) {
      throw new PolymeshError({ code: ErrorCode.DataUnavailable, message: notExistsMessage });
    }

    const queriedCollections = args?.collections
      ? await Promise.all(args.collections.map(asset => asAssetId(asset, context)))
      : undefined;

    const seenAssetIds = new Set<string>();
    const heldCollections: Record<string, Nft[]> = {};
    const lockedCollections: Record<string, Nft[]> = {};

    const addNft = (record: Record<string, Nft[]>, assetId: string, nftId: BigNumber): void => {
      if (queriedCollections && !queriedCollections.includes(assetId)) return;
      seenAssetIds.add(assetId);
      const nft = new Nft({ id: nftId, assetId }, context);
      if (record[assetId]) {
        record[assetId].push(nft);
      } else {
        record[assetId] = [nft];
      }
    };

    for (const [{ args: entryArgs }] of heldCollectionEntries) {
      const [, rawAssetId, rawNftId] = entryArgs;
      addNft(heldCollections, assetIdToString(rawAssetId), u64ToBigNumber(rawNftId));
    }

    for (const [
      {
        args: [, [rawAssetId, rawNftId]],
      },
    ] of lockedCollectionEntries) {
      addNft(lockedCollections, assetIdToString(rawAssetId), u64ToBigNumber(rawNftId));
    }

    return [...seenAssetIds].map(assetId => {
      const held = heldCollections[assetId]!;
      const locked = lockedCollections[assetId] || [];
      const lockedIds = new Set(locked.map(({ id }) => id.toString()));
      return {
        collection: new NftCollection({ assetId }, context),
        free: held.filter(({ id }) => !lockedIds.has(id.toString())),
        locked,
        total: new BigNumber(held.length),
      };
    });
  }

  /**
   * Moves funds from this Portfolio to another one owned by the same Identity
   *
   * @note required role:
   *   - Portfolio Custodian
   */
  public moveFunds: ProcedureMethod<MoveFundsParams, void>;

  /**
   * Returns the custody of the portfolio to the portfolio owner unilaterally
   *
   * @note required role:
   *   - Portfolio Custodian
   */
  public quitCustody: NoArgsProcedureMethod<void>;

  /**
   * Pre-approves receiving an asset for this Portfolio. Receiving this asset in a settlement will not require manual affirmation
   */
  public preApproveAsset: ProcedureMethod<{ asset: BaseAsset | string }, void>;

  /**
   * Removes pre-approval of an asset for this Portfolio
   */
  public removeAssetPreApproval: ProcedureMethod<{ asset: BaseAsset | string }, void>;

  /**
   * Retrieve the custodian Identity of this Portfolio
   *
   * @note if no custodian is set, the owner Identity is returned
   */
  public async getCustodian(): Promise<Identity> {
    const {
      owner,
      owner: { did },
      _id: portfolioId,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
      context,
    } = this;

    const rawPortfolioId = portfolioIdToMeshPortfolioId({ did, number: portfolioId }, context);
    const [portfolioCustodian, exists] = await Promise.all([
      portfolio.portfolioCustodian(rawPortfolioId),
      this.exists(),
    ]);

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: notExistsMessage,
      });
    }

    try {
      const rawIdentityId = portfolioCustodian.unwrap();
      return new Identity({ did: identityIdToString(rawIdentityId) }, context);
    } catch (_) {
      return owner;
    }
  }

  /**
   * Retrieve a list of transactions where this portfolio was involved. Can be filtered using parameters
   *
   * @param filters.account - Account involved in the settlement
   * @param filters.ticker - ticker involved in the transaction
   *
   * @note uses the middlewareV2
   */
  public async getTransactionHistory(
    filters: {
      account?: string;
      ticker?: string;
      assetId?: string;
    } = {}
  ): Promise<HistoricSettlement[]> {
    const {
      context,
      owner: { did: identityId },
      _id: portfolioId,
    } = this;

    const { account, ticker, assetId } = filters;

    let middlewareAssetId;
    const assetIdValue = assetId ?? ticker;

    if (assetIdValue) {
      middlewareAssetId = await getAssetIdForMiddleware(assetIdValue, context);
    }

    const settlementsPromise = context.queryMiddleware<Ensured<Query, 'legs'>>(
      settlementsQuery({
        identityId,
        portfolioId,
        address: account,
        assetId: middlewareAssetId,
      })
    );

    const portfolioMovementsPromise = context.queryMiddleware<Ensured<Query, 'portfolioMovements'>>(
      portfolioMovementsQuery({
        identityId,
        portfolioId,
        address: account,
        assetId: middlewareAssetId,
      })
    );

    const [
      {
        data: {
          legs: { nodes: settlements },
        },
      },
      {
        data: {
          portfolioMovements: { nodes: portfolioMovements },
        },
      },
      exists,
    ] = await Promise.all([settlementsPromise, portfolioMovementsPromise, this.exists()]);

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: notExistsMessage,
      });
    }

    return toHistoricalSettlements(
      settlements,
      portfolioMovements,
      {
        identityId,
        portfolio: new BigNumber(portfolioId || 0).toNumber(),
      },
      context
    );
  }

  /**
   * Return the Portfolio ID and owner DID
   */
  public toHuman(): HumanReadable {
    const {
      _id: id,
      owner: { did },
    } = this;

    const result: HumanReadable = {
      did,
    };

    return id ? toHumanReadable({ ...result, id }) : result;
  }
}
