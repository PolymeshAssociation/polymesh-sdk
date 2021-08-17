import { u64 } from '@polkadot/types';
import { BigNumber } from 'bignumber.js';
import P from 'bluebird';
import { chunk, flatten, uniqBy } from 'lodash';
import {
  CddStatus,
  DidRecord,
  Instruction as MeshInstruction,
  ModuleName,
  TxTag,
  TxTags,
} from 'polymesh-types/types';

import { assertPortfolioExists } from '~/api/procedures/utils';
import {
  Context,
  Entity,
  Instruction,
  PolymeshError,
  SecurityToken,
  TickerReservation,
  Venue,
} from '~/internal';
import { tokensByTrustedClaimIssuer, tokensHeldByDid } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  DistributionWithDetails,
  Ensured,
  ErrorCode,
  GroupedInstructions,
  isCddProviderRole,
  isPortfolioCustodianRole,
  isTickerOwnerRole,
  isVenueOwnerRole,
  Order,
  PermissionType,
  ResultSet,
  Role,
  SecondaryKey,
  SubCallback,
  UnsubCallback,
} from '~/types';
import { tuple } from '~/types/utils';
import { MAX_CONCURRENT_REQUESTS, MAX_PAGE_SIZE } from '~/utils/constants';
import {
  accountIdToString,
  balanceToBigNumber,
  boolToBoolean,
  cddStatusToBoolean,
  corporateActionIdentifierToCaId,
  extrinsicPermissionsToTransactionPermissions,
  identityIdToString,
  meshPermissionsToPermissions,
  portfolioIdToMeshPortfolioId,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
  scopeIdToString,
  signatoryToSignerValue,
  signerValueToSigner,
  stringToIdentityId,
  stringToTicker,
  u64ToBigNumber,
} from '~/utils/conversion';
import { calculateNextKey, getTicker, isModuleOrTagMatch, removePadding } from '~/utils/internal';

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
   * Checks if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { did } = identifier as UniqueIdentifiers;

    return typeof did === 'string';
  }

  /**
   * identity ID as stored in the blockchain
   */
  public did: string;

  // Namespaces
  public authorizations: IdentityAuthorizations;
  public portfolios: Portfolios;

  /**
   * Create an Identity entity
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { did } = identifiers;

    this.did = did;
    this.authorizations = new IdentityAuthorizations(this, context);
    this.portfolios = new Portfolios(this, context);
  }

  /**
   * Check whether this Identity has specific transaction Permissions over a Security Token
   */
  public async hasTokenPermissions(args: {
    token: SecurityToken | string;
    transactions: TxTag[] | null;
  }): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { externalAgents },
        },
      },
      context,
      did,
    } = this;
    const { token, transactions } = args;

    const ticker = getTicker(token);
    const rawTicker = stringToTicker(ticker, context);

    const groupOption = await externalAgents.groupOfAgent(
      rawTicker,
      stringToIdentityId(did, context)
    );

    if (groupOption.isNone) {
      return false;
    }

    const group = groupOption.unwrap();

    if (group.isFull) {
      return true;
    }

    if (transactions === null) {
      return false;
    }

    /*
     * Not authorized:
     *   - externalAgents
     *   - identity.acceptAuthorization
     */
    if (group.isExceptMeta) {
      return !transactions.some(
        tag =>
          tag.split('.')[0] === ModuleName.ExternalAgents ||
          tag === TxTags.identity.AcceptAuthorization
      );
    }

    /*
     * Authorized:
     *   - asset.issue
     *   - asset.redeem
     *   - asset.controllerTransfer
     *   - sto (except for sto.invest)
     */
    if (group.isPolymeshV1Pia) {
      return transactions.every(tag => {
        const isSto = tag.split('.')[0] === ModuleName.Sto && tag !== TxTags.sto.Invest;
        const isAsset = (<TxTag[]>[
          TxTags.asset.Issue,
          TxTags.asset.Redeem,
          TxTags.asset.ControllerTransfer,
        ]).includes(tag);

        return isSto || isAsset;
      });
    }

    /*
     * Authorized:
     *   - corporateAction
     *   - corporateBallot
     *   - capitalDistribution
     */
    if (group.isPolymeshV1Caa) {
      return transactions.every(tag =>
        [
          ModuleName.CorporateAction,
          ModuleName.CorporateBallot,
          ModuleName.CapitalDistribution,
        ].includes(tag.split('.')[0] as ModuleName)
      );
    }

    const groupId = group.asCustom;

    const groupPermissionsOption = await externalAgents.groupPermissions(rawTicker, groupId);

    const permissions = extrinsicPermissionsToTransactionPermissions(
      groupPermissionsOption.unwrap()
    );

    if (permissions === null) {
      return true;
    }

    const { type, exceptions, values } = permissions;

    /*
     * if type is include:
     *  all passed tags are in the values array AND are not in the exceptions array (isInValues && !isInExceptions)
     * if type is exclude:
     *  all passed tags are not in the values array OR are in the exceptions array (!isInValues || isInExceptions)
     */
    const isPresent = (tag: TxTag, flipResult: boolean) => {
      const isInValues = values.some(value => isModuleOrTagMatch(value, tag));
      const isInExceptions = !!exceptions?.includes(tag);

      const result = isInValues && !isInExceptions;

      return flipResult ? result : !result;
    };

    const isInclude = type === PermissionType.Include;

    return transactions.every(tag => isPresent(tag, isInclude));
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

      return owner?.did === did;
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

      return owner.did === did;
    } else if (isPortfolioCustodianRole(role)) {
      const { portfolioId } = role;

      const portfolio = portfolioIdToPortfolio(portfolioId, context);

      return portfolio.isCustodiedBy();
    }

    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `Unrecognized role "${JSON.stringify(role)}"`,
    });
  }

  /**
   * Retrieve the balance of a particular Security Token
   *
   * @note can be subscribed to
   */
  public getTokenBalance(args: { ticker: string }): Promise<BigNumber>;
  public getTokenBalance(
    args: { ticker: string },
    callback: SubCallback<BigNumber>
  ): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getTokenBalance(
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

    const token = await asset.tokens(rawTicker);

    if (token.owner_did.isEmpty) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: `There is no Security Token with ticker "${ticker}"`,
      });
    }

    if (callback) {
      return asset.balanceOf(rawTicker, rawIdentityId, res => {
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
    const result: CddStatus = await rpc.identity.isIdentityHasValidCdd(identityId);
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
   * Retrieve the primary key associated with the Identity
   *
   * @note can be subscribed to
   */
  public async getPrimaryKey(): Promise<string>;
  public async getPrimaryKey(callback: SubCallback<string>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getPrimaryKey(callback?: SubCallback<string>): Promise<string | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { identity },
        },
      },
      did,
      context,
    } = this;

    const assembleResult = ({ primary_key: primaryKey }: DidRecord): string => {
      return accountIdToString(primaryKey);
    };

    const rawDid = stringToIdentityId(did, context);

    if (callback) {
      return identity.didRecords(rawDid, records => callback(assembleResult(records)));
    }

    const didRecords = await identity.didRecords(rawDid);
    return assembleResult(didRecords);
  }

  /**
   * Retrieve a list of all tokens which were held at one point by this Identity
   *
   * @note uses the middleware
   * @note supports pagination
   */
  public async getHeldTokens(
    opts: {
      order?: Order;
      size?: number;
      start?: number;
    } = { order: Order.Asc }
  ): Promise<ResultSet<SecurityToken>> {
    const { context, did } = this;

    const { size, start, order } = opts;

    const result = await context.queryMiddleware<Ensured<Query, 'tokensHeldByDid'>>(
      tokensHeldByDid({
        did,
        count: size,
        skip: start,
        order,
      })
    );

    const {
      data: {
        tokensHeldByDid: { items: tokensHeldByDidList, totalCount: count },
      },
    } = result;

    const data = tokensHeldByDidList.map(ticker => new SecurityToken({ ticker }, context));

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
  public async hasRoles(roles: Role[]): Promise<boolean> {
    const checkedRoles = await Promise.all(roles.map(this.hasRole.bind(this)));

    return checkedRoles.every(hasRole => hasRole);
  }

  /**
   * Get the list of tokens for which this Identity is a trusted claim issuer
   *
   * @note uses the middleware
   */
  public async getTrustingTokens(
    args: { order: Order } = { order: Order.Asc }
  ): Promise<SecurityToken[]> {
    const { context, did } = this;

    const { order } = args;

    const {
      data: { tokensByTrustedClaimIssuer: tickers },
    } = await context.queryMiddleware<Ensured<Query, 'tokensByTrustedClaimIssuer'>>(
      tokensByTrustedClaimIssuer({ claimIssuerDid: did, order })
    );

    return tickers.map(ticker => new SecurityToken({ ticker: removePadding(ticker) }, context));
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
   * Retrieve the Scope ID associated to this Identity's Investor Uniqueness Claim for a specific Security Token
   *
   * @note more on Investor Uniqueness: https://developers.polymesh.live/confidential_identity
   */
  public async getScopeId(args: { token: SecurityToken | string }): Promise<string> {
    const { context, did } = this;
    const { token } = args;

    const ticker = getTicker(token);

    const scopeId = await context.polymeshApi.query.asset.scopeIdOf(
      stringToTicker(ticker, context),
      stringToIdentityId(did, context)
    );

    return scopeIdToString(scopeId);
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
    const rejected: Instruction[] = [];
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
      const instructions = await settlement.instructionDetails.multi<MeshInstruction>(
        uniqueEntries.map(({ id }) => id)
      );

      uniqueEntries.forEach(({ id, status }, index) => {
        const instruction = new Instruction({ id: u64ToBigNumber(id) }, context);

        if (instructions[index].status.isFailed) {
          failed.push(instruction);
        } else if (status.isAffirmed) {
          affirmed.push(instruction);
        } else if (status.isRejected) {
          rejected.push(instruction);
        } else if (status.isPending) {
          pending.push(instruction);
        }
      });
    });

    return {
      affirmed,
      rejected,
      pending,
      failed,
    };
  }

  /**
   * Retrieve all pending Instructions involving this Identity
   *
   * @deprecated in favor of `getInstructions`
   */
  public async getPendingInstructions(): Promise<Instruction[]> {
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

    const chunkedInstructions = await P.mapSeries(portfolioIdChunks, async portfolioIdChunk => {
      const auths = await P.map(portfolioIdChunk, portfolioId =>
        settlement.userAffirmations.entries(portfolioIdToMeshPortfolioId(portfolioId, context))
      );

      const instructionIds = uniqBy(
        flatten(auths).map(([key]) => key.args[1]),
        id => id.toNumber()
      );
      return settlement.instructionDetails.multi<MeshInstruction>(instructionIds);
    });

    const rawInstructions = flatten(chunkedInstructions);

    return rawInstructions
      .filter(({ status }) => status.isPending)
      .map(({ instruction_id: id }) => new Instruction({ id: u64ToBigNumber(id) }, context));
  }

  /**
   * Check whether secondary keys are frozen
   *
   * @note can be subscribed to
   */
  public areSecondaryKeysFrozen(): Promise<boolean>;
  public areSecondaryKeysFrozen(callback: SubCallback<boolean>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async areSecondaryKeysFrozen(
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
   * @note this query can be potentially **SLOW** depending on which Tokens this Identity has held
   */
  public async getPendingDistributions(): Promise<DistributionWithDetails[]> {
    const { context, did } = this;
    let tokens: SecurityToken[] = [];
    let allFetched = false;
    let start: number | undefined;

    while (!allFetched) {
      const { data, next } = await this.getHeldTokens({ size: MAX_PAGE_SIZE, start });
      start = (next as number) || undefined;
      allFetched = !next;
      tokens = [...tokens, ...data];
    }

    const distributions = await this.context.getDividendDistributionsForTokens({ tokens });

    const now = new Date();

    /*
     * We filter distributions out if:
     *   - They have expired
     *   - They have not begun
     *   - This Identity has already been paid
     */
    return P.filter(
      distributions,
      async ({ distribution }): Promise<boolean> => {
        const { expiryDate, ticker, id: localId, paymentDate } = distribution;

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
      }
    );
  }

  /**
   * Get the list of secondary keys related to the Identity
   *
   * @note can be subscribed to
   */
  public async getSecondaryKeys(): Promise<SecondaryKey[]>;
  public async getSecondaryKeys(callback: SubCallback<SecondaryKey[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getSecondaryKeys(
    callback?: SubCallback<SecondaryKey[]>
  ): Promise<SecondaryKey[] | UnsubCallback> {
    const {
      did,
      context,
      context: {
        polymeshApi: {
          query: { identity },
        },
      },
    } = this;

    const assembleResult = ({ secondary_keys: secondaryKeys }: DidRecord): SecondaryKey[] => {
      return secondaryKeys.map(({ signer: rawSigner, permissions }) => ({
        signer: signerValueToSigner(signatoryToSignerValue(rawSigner), context),
        permissions: meshPermissionsToPermissions(permissions, context),
      }));
    };

    if (callback) {
      return identity.didRecords(did, records => callback(assembleResult(records)));
    }

    const didRecords = await identity.didRecords(did);
    return assembleResult(didRecords);
  }

  /**
   * Return the Identity's DID
   */
  public toJson(): string {
    return this.did;
  }
}
