import { Option, StorageKey, u64 } from '@polkadot/types';
import { AccountId32 } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesIdentityDidRecord,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { chunk, flatten, uniqBy } from 'lodash';

import { assertPortfolioExists } from '~/api/procedures/utils';
import {
  Account,
  Asset,
  Context,
  Entity,
  Instruction,
  PolymeshError,
  TickerReservation,
  Venue,
} from '~/internal';
import { tokensByTrustedClaimIssuer, tokensHeldByDid } from '~/middleware/queries';
import { assetHoldersQuery, trustingAssetsQuery } from '~/middleware/queriesV2';
import { Query } from '~/middleware/types';
import { AssetHoldersOrderBy, Query as QueryV2 } from '~/middleware/typesV2';
import {
  CheckRolesResult,
  DistributionWithDetails,
  ErrorCode,
  GroupedInstructions,
  Order,
  PaginationOptions,
  PermissionedAccount,
  ResultSet,
  Role,
  SubCallback,
  UnsubCallback,
} from '~/types';
import { Ensured, EnsuredV2, tuple } from '~/types/utils';
import {
  isCddProviderRole,
  isIdentityRole,
  isPortfolioCustodianRole,
  isTickerOwnerRole,
  isVenueOwnerRole,
} from '~/utils';
import { MAX_CONCURRENT_REQUESTS, MAX_PAGE_SIZE } from '~/utils/constants';
import {
  accountIdToString,
  balanceToBigNumber,
  boolToBoolean,
  cddStatusToBoolean,
  corporateActionIdentifierToCaId,
  identityIdToString,
  portfolioIdToMeshPortfolioId,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
  stringToIdentityId,
  stringToTicker,
  transactionPermissionsToTxGroups,
  u64ToBigNumber,
} from '~/utils/conversion';
import {
  asTicker,
  calculateNextKey,
  getSecondaryAccountPermissions,
  removePadding,
  requestPaginated,
} from '~/utils/internal';

import { AssetPermissions } from './AssetPermissions';
import { IdentityAuthorizations } from './IdentityAuthorizations';
import { Portfolios } from './Portfolios';

/**
 * Properties that uniquely identify an Identity
 */
export interface UniqueIdentifiers {
  did: string;
}

/**
 * Represents an Identity in the Polymesh blockchain
 */
export class Identity extends Entity<UniqueIdentifiers, string> {
  /**
   * @hidden
   * Checks if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { did } = identifier as UniqueIdentifiers;

    return typeof did === 'string';
  }

  /**
   * Identity ID as stored in the blockchain
   */
  public did: string;

  // Namespaces
  public authorizations: IdentityAuthorizations;
  public portfolios: Portfolios;
  public assetPermissions: AssetPermissions;

