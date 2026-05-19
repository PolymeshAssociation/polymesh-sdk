import { Option, StorageKey, u64, Vec } from '@polkadot/types';
import { AccountId32 } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesIdentityDidRecord,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { chunk, differenceWith, flatten, intersectionWith, uniqBy } from 'lodash';

import { AssetPermissions } from '~/api/entities/Identity/AssetPermissions';
import { IdentityAuthorizations } from '~/api/entities/Identity/IdentityAuthorizations';
import { Portfolios } from '~/api/entities/Identity/Portfolios';
import { unlinkChildIdentity } from '~/api/procedures/unlinkChildIdentity';
import { assertAssetHolderExists } from '~/api/procedures/utils';
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
  setMandatoryReceiverAffirmation,
  TickerReservation,
  Venue,
} from '~/internal';
import { assetHoldersQuery, nftHoldersQuery } from '~/middleware/queries/assets';
import { trustingAssetsQuery } from '~/middleware/queries/claims';
import { historicalInstructionsQuery } from '~/middleware/queries/settlements';
import { AssetHoldersOrderBy, NftHoldersOrderBy, Query } from '~/middleware/types';
import {
  Asset,
  CheckRolesResult,
  DefaultPortfolio,
  DistributionWithDetails,
  ErrorCode,
  GroupedInstructions,
  GroupedInvolvedInstructions,
  HeldNfts,
  HistoricalInstructionFilters,
  HistoricInstruction,
  InstructionsByStatus,
  MultiSigSigners,
  NumberedPortfolio,
  PaginationOptions,
  PermissionedAccount,
  ProcedureMethod,
  ReceiverAffirmationRequirement,
  ResultSet,
  Role,
  SubCallback,
  UnlinkChildParams,
  UnsubCallback,
} from '~/types';
import { Ensured, tuple } from '~/types/utils';
import {
  isCddProviderRole,
  isDidRegistrarRole,
  isIdentityRole,
  isPortfolioCustodianRole,
  isTickerOwnerRole,
  isVenueOwnerRole,
} from '~/utils';
import { MAX_CONCURRENT_REQUESTS, MAX_PAGE_SIZE } from '~/utils/constants';
import {
  accountIdToString,
  assetHolderIdToMeshAssetHolder,
  assetHolderLikeToAssetHolderId,
  assetIdToString,
  assetToMeshAssetId,
  balanceToBigNumber,
  boolToBoolean,
  cddStatusToBoolean,
  corporateActionIdentifierToCaId,
  identityIdToString,
  middlewareInstructionToHistoricInstruction,
  portfolioIdToPortfolio,
  stringToAccountId,
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
  getAssetIdFromMiddleware,
  getSecondaryAccountPermissions,
  requestPaginated,
} from '~/utils/internal';

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

    this.setMandatoryReceiverAffirmation = createProcedureMethod(
      {
        getProcedureAndArgs: args => [setMandatoryReceiverAffirmation, { ...args, did: this.did }],
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
    } else if (isCddProviderRole(role) || isDidRegistrarRole(role)) {
      const {
        polymeshApi: { query },
      } = context;

      const activeMembersStorage = context.isV7
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (query as any).cddServiceProviders.activeMembers
        : query.didRegistrars.activeMembers;

      const rawMembers: Vec<PolymeshPrimitivesIdentityId> = await activeMembersStorage();
      const memberDids = rawMembers.map(identityIdToString);

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
   * Retrieve the balance of a particular Asset by ticker
   *
   * @param args.ticker - Asset ticker
   *
   * @returns Promise that resolves to the Asset balance
   */
  public getAssetBalance(args: { ticker: string }): Promise<BigNumber>;

  /**
   * Retrieve the balance of a particular Asset by Asset ID
   *
   * @param args.assetId - Asset identifier
   *
   * @returns Promise that resolves to the Asset balance
   */
  public getAssetBalance(args: { assetId: string }): Promise<BigNumber>;

  /**
   * Retrieve the balance of a particular Asset by ticker (with subscription support)
   *
   * @param args.ticker - Asset ticker
   * @param callback - Callback function that receives balance updates
   *
   * @returns Promise that resolves to an unsubscribe function
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
  public getAssetBalance(
    args: { ticker: string },
    callback: SubCallback<BigNumber>
  ): Promise<UnsubCallback>;

  /**
   * Retrieve the balance of a particular Asset by Asset ID (with subscription support)
   *
   * @param args.assetId - Asset identifier
   * @param callback - Callback function that receives balance updates
   *
   * @returns Promise that resolves to an unsubscribe function
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
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
      },
    } = this;
    const { ticker, assetId } = args;

    const baseAsset = await asBaseAsset((assetId ?? ticker)!, context);
    const rawAssetId = assetToMeshAssetId(baseAsset, context);
    const rawIdentityId = stringToIdentityId(did, context);

    const meshAsset = await asset.assets(rawAssetId);

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
   *
   * @deprecated CDD claims are discontinued from chain v8. If invoked with a v8 chain, this returns true if DID exists
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

    if (!context.isV7) {
      return this.exists();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (call.identityApi as any).isIdentityHasValidCdd(identityId, null);
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
        polymeshApi: { query },
      },
      context,
      did,
    } = this;

    const activeMembersStorage = context.isV7
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (query as any).cddServiceProviders.activeMembers
      : query.didRegistrars.activeMembers;

    const activeMembers = await activeMembersStorage();
    return activeMembers.map(identityIdToString).includes(did);
  }

  /**
   * Retrieve the primary Account associated with the Identity
   *
   * @returns Promise that resolves to the primary Account information
   */
  public async getPrimaryAccount(): Promise<PermissionedAccount>;

  /**
   * Retrieve the primary Account associated with the Identity (with subscription support)
   *
   * @param callback - Callback function that receives primary Account updates
   *
   * @returns Promise that resolves to an unsubscribe function
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
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
      start?: BigNumber | undefined;
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
        context.isSqIdPadded,
        {
          identityId: did,
        },
        size,
        start,
        order
      )
    );
    const count = new BigNumber(totalCount);

    const data = nodes.map(
      ({ asset }) => new FungibleAsset({ assetId: getAssetIdFromMiddleware(asset!.id) }, context)
    );

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
        context.isSqIdPadded,
        {
          identityId: did,
        },
        size,
        start,
        order
      )
    );

    const count = new BigNumber(totalCount);

    const data = nodes.map(({ asset, nftIds }) => {
      const assetId = getAssetIdFromMiddleware(asset!.id);
      const collection = new NftCollection({ assetId }, context);
      const nfts = nftIds.map(
        (id: number) =>
          new Nft(
            {
              assetId,
              id: new BigNumber(id),
            },
            context
          )
      );

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
    const roleChecks = await Promise.all(
      roles.map(async role => {
        const hasRole = await this.hasRole(role);
        return { role, hasRole };
      })
    );
    const missingRoles = roleChecks.filter(r => !r.hasRole).map(r => r.role);

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

    return nodes.map(
      ({ asset }) => new FungibleAsset({ assetId: getAssetIdFromMiddleware(asset!.id) }, context)
    );
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
   * Retrieve all Instructions where this Identity is either the custodian of one or more portfolios in the legs or owns one or more accounts in the legs,
   *   grouped by status
   */
  public async getInstructions(): Promise<GroupedInstructions> {
    const { did, portfolios } = this;

    const [ownedPortfolios, primaryAccount, secondaryPermissionedAccounts] = await Promise.all([
      portfolios.getPortfolios(),
      this.getPrimaryAccount(),
      this.getSecondaryAccounts(),
    ]);

    const ownedPortfolioChecks = await Promise.all(
      ownedPortfolios.map(async portfolio => {
        const isCustodied = await portfolio.isCustodiedBy({ identity: did });
        return { portfolio, isCustodied };
      })
    );
    const filteredOwnedPortfolios = ownedPortfolioChecks
      .filter(r => r.isCustodied)
      .map(r => r.portfolio);
    const [ownedCustodiedPortfolios, { data: custodiedPortfolios }] = await Promise.all([
      filteredOwnedPortfolios,
      this.portfolios.getCustodiedPortfolios(),
    ]);

    const secondaryAccounts = secondaryPermissionedAccounts.data.map(({ account }) => account);

    const allHolders = [
      ...ownedCustodiedPortfolios,
      ...custodiedPortfolios,
      primaryAccount.account,
      ...secondaryAccounts,
    ];

    const { affirmed, pending, failed } = await this.assembleGroupedInstructions(allHolders);

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
    accountHolders: (DefaultPortfolio | NumberedPortfolio | Account)[]
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

    const accountHolderIds = accountHolders.map(assetHolderLikeToAssetHolderId);

    await Promise.all(
      accountHolderIds.map(accountHolderId => assertAssetHolderExists(accountHolderId, context))
    );

    const accountHolderIdChunks = chunk(accountHolderIds, MAX_CONCURRENT_REQUESTS);

    for (const accountHolderIdChunk of accountHolderIdChunks) {
      const auths = await Promise.all(
        accountHolderIdChunk.map(async accountHolderId =>
          settlement.userAffirmations.entries(
            await assetHolderIdToMeshAssetHolder(accountHolderId, context)
          )
        )
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
        const status = instructionStatuses[index]!;

        if (status.isFailed) {
          failed.push(instruction);
        } else if (affirmationStatus.isAffirmed) {
          affirmed.push(instruction);
        } else if (status.isPending) {
          pending.push(instruction);
        }
      });
    }

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

    const [
      allPortfolios,
      { data: custodiedPortfolios },
      primaryAccount,
      { data: secondaryPermissionedAccounts },
    ] = await Promise.all([
      portfolios.getPortfolios(),
      portfolios.getCustodiedPortfolios(),
      this.getPrimaryAccount(),
      this.getSecondaryAccounts(),
    ]);

    const ownedPortfolios: (DefaultPortfolio | NumberedPortfolio)[] = [];
    const ownedCustodiedPortfolios: (DefaultPortfolio | NumberedPortfolio)[] = [];
    const custodies = await Promise.all(
      allPortfolios.map(portfolio => portfolio.isCustodiedBy({ identity: did }))
    );

    custodies.forEach((custody, index) => {
      const portfolio = allPortfolios[index]!;

      if (custody) {
        ownedCustodiedPortfolios.push(portfolio);
      } else {
        ownedPortfolios.push(portfolio);
      }
    });

    const secondaryAccounts = secondaryPermissionedAccounts.map(({ account }) => account);

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
      this.assembleGroupedInstructions([
        ...ownedPortfolios,
        primaryAccount.account,
        ...secondaryAccounts,
      ]),
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
   * @returns Promise that resolves to true if secondary accounts are frozen, false otherwise
   */
  public areSecondaryAccountsFrozen(): Promise<boolean>;

  /**
   * Check whether secondary Accounts are frozen (with subscription support)
   *
   * @param callback - Callback function that receives frozen status updates
   *
   * @returns Promise that resolves to an unsubscribe function
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
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
      const { data, next } = await this.getHeldAssets({
        size: MAX_PAGE_SIZE,
        start,
      });
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
    const distributionChecks = await Promise.all(
      distributions.map(async ({ distribution }) => {
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
      })
    );
    return distributions.filter((_, i) => distributionChecks[i]);
  }

  /**
   * Get the list of secondary Accounts related to the Identity
   *
   * @param paginationOpts - Options for pagination
   *
   * @returns Promise that resolves to a paginated result of secondary accounts
   *
   * @note supports pagination
   */
  public async getSecondaryAccounts(
    paginationOpts?: PaginationOptions
  ): Promise<ResultSet<PermissionedAccount>>;

  /**
   * Get the list of secondary Accounts related to the Identity (with subscription support)
   *
   * @param callback - Callback function that receives secondary account updates
   *
   * @returns Promise that resolves to an unsubscribe function
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
  public async getSecondaryAccounts(
    callback: SubCallback<PermissionedAccount[]>
  ): Promise<UnsubCallback>;

  /**
   * Get the list of secondary Accounts related to the Identity (with pagination and subscription support)
   *
   * @param paginationOpts - Options for pagination
   * @param callback - Callback function that receives secondary account updates
   *
   * @returns Promise that resolves to an unsubscribe function
   *
   * @note supports pagination
   * @note can be subscribed to, if connected to node using a web socket
   */
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
   * @note supports pagination
   *
   */
  public async getHistoricalInstructions(
    filter?: Omit<HistoricalInstructionFilters, 'identity'>
  ): Promise<ResultSet<HistoricInstruction>> {
    const { context, did } = this;

    const query = await historicalInstructionsQuery({ ...filter, identity: did }, context);

    const {
      data: {
        instructions: { nodes: instructionsResult, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'instructions'>>(query);

    const count = new BigNumber(totalCount);
    const next = calculateNextKey(count, instructionsResult.length, filter?.start);

    return {
      data: instructionsResult.map(instruction =>
        middlewareInstructionToHistoricInstruction(instruction, context)
      ),
      next,
      count,
    };
  }

  /**
   * Returns the list of all child identities
   *
   * @note this query can be potentially **SLOW** depending on the number of parent Identities present on the chain
   *
   * @deprecated Child identites are no longer supported in chain v8
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

    if (!context.isV7) {
      throw new PolymeshError({
        code: ErrorCode.NotSupported,
        message: 'getChildIdentities is not supported in v8',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawEntries: any[] = await (identity as any).parentDid.entries();

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
  public isChild(): Promise<boolean> {
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
      },
    } = this;

    const rawDid = stringToIdentityId(this.did, context);

    const { entries, lastKey: next } = await requestPaginated(asset.preApprovedAsset, {
      arg: rawDid,
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
   * Returns whether or not this Identity has pre-approved a particular asset
   */
  public async isAssetPreApproved(asset: BaseAsset | string): Promise<boolean> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { asset: assetQuery },
        },
      },
    } = this;

    const baseAsset = await asBaseAsset(asset, context);
    const rawAssetId = assetToMeshAssetId(baseAsset, context);

    const rawDid = stringToIdentityId(this.did, context);

    const rawIsApproved = await assetQuery.preApprovedAsset(rawDid, rawAssetId);

    return boolToBoolean(rawIsApproved);
  }

  /**
   * Returns whether or not this Identity has opted in to mandatory receiver affirmation.
   * When `true`, the identity must explicitly affirm incoming asset transfer in settlements
   * unless an asset level or portfolio level exemption applies.
   */
  public async isMandatoryReceiverAffirmationEnabled(): Promise<boolean> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
    } = this;

    const rawDid = stringToIdentityId(this.did, context);

    const rawValue = await settlement.mandatoryReceiverAffirmation(rawDid);

    return boolToBoolean(rawValue);
  }

  /**
   * Enable or disable mandatory receiver affirmation for incoming settlement transfers.
   * When enabled (`ReceiverAffirmationRequirement.Required`), the signing identity must explicitly affirm
   * any incoming asset transfer unless an asset level or portfolio level exemption applies.
   * When disabled (`ReceiverAffirmationRequirement.Automatic`), all incoming transfers are auto-affirmed.
   */
  public setMandatoryReceiverAffirmation: ProcedureMethod<
    { requirement: ReceiverAffirmationRequirement },
    void
  >;

  /**
   * Returns the list of MultiSig accounts along with their signatories this identity has responsibility for.
   * The roles possible are:
   * - Admin: The identity is able to unilaterally modify the MultiSig properties, such as the signers and signatures required for a proposal
   * - Payer: The identity's primary key will be deducted any POLYX fees the MultiSig may incur
   *
   * @note this query can be potentially **SLOW** depending on the number of MultiSigs present on the chain
   */
  public async getMultiSigSigners(): Promise<MultiSigSigners[]> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
      did,
    } = this;

    type Entry = [{ args: [AccountId32] }, Option<PolymeshPrimitivesIdentityId>];
    const rawAdmins = await query.multiSig.adminDid.entries();

    const adminForMultiSigs = rawAdmins
      .filter(([, rawIdentityId]: Entry) => {
        const identity = identityIdToString(rawIdentityId.unwrap());
        return identity === did;
      })
      .map(
        ([
          {
            args: [rawMultiSigAccount],
          },
        ]) => {
          return accountIdToString(rawMultiSigAccount);
        }
      );

    const rawPayers = await query.multiSig.payingDid.entries();
    const payerForMultiSigs = rawPayers
      .filter(([, rawIdentityId]: Entry) => {
        const identity = identityIdToString(rawIdentityId.unwrap());
        return identity === did;
      })
      .map(
        ([
          {
            args: [rawMultiSigAccount],
          },
        ]) => {
          return accountIdToString(rawMultiSigAccount);
        }
      );

    const multiSigs = [...new Set([...adminForMultiSigs, ...payerForMultiSigs])].map(
      address => new MultiSig({ address }, context)
    );

    const signers = await Promise.all(
      multiSigs.map(async ({ address }) => {
        const rawAccountId = stringToAccountId(address, context);

        const rawSigners = await query.multiSig.multiSigSigners.entries(rawAccountId);

        return rawSigners.map(
          ([
            {
              args: [, rawAddress],
            },
          ]) => {
            const signerAddress = accountIdToString(rawAddress);

            return new Account({ address: signerAddress }, context);
          }
        );
      })
    );

    return multiSigs.map((multiSig, i) => ({
      signerFor: multiSig,
      signers: signers[i]!,
      isAdmin: adminForMultiSigs.some(address => address === multiSig.address),
      isPayer: payerForMultiSigs.some(address => address === multiSig.address),
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
}
