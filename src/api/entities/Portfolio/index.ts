import BigNumber from 'bignumber.js';
import { values } from 'lodash';

import {
  AuthorizationRequest,
  Context,
  Entity,
  FungibleAsset,
  Identity,
  moveFunds,
  Nft,
  NftCollection,
  PolymeshError,
  quitCustody,
  setCustodian,
} from '~/internal';
import { portfolioMovementsQuery } from '~/middleware/queries/portfolios';
import { settlementsQuery } from '~/middleware/queries/settlements';
import { Query } from '~/middleware/types';
import {
  ErrorCode,
  MoveFundsParams,
  NoArgsProcedureMethod,
  ProcedureMethod,
  SetCustodianParams,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  assetIdToString,
  balanceToBigNumber,
  identityIdToString,
  portfolioIdToMeshPortfolioId,
  toHistoricalSettlements,
  u64ToBigNumber,
} from '~/utils/conversion';
import {
  asAssetId,
  asFungibleAsset,
  createProcedureMethod,
  getAssetIdForMiddleware,
  getIdentity,
  toHumanReadable,
} from '~/utils/internal';

import { HistoricSettlement, PortfolioBalance, PortfolioCollection } from './types';

export interface UniqueIdentifiers {
  did: string;
  id?: BigNumber;
}

export interface HumanReadable {
  did: string;
  id?: string;
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
  protected _id?: BigNumber;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { did, id } = identifiers;

    this.owner = new Identity({ did }, context);
    this._id = id;

    this.setCustodian = createProcedureMethod(
      { getProcedureAndArgs: args => [setCustodian, { ...args, did, id }] },
      context
    );
    this.moveFunds = createProcedureMethod(
      { getProcedureAndArgs: args => [moveFunds, { ...args, from: this }] },
      context
    );
    this.quitCustody = createProcedureMethod(
      { getProcedureAndArgs: () => [quitCustody, { portfolio: this }], voidArgs: true },
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
        const tickerBalance = assetBalances[assetId];

        tickerBalance.locked = locked;
        tickerBalance.free = assetBalances[assetId].total.minus(locked);
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

    return values(assetBalances);
  }

  /**
   * Retrieve the NFTs held in this portfolio
   *
   *  @param args.assets - array of NftCollection (or tickers) for which to fetch holdings (optional, all holdings are retrieved if not passed)
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
    const [exists, heldCollectionEntries, lockedCollectionEntries] = await Promise.all([
      this.exists(),
      portfolio.portfolioNFT.entries(rawPortfolioId),
      portfolio.portfolioLockedNFT.entries(rawPortfolioId),
    ]);

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: notExistsMessage,
      });
    }

    let queriedCollections: string[] | undefined;

    if (args?.collections) {
      queriedCollections = await Promise.all(
        args.collections.map(asset => asAssetId(asset, context))
      );
    }

    const seenAssetIds = new Set<string>();

    const processCollectionEntry = (
      collectionRecord: Record<string, Nft[]>,
      entry: (typeof heldCollectionEntries)[0]
    ): Record<string, Nft[]> => {
      const [
        {
          args: [, [rawAssetId, rawNftId]],
        },
      ] = entry;

      const assetId = assetIdToString(rawAssetId);
      const heldId = u64ToBigNumber(rawNftId);

      if (queriedCollections && !queriedCollections.includes(assetId)) {
        return collectionRecord;
      }

      // if the user provided a filter arg, then ignore any asset not specified
      if (!queriedCollections || queriedCollections.includes(assetId)) {
        seenAssetIds.add(assetId);
        const nft = new Nft({ id: heldId, assetId }, context);

        if (!collectionRecord[assetId]) {
          collectionRecord[assetId] = [nft];
        } else {
          collectionRecord[assetId].push(nft);
        }
      }

      return collectionRecord;
    };

    const heldCollections: Record<string, Nft[]> = heldCollectionEntries.reduce(
      (collection, entry) => processCollectionEntry(collection, entry),
      {}
    );

    const lockedCollections: Record<string, Nft[]> = lockedCollectionEntries.reduce(
      (collection, entry) => processCollectionEntry(collection, entry),
      {}
    );

    const collections: PortfolioCollection[] = [];
    seenAssetIds.forEach(assetId => {
      const held = heldCollections[assetId];
      const locked = lockedCollections[assetId] || [];
      // calculate free NFTs by filtering held NFTs by locked NFT IDs
      const lockedIds = new Set(locked.map(({ id }) => id.toString()));
      const free = held.filter(({ id }) => !lockedIds.has(id.toString()));
      const total = new BigNumber(held.length);

      collections.push({
        collection: new NftCollection({ assetId }, context),
        free,
        locked,
        total,
      });
    });

    return collections;
  }

  /**
   * Send an invitation to an Identity to assign it as custodian for this Portfolio
   *
   * @note this will create an {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Request} which has to be accepted by the `targetIdentity`.
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
   *
   * @note required role:
   *   - Portfolio Custodian
   */
  public setCustodian: ProcedureMethod<SetCustodianParams, AuthorizationRequest>;

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
      settlementsQuery(context.isSqIdPadded, {
        identityId,
        portfolioId,
        address: account,
        assetId: middlewareAssetId,
      })
    );

    const portfolioMovementsPromise = context.queryMiddleware<Ensured<Query, 'portfolioMovements'>>(
      portfolioMovementsQuery(context.isSqIdPadded, {
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

    const result = {
      did,
    };

    return id ? toHumanReadable({ ...result, id }) : result;
  }
}