  /**
   * Create an Identity entity
   *
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { did } = identifiers;

    this.did = did;
    this.authorizations = new IdentityAuthorizations(this, context);
    this.portfolios = new Portfolios(this, context);
    this.assetPermissions = new AssetPermissions(this, context);
  }

  /**
   * Check whether this Identity possesses the specified Role
   */
  public async hasRole(role: Role): Promise<boolean> {
    const { context, did } = this;

    if (isTickerOwnerRole(role)) {
      const { ticker } = role;

      const reservation = new TickerReservation({ ticker }, context);
      const { owner } = await reservation.details();

      return owner ? this.isEqual(owner) : false;
    } else if (isCddProviderRole(role)) {
      const {
        polymeshApi: {
          query: { cddServiceProviders },
        },
      } = context;

      const activeMembers = await cddServiceProviders.activeMembers();
      const memberDids = activeMembers.map(identityIdToString);

      return memberDids.includes(did);
    } else if (isVenueOwnerRole(role)) {
      const venue = new Venue({ id: role.venueId }, context);

      const { owner } = await venue.details();

      return this.isEqual(owner);
    } else if (isPortfolioCustodianRole(role)) {
      const { portfolioId } = role;

      const portfolio = portfolioIdToPortfolio(portfolioId, context);

      return portfolio.isCustodiedBy();
    } else if (isIdentityRole(role)) {
      return did === role.did;
    }

    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `Unrecognized role "${JSON.stringify(role)}"`,
    });
  }

  /**
   * Retrieve the balance of a particular Asset
   *
   * @note can be subscribed to
   */
  public getAssetBalance(args: { ticker: string }): Promise<BigNumber>;
  public getAssetBalance(
    args: { ticker: string },
    callback: SubCallback<BigNumber>
  ): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getAssetBalance(
    args: { ticker: string },
    callback?: SubCallback<BigNumber>
  ): Promise<BigNumber | UnsubCallback> {
    const {
      did,
      context,
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
    } = this;
    const { ticker } = args;

    const rawTicker = stringToTicker(ticker, context);
    const rawIdentityId = stringToIdentityId(did, context);

    const meshAsset = await asset.tokens(rawTicker);

    if (meshAsset.ownerDid.isEmpty) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: `There is no Asset with ticker "${ticker}"`,
      });
    }

    if (callback) {
      return asset.balanceOf(rawTicker, rawIdentityId, res => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(balanceToBigNumber(res));
      });
    }

    const balance = await asset.balanceOf(rawTicker, rawIdentityId);

    return balanceToBigNumber(balance);
  }

  /**
   * Check whether this Identity has a valid CDD claim
   */
  public async hasValidCdd(): Promise<boolean> {
    const {
      context,
      did,
      context: {
        polymeshApi: { rpc },
      },
    } = this;
    const identityId = stringToIdentityId(did, context);
    const result = await rpc.identity.isIdentityHasValidCdd(identityId);
    return cddStatusToBoolean(result);
  }

  /**
   * Check whether this Identity is Governance Committee member
   */
  public async isGcMember(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { committeeMembership },
        },
      },
      did,
    } = this;

    const activeMembers = await committeeMembership.activeMembers();
    return activeMembers.map(identityIdToString).includes(did);
  }

  /**
   * Check whether this Identity is a CDD provider
   */
  public async isCddProvider(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { cddServiceProviders },
        },
      },
      did,
    } = this;

    const activeMembers = await cddServiceProviders.activeMembers();
    return activeMembers.map(identityIdToString).includes(did);
  }

  /**
   * Retrieve the primary Account associated with the Identity
   *
   * @note can be subscribed to
   */
  public async getPrimaryAccount(): Promise<PermissionedAccount>;
  public async getPrimaryAccount(
    callback: SubCallback<PermissionedAccount>
  ): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getPrimaryAccount(
    callback?: SubCallback<PermissionedAccount>
  ): Promise<PermissionedAccount | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { identity },
        },
      },
      did,
      context,
    } = this;

    const assembleResult = (
      record: Option<PolymeshPrimitivesIdentityDidRecord>
    ): PermissionedAccount => {
      // we know the record exists because otherwise the Identity couldn't have been fetched
      const { primaryKey } = record.unwrap();

      return {
        // we know the primary key exists because Asset Identities aren't considered Identities by the SDK for now
        account: new Account({ address: accountIdToString(primaryKey.unwrap()) }, context),
        permissions: {
          assets: null,
          portfolios: null,
          transactions: null,
          transactionGroups: transactionPermissionsToTxGroups(null),
        },
      };
    };

    const rawDid = stringToIdentityId(did, context);

    if (callback) {
      return identity.didRecords(rawDid, records => callback(assembleResult(records)));
    }

    const didRecords = await identity.didRecords(rawDid);
    return assembleResult(didRecords);
  }

  /**
   * Retrieve a list of all Assets which were held at one point by this Identity
   *
   * @note uses the middleware
   * @note supports pagination
   */
  public async getHeldAssets(
    opts: {
      order?: Order;
      size?: BigNumber;
      start?: BigNumber;
    } = { order: Order.Asc }
  ): Promise<ResultSet<Asset>> {
    const { context, did } = this;

    const { size, start, order } = opts;

    if (context.isMiddlewareV2Enabled()) {
      return this.getHeldAssetsV2({
        order:
          order === Order.Asc ? AssetHoldersOrderBy.AssetIdAsc : AssetHoldersOrderBy.AssetIdDesc,
        start,
        size,
      });
    }

    const result = await context.queryMiddleware<Ensured<Query, 'tokensHeldByDid'>>(
      tokensHeldByDid({
        did,
        count: size?.toNumber(),
        skip: start?.toNumber(),
        order,
      })
    );

    const {
      data: {
        tokensHeldByDid: { items: assetsHeldByDidList, totalCount },
      },
    } = result;

    const count = new BigNumber(totalCount);

    const data = assetsHeldByDidList.map(ticker => new Asset({ ticker }, context));

    const next = calculateNextKey(count, size, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Retrieve a list of all Assets which were held at one point by this Identity
   *
   * @note uses the middlewareV2
   * @note supports pagination
   */
  public async getHeldAssetsV2(
    opts: {
      order?: AssetHoldersOrderBy;
      size?: BigNumber;
      start?: BigNumber;
    } = {}
  ): Promise<ResultSet<Asset>> {
    const { context, did } = this;

    const { size, start, order } = opts;

    const {
      data: {
        assetHolders: { nodes, totalCount },
      },
    } = await context.queryMiddlewareV2<EnsuredV2<QueryV2, 'assetHolders'>>(
      assetHoldersQuery(
        {
          identityId: did,
        },
        size,
        start,
        order
      )
    );

    const count = new BigNumber(totalCount);

    const data = nodes.map(({ assetId: ticker }) => new Asset({ ticker }, context));

    const next = calculateNextKey(count, size, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Check whether this Identity possesses all specified roles
   */
  public async checkRoles(roles: Role[]): Promise<CheckRolesResult> {
    const missingRoles = await P.filter(roles, async role => {
      const hasRole = await this.hasRole(role);

      return !hasRole;
    });

    if (missingRoles.length) {
      return {
        missingRoles,
        result: false,
      };
    }

    return {
      result: true,
    };
  }

  /**
   * Get the list of Assets for which this Identity is a trusted claim issuer
   *
   * @note uses the middleware
   */
  public async getTrustingAssets(): Promise<Asset[]> {
    const { context, did } = this;

    if (context.isMiddlewareV2Enabled()) {
      return this.getTrustingAssetsV2();
    }

    const {
      data: { tokensByTrustedClaimIssuer: tickers },
    } = await context.queryMiddleware<Ensured<Query, 'tokensByTrustedClaimIssuer'>>(
      tokensByTrustedClaimIssuer({ claimIssuerDid: did })
    );

    return tickers.map(ticker => new Asset({ ticker: removePadding(ticker) }, context));
  }

  /**
   * Get the list of Assets for which this Identity is a trusted claim issuer
   *
   * @note uses the middlewareV2
   */
  public async getTrustingAssetsV2(): Promise<Asset[]> {
    const { context, did } = this;

    const {
      data: {
        trustedClaimIssuers: { nodes },
      },
    } = await context.queryMiddlewareV2<EnsuredV2<QueryV2, 'trustedClaimIssuers'>>(
      trustingAssetsQuery({ issuer: did })
    );

    return nodes.map(({ assetId: ticker }) => new Asset({ ticker }, context));
  }

  /**
   * Retrieve all Venues created by this Identity
   *
   * @note can be subscribed to
   */
  public async getVenues(): Promise<Venue[]>;
  public async getVenues(callback: SubCallback<Venue[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getVenues(callback?: SubCallback<Venue[]>): Promise<Venue[] | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      did,
      context,
    } = this;

    const assembleResult = (ids: u64[]): Venue[] =>
      ids.map(id => new Venue({ id: u64ToBigNumber(id) }, context));

    const rawDid = stringToIdentityId(did, context);

    if (callback) {
      return settlement.userVenues(rawDid, ids => callback(assembleResult(ids)));
    }

    const venueIds = await settlement.userVenues(rawDid);

    return assembleResult(venueIds);
  }

  /**
   * Retrieve the Scope ID associated to this Identity's Investor Uniqueness Claim for a specific Asset, or null
   *   if there is none
   *
   * @note more on Investor Uniqueness [here](https://developers.polymesh.network/introduction/identity#polymesh-unique-identity-system-puis) and
   *   [here](https://developers.polymesh.network/polymesh-docs/primitives/confidential-identity)
   */
  public async getScopeId(args: { asset: Asset | string }): Promise<string | null> {
    const { context, did } = this;
    const { asset } = args;

    const ticker = asTicker(asset);

    const scopeId = await context.polymeshApi.query.asset.scopeIdOf(
      stringToTicker(ticker, context),
      stringToIdentityId(did, context)
    );

    if (scopeId.isEmpty) {
      return null;
    }

    return identityIdToString(scopeId);
  }

  /**
   * Retrieve all Instructions where this Identity is a participant,
   *   grouped by status
   */
  public async getInstructions(): Promise<GroupedInstructions> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      did,
      portfolios,
      context,
    } = this;

    const ownedPortfolios = await portfolios.getPortfolios();

    const [ownedCustodiedPortfolios, { data: custodiedPortfolios }] = await Promise.all([
      P.filter(ownedPortfolios, portfolio => portfolio.isCustodiedBy({ identity: did })),
      this.portfolios.getCustodiedPortfolios(),
    ]);

    const allPortfolios = [...ownedCustodiedPortfolios, ...custodiedPortfolios];

    const portfolioIds = allPortfolios.map(portfolioLikeToPortfolioId);

    await P.map(portfolioIds, portfolioId => assertPortfolioExists(portfolioId, context));

    const portfolioIdChunks = chunk(portfolioIds, MAX_CONCURRENT_REQUESTS);

    const affirmed: Instruction[] = [];
    const pending: Instruction[] = [];
    const failed: Instruction[] = [];

    await P.each(portfolioIdChunks, async portfolioIdChunk => {
      const auths = await P.map(portfolioIdChunk, portfolioId =>
        settlement.userAffirmations.entries(portfolioIdToMeshPortfolioId(portfolioId, context))
      );

      const uniqueEntries = uniqBy(
        flatten(auths).map(([key, status]) => ({ id: key.args[1], status })),
        ({ id }) => id.toNumber()
      );
      const instructions = await settlement.instructionDetails.multi(
        uniqueEntries.map(({ id }) => id)
      );

      uniqueEntries.forEach(({ id, status }, index) => {
        const instruction = new Instruction({ id: u64ToBigNumber(id) }, context);

        if (instructions[index].status.isFailed) {
          failed.push(instruction);
        } else if (status.isAffirmed) {
          affirmed.push(instruction);
        } else if (status.isPending) {
          pending.push(instruction);
        }
      });
    });

    return {
      affirmed,
      pending,
      failed,
    };
  }

  /**
   * Check whether secondary Accounts are frozen
   *
   * @note can be subscribed to
   */
  public areSecondaryAccountsFrozen(): Promise<boolean>;
  public areSecondaryAccountsFrozen(callback: SubCallback<boolean>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async areSecondaryAccountsFrozen(
    callback?: SubCallback<boolean>
  ): Promise<boolean | UnsubCallback> {
    const {
      did,
      context: {
        polymeshApi: {
          query: { identity },
        },
      },
      context,
    } = this;

    const rawIdentityId = stringToIdentityId(did, context);

    if (callback) {
      return identity.isDidFrozen(rawIdentityId, frozen => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(boolToBoolean(frozen));
      });
    }

    const result = await identity.isDidFrozen(rawIdentityId);

    return boolToBoolean(result);
  }

  /**
   * Retrieve every Dividend Distribution for which this Identity is eligible and hasn't been paid
   *
   * @note uses the middleware
   * @note this query can be potentially **SLOW** depending on which Assets this Identity has held
   */
  public async getPendingDistributions(): Promise<DistributionWithDetails[]> {
    const { context, did } = this;
    let assets: Asset[] = [];
    let allFetched = false;
    let start: BigNumber | undefined;

    while (!allFetched) {
      const { data, next } = await this.getHeldAssets({ size: MAX_PAGE_SIZE, start });
      start = next ? new BigNumber(next) : undefined;
      allFetched = !next;
      assets = [...assets, ...data];
    }

    const distributions = await this.context.getDividendDistributionsForAssets({ assets: assets });

    const now = new Date();

    /*
     * We filter distributions out if:
     *   - They have expired
     *   - They have not begun
     *   - This Identity has already been paid
     */
    return P.filter(distributions, async ({ distribution }): Promise<boolean> => {
      const {
        expiryDate,
        asset: { ticker },
        id: localId,
        paymentDate,
      } = distribution;

      const isExpired = expiryDate && expiryDate < now;
      const hasNotStarted = paymentDate > now;

      if (isExpired || hasNotStarted) {
        return false;
      }

      const holderPaid = await context.polymeshApi.query.capitalDistribution.holderPaid(
        tuple(
          corporateActionIdentifierToCaId({ ticker, localId }, context),
          stringToIdentityId(did, context)
        )
      );

      return !boolToBoolean(holderPaid);
    });
  }

  /**
   * Get the list of secondary Accounts related to the Identity
   *
   * @note supports pagination
   * @note can be subscribed to
   */
  public async getSecondaryAccounts(
    paginationOpts?: PaginationOptions
  ): Promise<ResultSet<PermissionedAccount>>;

  public async getSecondaryAccounts(
    callback: SubCallback<PermissionedAccount[]>
  ): Promise<UnsubCallback>;

  public getSecondaryAccounts(
    paginationOpts: PaginationOptions,
    callback: SubCallback<PermissionedAccount[]>
  ): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getSecondaryAccounts(
    args?: PaginationOptions | SubCallback<PermissionedAccount[]>,
    callback?: SubCallback<PermissionedAccount[]>
  ): Promise<ResultSet<PermissionedAccount> | UnsubCallback> {
    const {
      did,
      context,
      context: {
        polymeshApi: {
          query: { identity },
        },
      },
    } = this;

    let opts;
    let cb: SubCallback<PermissionedAccount[]> | undefined = callback;
    switch (typeof args) {
      case 'undefined': {
        break;
      }
      case 'function': {
        cb = args;
        break;
      }
      default: {
        opts = args;
        break;
      }
    }

    const keyToAccount = (
      key: StorageKey<[PolymeshPrimitivesIdentityId, AccountId32]>
    ): Account => {
      const [, value] = key.args;
      const address = accountIdToString(value);
      return new Account({ address }, context);
    };

    const { entries: keys, lastKey: next } = await requestPaginated(identity.didKeys, {
      arg: did,
      paginationOpts: opts,
    });
    const accounts = keys.map(([key]) => keyToAccount(key));

    if (cb) {
      return getSecondaryAccountPermissions({ accounts }, context, cb);
    }

    const data = await getSecondaryAccountPermissions({ accounts }, context);
    return {
      data,
      next,
    };
  }

  /**
   * Determine whether this Identity exists on chain
   *
   * @note asset Identities aren't considered to exist for this check
   */
  public async exists(): Promise<boolean> {
    const { did, context } = this;

    const didRecord = await context.polymeshApi.query.identity.didRecords(
      stringToIdentityId(did, context)
    );

    if (didRecord.isNone) {
      return false;
    }

    const record = didRecord.unwrap();

    if (record.primaryKey.isNone) {
      return false;
    }

    return true;
  }

  /**
   * Return the Identity's DID
   */
  public toHuman(): string {
    return this.did;
  }
}
