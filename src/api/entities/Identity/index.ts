import { Option, StorageKey, u64 } from '@polkadot/types';
import { AccountId32 } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesIdentityDidRecord,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';
import { hexAddPrefix, hexStripPrefix, stringToHex } from '@polkadot/util';
import { blake2AsHex } from '@polkadot/util-crypto';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { chunk, differenceWith, flatten, intersectionWith, lt, uniqBy } from 'lodash';

import { unlinkChildIdentity } from '~/api/procedures/unlinkChildIdentity';
import { assertPortfolioExists } from '~/api/procedures/utils';
import {
  Account,
  BaseAsset,
  ChildIdentity,
  Context,
  Entity,
  FungibleAsset,
  Instruction,
  MultiSig,
  Nft,
  NftCollection,
  PolymeshError,
  TickerReservation,
  Venue,
} from '~/internal';
import { assetHoldersQuery, nftHoldersQuery } from '~/middleware/queries/assets';
import { trustingAssetsQuery } from '~/middleware/queries/claims';
import { instructionPartiesQuery } from '~/middleware/queries/settlements';
import { instructionsByDidQuery } from '~/middleware/queries/settlementsOld';
import { AssetHoldersOrderBy, NftHoldersOrderBy, Query } from '~/middleware/types';
import { Query as QueryOld } from '~/middleware/typesV6';
import { CddStatus } from '~/polkadot/polymesh';
import {
  Asset,
  CheckRolesResult,
  DefaultPortfolio,
  DistributionWithDetails,
  ErrorCode,
  GroupedInstructions,
  GroupedInvolvedInstructions,
  HeldNfts,
  HistoricInstruction,
  InstructionsByStatus,
  MultiSigSigners,
  NumberedPortfolio,
  PaginationOptions,
  PermissionedAccount,
  ProcedureMethod,
  ResultSet,
  Role,
  Signer,
  SubCallback,
  UnlinkChildParams,
  UnsubCallback,
} from '~/types';
import { Ensured, tuple } from '~/types/utils';
import {
  isCddProviderRole,
  isIdentityRole,
  isPortfolioCustodianRole,
  isTickerOwnerRole,
  isVenueOwnerRole,
} from '~/utils';
import {
  ASSET_ID_PREFIX,
  MAX_CONCURRENT_REQUESTS,
  MAX_PAGE_SIZE,
  SETTLEMENTS_V2_SQ_VERSION,
} from '~/utils/constants';
import {
  accountIdToString,
  assetToMeshAssetId,
  balanceToBigNumber,
  boolToBoolean,
  cddStatusToBoolean,
  corporateActionIdentifierToCaId,
  identityIdToString,
  meshAssetToAssetId,
  middlewareInstructionToHistoricInstruction,
  oldMiddlewareInstructionToHistoricInstruction,
  portfolioIdToMeshPortfolioId,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
  signatoryToSignerValue,
  signerValueToSigner,
  stringToIdentityId,
  transactionPermissionsToTxGroups,
  u64ToBigNumber,
} from '~/utils/conversion';
import {
  asAsset,
  asBaseAsset,
  calculateNextKey,
  createProcedureMethod,
  getAccount,
  getLatestSqVersion,
  getSecondaryAccountPermissions,
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

    this.unlinkChild = createProcedureMethod(
      {
        getProcedureAndArgs: args => [unlinkChildIdentity, args],
      },
      context
    );
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
   * @note can be subscribed to, if connected to node using a web socket
   */
  public getAssetBalance(args: { ticker: string }): Promise<BigNumber>;
  public getAssetBalance(args: { assetId: string }): Promise<BigNumber>;
  public getAssetBalance(
    args: { ticker: string },
    callback: SubCallback<BigNumber>
  ): Promise<UnsubCallback>;

  public getAssetBalance(
    args: { assetId: string },
    callback: SubCallback<BigNumber>
  ): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getAssetBalance(
    args: { ticker?: string; assetId?: string },
    callback?: SubCallback<BigNumber>
  ): Promise<BigNumber | UnsubCallback> {
    const {
      did,
      context,
      context: {
        polymeshApi: {
          query: { asset },
        },
        isV6,
      },
    } = this;
    const { ticker, assetId } = args;

    const baseAsset = await asBaseAsset((assetId ?? ticker)!, context);
    const rawAssetId = assetToMeshAssetId(baseAsset, context);
    const rawIdentityId = stringToIdentityId(did, context);

    let tokensStorage;
    if (isV6) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tokensStorage = (asset as any).tokens;
    } else {
      tokensStorage = asset.securityTokens;
    }
    const meshAsset = await tokensStorage(rawAssetId);

    if (meshAsset.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: `There is no Asset with ${ticker ? 'ticker' : 'asset ID'} "${ticker ?? assetId}"`,
      });
    }

    if (callback) {
      context.assertSupportsSubscription();

      return asset.balanceOf(rawAssetId, rawIdentityId, res => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(balanceToBigNumber(res));
      });
    }

    const balance = await asset.balanceOf(rawAssetId, rawIdentityId);

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
        polymeshApi: { call },
      },
    } = this;
    const identityId = stringToIdentityId(did, context);
    const result = await call.identityApi.isIdentityHasValidCdd<CddStatus>(identityId, null);
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
   * @note can be subscribed to, if connected to node using a web socket
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

    const assembleResult = async (
      record: Option<PolymeshPrimitivesIdentityDidRecord>
    ): Promise<PermissionedAccount> => {
      const { primaryKey } = record.unwrap();

      const account = await getAccount(
        {
          address: accountIdToString(primaryKey.unwrap()),
        },
        this.context
      );

      return {
        account,
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
      context.assertSupportsSubscription();

      return identity.didRecords(rawDid, async records => {
        const result = await assembleResult(records);

        await callback(result);
      });
    }

    const didRecords = await identity.didRecords(rawDid);
    return assembleResult(didRecords);
  }

  /**
   * Retrieve a list of all Assets which were held at one point by this Identity
   *
   * @note uses the middlewareV2
   * @note supports pagination
   */
  public async getHeldAssets(
    opts: {
      order?: AssetHoldersOrderBy;
      size?: BigNumber;
      start?: BigNumber;
    } = {}
  ): Promise<ResultSet<FungibleAsset>> {
    const { context, did } = this;

    const { size, start, order } = opts;

    const {
      data: {
        assetHolders: { nodes, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'assetHolders'>>(
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

    const data = nodes.map(({ assetId }) => new FungibleAsset({ assetId }, context));

    const next = calculateNextKey(count, data.length, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Retrieve a list of all NftCollections which were held at one point by this Identity
   *
   * @note uses the middlewareV2
   * @note supports pagination
   */
  public async getHeldNfts(
    opts: {
      order?: NftHoldersOrderBy;
      size?: BigNumber;
      start?: BigNumber;
    } = {}
  ): Promise<ResultSet<HeldNfts>> {
    const { context, did } = this;

    const { size, start, order } = opts;

    const {
      data: {
        nftHolders: { nodes, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'nftHolders'>>(
      nftHoldersQuery(
        {
          identityId: did,
        },
        size,
        start,
        order
      )
    );

    const count = new BigNumber(totalCount);

    const data = nodes.map(({ assetId, nftIds }) => {
      const collection = new NftCollection({ assetId }, context);
      const nfts = nftIds.map((id: number) => new Nft({ assetId, id: new BigNumber(id) }, context));

      return { collection, nfts };
    });

    const next = calculateNextKey(count, data.length, start);

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
   * @note uses the middlewareV2
   */
  public async getTrustingAssets(): Promise<FungibleAsset[]> {
    const { context, did } = this;

    const {
      data: {
        trustedClaimIssuers: { nodes },
      },
    } = await context.queryMiddleware<Ensured<Query, 'trustedClaimIssuers'>>(
      trustingAssetsQuery({ issuer: did })
    );

    return nodes.map(({ assetId }) => new FungibleAsset({ assetId }, context));
  }

  /**
   * Retrieve all Venues created by this Identity
   */
  public async getVenues(): Promise<Venue[]> {
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

    const venueIdsKeys = await settlement.userVenues.keys(rawDid);
    const venueIds = venueIdsKeys.map(key => {
      return key.args[1];
    });

    return assembleResult(venueIds);
  }

  /**
   * Retrieve all Instructions where this Identity is a custodian of one or more portfolios in the legs,
   *   grouped by status
   */
  public async getInstructions(): Promise<GroupedInstructions> {
    const { did, portfolios } = this;

    const ownedPortfolios = await portfolios.getPortfolios();

    const [ownedCustodiedPortfolios, { data: custodiedPortfolios }] = await Promise.all([
      P.filter(ownedPortfolios, portfolio => portfolio.isCustodiedBy({ identity: did })),
      this.portfolios.getCustodiedPortfolios(),
    ]);

    const allPortfolios = [...ownedCustodiedPortfolios, ...custodiedPortfolios];

    const { affirmed, pending, failed } = await this.assembleGroupedInstructions(allPortfolios);

    return {
      affirmed: differenceWith(affirmed, pending, (obj1, obj2) => obj1.id.eq(obj2.id)),
      pending,
      failed,
    };
  }

  /**
   * Get all the instructions grouped by status, where given portfolios are involved
   *
   * @hidden
   */
  private async assembleGroupedInstructions(
    portfolios: (DefaultPortfolio | NumberedPortfolio)[]
  ): Promise<GroupedInstructions> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      context,
    } = this;

    const affirmed: Instruction[] = [];
    const pending: Instruction[] = [];
    const failed: Instruction[] = [];

    const portfolioIds = portfolios.map(portfolioLikeToPortfolioId);

    await P.map(portfolioIds, portfolioId => assertPortfolioExists(portfolioId, context));

    const portfolioIdChunks = chunk(portfolioIds, MAX_CONCURRENT_REQUESTS);

    await P.each(portfolioIdChunks, async portfolioIdChunk => {
      const auths = await P.map(portfolioIdChunk, portfolioId =>
        settlement.userAffirmations.entries(portfolioIdToMeshPortfolioId(portfolioId, context))
      );

      const uniqueEntries = uniqBy(
        flatten(auths).map(([key, status]) => ({ id: key.args[1], status })),
        ({ id, status }) => `${id.toString()}-${status.type}`
      );

      const instructionStatuses = await settlement.instructionStatuses.multi(
        uniqueEntries.map(({ id }) => id)
      );

      uniqueEntries.forEach(({ id, status: affirmationStatus }, index) => {
        const instruction = new Instruction({ id: u64ToBigNumber(id) }, context);
        const status = instructionStatuses[index];

        if (status.isFailed) {
          failed.push(instruction);
        } else if (affirmationStatus.isAffirmed) {
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
   * Retrieve all Instructions where this Identity is a participant (owner/custodian),
   *   grouped by the role of the Identity and Instruction status
   */
  public async getInvolvedInstructions(): Promise<GroupedInvolvedInstructions> {
    const { portfolios, did } = this;

    const [allPortfolios, { data: custodiedPortfolios }] = await Promise.all([
      portfolios.getPortfolios(),
      portfolios.getCustodiedPortfolios(),
    ]);

    const ownedPortfolios: (DefaultPortfolio | NumberedPortfolio)[] = [];
    const ownedCustodiedPortfolios: (DefaultPortfolio | NumberedPortfolio)[] = [];
    const custodies = await Promise.all(
      allPortfolios.map(portfolio => portfolio.isCustodiedBy({ identity: did }))
    );

    custodies.forEach((custody, index) => {
      if (custody) {
        ownedCustodiedPortfolios.push(allPortfolios[index]);
      } else {
        ownedPortfolios.push(allPortfolios[index]);
      }
    });

    /**
     * This gathers all the partiallyAffirmed Instructions as the intersection of pending + affirmed.
     * These partiallyAffirmed ones, are then removed from the affirmed and pending to get the unique sets.
     */
    const assembleResult = ({
      affirmed,
      pending,
      failed,
    }: GroupedInstructions): InstructionsByStatus => {
      const partiallyAffirmed = intersectionWith(affirmed, pending, (obj1, obj2) =>
        obj1.id.eq(obj2.id)
      );

      return {
        affirmed: differenceWith(affirmed, partiallyAffirmed, (obj1, obj2) => obj1.id.eq(obj2.id)),
        pending: differenceWith(pending, partiallyAffirmed, (obj1, obj2) => obj1.id.eq(obj2.id)),
        partiallyAffirmed,
        failed,
      };
    };

    const [owned, custodied] = await Promise.all([
      this.assembleGroupedInstructions(ownedPortfolios),
      this.assembleGroupedInstructions([...ownedCustodiedPortfolios, ...custodiedPortfolios]),
    ]);

    return {
      owned: assembleResult(owned),
      custodied: assembleResult(custodied),
    };
  }

  /**
   * Check whether secondary Accounts are frozen
   *
   * @note can be subscribed to, if connected to node using a web socket
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
      context.assertSupportsSubscription();

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
    let assets: FungibleAsset[] = [];
    let allFetched = false;
    let start: BigNumber | undefined;

    while (!allFetched) {
      const { data, next } = await this.getHeldAssets({ size: MAX_PAGE_SIZE, start });
      start = next ? new BigNumber(next) : undefined;
      allFetched = !next;
      assets = [...assets, ...data];
    }

    const distributions = await this.context.getDividendDistributionsForAssets({ assets });

    const now = new Date();

    /*
     * We filter distributions out if:
     *   - They have expired
     *   - They have not begun
     *   - This Identity has already been paid
     */
    return P.filter(distributions, async ({ distribution }): Promise<boolean> => {
      const { expiryDate, asset, id: localId, paymentDate } = distribution;

      const isExpired = expiryDate && expiryDate < now;
      const hasNotStarted = paymentDate > now;

      if (isExpired || hasNotStarted) {
        return false;
      }

      const holderPaid = await context.polymeshApi.query.capitalDistribution.holderPaid(
        tuple(
          corporateActionIdentifierToCaId({ asset, localId }, context),
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
   * @note can be subscribed to, if connected to node using a web socket
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

    const keyToAccount = async (
      key: StorageKey<[PolymeshPrimitivesIdentityId, AccountId32]>
    ): Promise<Account | MultiSig> => {
      const [, value] = key.args;

      const account = await getAccount(
        {
          address: accountIdToString(value),
        },
        this.context
      );

      return account;
    };

    const { entries: keys, lastKey: next } = await requestPaginated(identity.didKeys, {
      arg: did,
      paginationOpts: opts,
    });
    const accounts = await Promise.all(keys.map(([key]) => keyToAccount(key)));

    if (cb) {
      context.assertSupportsSubscription();

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

  /**
   * Retrieve all Instructions that have been associated with this Identity's DID
   *
   * @note uses the middleware V2
   */
  public async getHistoricalInstructions(): Promise<HistoricInstruction[]> {
    const { context, did } = this;

    // TODO @prashantasdeveloper Remove after SQ dual version support
    const sqVersion = await getLatestSqVersion(context);

    if (lt(sqVersion, SETTLEMENTS_V2_SQ_VERSION)) {
      const {
        data: {
          legs: { nodes: instructionsResult },
        },
      } = await context.queryMiddleware<Ensured<QueryOld, 'legs'>>(instructionsByDidQuery(did));

      return instructionsResult.map(({ instruction }) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        oldMiddlewareInstructionToHistoricInstruction(instruction!, context)
      );
    }
    // Dual version support end

    const {
      data: {
        instructionParties: { nodes: instructionsResult },
      },
    } = await context.queryMiddleware<Ensured<Query, 'instructionParties'>>(
      instructionPartiesQuery(did)
    );

    return instructionsResult.map(({ instruction }) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      middlewareInstructionToHistoricInstruction(instruction!, context)
    );
  }

  /**
   * Returns the list of all child identities
   *
   * @note this query can be potentially **SLOW** depending on the number of parent Identities present on the chain
   */
  public async getChildIdentities(): Promise<ChildIdentity[]> {
    const {
      context: {
        polymeshApi: {
          query: { identity },
        },
      },
      context,
      did,
    } = this;

    const rawEntries = await identity.parentDid.entries();

    return rawEntries
      .filter(([, rawParentDid]) => identityIdToString(rawParentDid.unwrapOrDefault()) === did)
      .map(
        ([
          {
            args: [rawChildDid],
          },
        ]) => new ChildIdentity({ did: identityIdToString(rawChildDid) }, context)
      );
  }

  /**
   * Unlinks a child identity
   *
   * @throws if
   *  - the `child` is not a child of this identity
   *  - the transaction signer is not the primary key of the parent identity
   */
  public unlinkChild: ProcedureMethod<UnlinkChildParams, void>;

  /**
   * Check whether this Identity is a child Identity
   */
  public async isChild(): Promise<boolean> {
    const { did, context } = this;

    const childIdentity = new ChildIdentity({ did }, context);

    return childIdentity.exists();
  }

  /**
   * Returns a list of all assets this Identity has pre-approved. These assets will not require affirmation when being received in settlements
   */
  public async preApprovedAssets(paginationOpts?: PaginationOptions): Promise<ResultSet<Asset>> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { asset },
        },
        isV6,
      },
    } = this;

    const rawDid = stringToIdentityId(this.did, context);

    let preApprovedStorage = asset.preApprovedAsset;
    if (isV6) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      preApprovedStorage = (asset as any).preApprovedTicker;
    }

    const { entries, lastKey: next } = await requestPaginated(preApprovedStorage, {
      arg: rawDid,
      paginationOpts,
    });

    const data = await Promise.all(
      entries.map(([storageKey]) => {
        const {
          args: [, rawAssetId],
        } = storageKey;
        const assetId = meshAssetToAssetId(rawAssetId, context);

        return asAsset(assetId, context);
      })
    );

    return { data, next };
  }

  /**
   * Returns whether or not this Identity has pre-approved a particular asset
   */
  public async isAssetPreApproved(asset: BaseAsset | string): Promise<boolean> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { asset: assetQuery },
        },
        isV6,
      },
    } = this;

    let preApprovedStorage = assetQuery.preApprovedAsset;
    if (isV6) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      preApprovedStorage = (asset as any).preApprovedTicker;
    }

    const baseAsset = await asBaseAsset(asset, context);
    const rawAssetId = assetToMeshAssetId(baseAsset, context);

    const rawDid = stringToIdentityId(this.did, context);

    const rawIsApproved = await preApprovedStorage(rawDid, rawAssetId);

    return boolToBoolean(rawIsApproved);
  }

  /**
   * Returns the list of MultiSig accounts linked with this Identity along with the signatories
   *
   * @note this query can be potentially **SLOW** depending on the number of MultiSigs present on the chain
   */
  public async getMultiSigSigners(): Promise<MultiSigSigners[]> {
    const {
      context,
      context: {
        polymeshApi: {
          query: {
            multiSig: { multiSigToIdentity, multiSigSigners },
          },
        },
      },
      did,
    } = this;

    const entries = await multiSigToIdentity.entries();

    const multiSigs: Record<string, Signer[]> = {};

    const rawSigners = await Promise.all(
      entries
        .filter(([, rawIdentityId]) => {
          const identity = identityIdToString(rawIdentityId);
          return identity === did;
        })
        .map(
          ([
            {
              args: [rawMultiSigAccount],
            },
          ]) => {
            const multiSigAccount = accountIdToString(rawMultiSigAccount);
            multiSigs[multiSigAccount] = [];
            return multiSigSigners.entries(rawMultiSigAccount);
          }
        )
    );

    rawSigners.forEach(rawSigner => {
      rawSigner.forEach(
        ([
          {
            args: [rawMultiSigAccount, signatory],
          },
        ]) => {
          const multiSigAccount = accountIdToString(rawMultiSigAccount);
          multiSigs[multiSigAccount].push(
            signerValueToSigner(signatoryToSignerValue(signatory), context)
          );
        }
      );
    });

    return Object.keys(multiSigs).map(multiSig => ({
      signerFor: new MultiSig({ address: multiSig }, context),
      signers: multiSigs[multiSig],
    }));
  }

  /**
   * Returns the off chain authorization nonce for this Identity
   */
  public async getOffChainAuthorizationNonce(): Promise<BigNumber> {
    const {
      context,
      context: {
        polymeshApi: {
          query: {
            identity: { offChainAuthorizationNonce },
          },
        },
      },
      did,
    } = this;

    const rawDid = stringToIdentityId(did, context);

    const rawNonce = await offChainAuthorizationNonce(rawDid);

    return u64ToBigNumber(rawNonce);
  }

  /**
   * Returns next assetID that will be generated for this Identity
   */
  public async getNextAssetId(): Promise<string> {
    const {
      context: {
        polymeshApi: {
          query: {
            asset: { rngNonce },
          },
        },
      },
      context,
      did,
    } = this;

    const rawDid = stringToIdentityId(did, context);
    const rawNonce = await rngNonce(rawDid);

    const prefix = stringToHex(ASSET_ID_PREFIX);

    const assetComponents = [prefix, did, rawNonce.toHex(true)];

    const data = hexAddPrefix(assetComponents.map(e => hexStripPrefix(e)).join(''));

    return blake2AsHex(data, 128);
  }
}
