import { BigNumber } from 'bignumber.js';
import { CddStatus, DidRecord } from 'polymesh-types/types';

import { SecurityToken } from '~/api/entities/SecurityToken';
import { TickerReservation } from '~/api/entities/TickerReservation';
import { Entity, PolymeshError } from '~/base';
import { Context } from '~/context';
import {
  ErrorCode,
  isCddProviderRole,
  isTickerOwnerRole,
  isTokenOwnerRole,
  Role,
  SubCallback,
  UnsubCallback,
} from '~/types';
import {
  accountKeyToString,
  balanceToBigNumber,
  cddStatusToBoolean,
  identityIdToString,
  stringToIdentityId,
  stringToTicker,
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

  // TODO: uncomment for v2
  // public getPolyXBalance(): Promise<BigNumber>;
  // public getPolyXBalance(callback: SubCallback<BigNumber>): Promise<UnsubCallback>;

  // /**
  //  * Retrieve the POLYX balance of this particular Identity
  //  *
  //  * @note can be subscribed to
  //  */
  // public async getPolyXBalance(
  //   callback?: SubCallback<BigNumber>
  // ): Promise<BigNumber | UnsubCallback> {
  //   const {
  //     did,
  //     context,
  //     context: {
  //       polymeshApi: {
  //         query: { balances },
  //       },
  //     },
  //   } = this;

  //   const rawIdentityId = stringToIdentityId(did, context);

  //   if (callback) {
  //     return balances.identityBalance(rawIdentityId, res => {
  //       callback(balanceToBigNumber(res));
  //     });
  //   }

  //   const balance = await balances.identityBalance(rawIdentityId);

  //   return balanceToBigNumber(balance);
  // }

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

  public getTokenBalance(args: { ticker: string }): Promise<BigNumber>;
  public getTokenBalance(
    args: { ticker: string },
    callback: SubCallback<BigNumber>
  ): Promise<UnsubCallback>;

  /**
   * Retrieve the balance of a particular Security Token
   *
   * @note can be subscribed to
   */
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

    const { did } = context.getCurrentIdentity();

    const assembleResult = ({ master_key: masterKey }: DidRecord): string => {
      return accountKeyToString(masterKey);
    };

    if (callback) {
      return identity.didRecords(did, records => callback(assembleResult(records)));
    }

    const didRecords = await identity.didRecords(did);
    return assembleResult(didRecords);
  }

  /**
   * Check whether this Identity possesses all specified roles
   */
  public async hasRoles(roles: Role[]): Promise<boolean> {
    const checkedRoles = await Promise.all(roles.map(this.hasRole.bind(this)));

    return checkedRoles.every(hasRole => hasRole);
  }
}
