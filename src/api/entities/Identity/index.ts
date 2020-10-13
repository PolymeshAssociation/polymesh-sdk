import { u64 } from '@polkadot/types';
import { BigNumber } from 'bignumber.js';
import { CddStatus, DidRecord } from 'polymesh-types/types';

import { Entity, SecurityToken, TickerReservation, Venue } from '~/api/entities';
import { Context, PolymeshError } from '~/base';
import { tokensByTrustedClaimIssuer, tokensHeldByDid } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  Ensured,
  ErrorCode,
  isCddProviderRole,
  isTickerOwnerRole,
  isTokenOwnerRole,
  isVenueOwnerRole,
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
  u64ToBigNumber,
} from '~/utils';

import { IdentityAuthorizations } from './IdentityAuthorizations';

/**
 * Properties that uniquely identify an Identity
 */
export interface UniqueIdentifiers {
  did: string;
}

/**
 * Represents an Identity in the Polymesh blockchain
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
  public authorizations: IdentityAuthorizations;

  /**
   * Create an Identity entity
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { did } = identifiers;

    this.did = did;
    this.authorizations = new IdentityAuthorizations(this, context);
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
    } else if (isVenueOwnerRole(role)) {
      const venue = new Venue({ id: role.venueId }, context);

      const { owner } = await venue.details();

      return owner.did === did;
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
}
