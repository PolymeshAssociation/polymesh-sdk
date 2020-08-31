import { BigNumber } from 'bignumber.js';
import { CddStatus, DidRecord } from 'polymesh-types/types';

import { SecurityToken } from '~/api/entities/SecurityToken';
import { TickerReservation } from '~/api/entities/TickerReservation';
import { Entity, PolymeshError } from '~/base';
import { Context } from '~/context';
import {
  issuerDidsWithClaimsByTarget,
  scopesByIdentity,
  tokensByTrustedClaimIssuer,
  tokensHeldByDid,
} from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  ClaimData,
  ClaimScope,
  ClaimType,
  Ensured,
  ErrorCode,
  IdentityWithClaims,
  isCddProviderRole,
  isTickerOwnerRole,
  isTokenOwnerRole,
  Order,
  ResultSet,
  Role,
  SubCallback,
  UnsubCallback,
} from '~/types';
import {
  accountIdToString,
  balanceToBigNumber,
  calculateNextKey,
  cddStatusToBoolean,
  identityIdToString,
  removePadding,
  stringToIdentityId,
  stringToTicker,
  toIdentityWithClaimsArray,
  valueToDid,
} from '~/utils';

import { Authorizations } from './Authorizations';

/**
 * Properties that uniquely identify an Identity
 */
export interface UniqueIdentifiers {
  did: string;
}

/**
 * Represents an identity in the Polymesh blockchain
 */
export class Identity extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Checks if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: object): identifier is UniqueIdentifiers {
    const { did } = identifier as UniqueIdentifiers;

    return typeof did === 'string';
  }

  /**
   * identity ID as stored in the blockchain
   */
  public did: string;

  // Namespaces
  public authorizations: Authorizations;

  /**
   * Create an Identity entity
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { did } = identifiers;

    this.did = did;
    this.authorizations = new Authorizations(this, context);
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
    } else if (isTokenOwnerRole(role)) {
      const { ticker } = role;

      const token = new SecurityToken({ ticker }, context);
      const { owner } = await token.details();

      return owner.did === did;
    } else if (isCddProviderRole(role)) {
      const {
        polymeshApi: {
          query: { cddServiceProviders },
        },
      } = context;

      const activeMembers = await cddServiceProviders.activeMembers();
      const memberDids = activeMembers.map(identityIdToString);

      return memberDids.includes(did);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: CddStatus = await (rpc as any).identity.isIdentityHasValidCdd(identityId);
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
   * Check whether this Identity is a cdd provider
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
   * Retrieve the master key associated with the identity
   *
   * @note can be subscribed to
   */
  public async getMasterKey(): Promise<string>;
  public async getMasterKey(callback: SubCallback<string>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getMasterKey(callback?: SubCallback<string>): Promise<string | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { identity },
        },
      },
      context,
    } = this;

    const { did } = await context.getCurrentIdentity();

    const assembleResult = ({ master_key: masterKey }: DidRecord): string => {
      return accountIdToString(masterKey);
    };

    const rawDid = stringToIdentityId(did, context);

    if (callback) {
      return identity.didRecords(rawDid, records => callback(assembleResult(records)));
    }

    const didRecords = await identity.didRecords(rawDid);
    return assembleResult(didRecords);
  }

  /**
   * Retrieve the list of cdd claims for the current identity
   *
   * @param opts.size - page size
   * @param opts.start - page offset
   */
  public async getCddClaims(
    opts: {
      size?: number;
      start?: number;
    } = {}
  ): Promise<ResultSet<ClaimData>> {
    const { context, did } = this;

    const { size, start } = opts;

    const result = await context.issuedClaims({
      targets: [did],
      claimTypes: [ClaimType.CustomerDueDiligence],
      includeExpired: true,
      size,
      start,
    });

    return result;
  }

  /**
   * Retrieve all scopes in which claims have been made for this identity.
   *   If the scope is an asset DID, the corresponding ticker is returned as well
   *
   * @note a null scope means the identity has scopeless claims (like CDD for example)
   */
  public async getClaimScopes(): Promise<ClaimScope[]> {
    const { context, did } = this;

    const {
      data: { scopesByIdentity: scopes },
    } = await context.queryMiddleware<Ensured<Query, 'scopesByIdentity'>>(
      scopesByIdentity({ did })
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return scopes.map(({ scope, ticker: symbol }) => {
      let ticker: string | undefined;

      if (symbol) {
        ticker = removePadding(symbol);
      }

      return {
        scope: scope ?? null,
        ticker,
      };
    });
  }

  /**
   * Retrieve a list of all tokens which were held at one point by this identity
   *
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
   * Get the list of tokens for which this identity is a trusted claim issuer
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
   * Retrieve all claims issued about this identity, grouped by claim issuer
   *
   * @param opts.includeExpired - whether to include expired claims. Defaults to true
   *
   * @note supports pagination
   */
  public async getClaims(
    opts: {
      scope?: string;
      trustedClaimIssuers?: (string | Identity)[];
      includeExpired?: boolean;
      size?: number;
      start?: number;
    } = { includeExpired: true }
  ): Promise<ResultSet<IdentityWithClaims>> {
    const { context, did } = this;

    const { trustedClaimIssuers, scope, includeExpired, size, start } = opts;

    const result = await context.queryMiddleware<Ensured<Query, 'issuerDidsWithClaimsByTarget'>>(
      issuerDidsWithClaimsByTarget({
        target: did,
        scope,
        trustedClaimIssuers: trustedClaimIssuers?.map(trustedClaimIssuer =>
          valueToDid(trustedClaimIssuer)
        ),
        includeExpired,
        count: size,
        skip: start,
      })
    );

    const {
      data: {
        issuerDidsWithClaimsByTarget: {
          items: issuerDidsWithClaimsByTargetList,
          totalCount: count,
        },
      },
    } = result;

    const data = toIdentityWithClaimsArray(issuerDidsWithClaimsByTargetList, context);

    const next = calculateNextKey(count, size, start);

    return {
      data,
      next,
      count,
    };
  }
}
