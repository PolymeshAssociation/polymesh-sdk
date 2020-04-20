import { BigNumber } from 'bignumber.js';

import { SecurityToken } from '~/api/entities/SecurityToken';
import { TickerReservation } from '~/api/entities/TickerReservation';
import { Entity, PolymeshError } from '~/base';
import { Context } from '~/context';
import { ErrorCode, isTickerOwnerRole, isTokenOwnerRole, Role } from '~/types';
import { balanceToBigNumber, stringToIdentityId, stringToTicker } from '~/utils';

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
   * Retrieve the POLYX balance of this particular Identity
   */
  public async getPolyXBalance(): Promise<BigNumber> {
    const {
      did,
      context: {
        polymeshApi: {
          query: { balances },
        },
      },
    } = this;
    const balance = await balances.identityBalance(did);

    return balanceToBigNumber(balance);
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
    }

    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      message: `Unrecognized role "${JSON.stringify(role)}"`,
    });
  }

  /**
   * Retrieve the balance of a particular Security Token
   */
  public async getTokenBalance(ticker: string): Promise<BigNumber> {
    const {
      did,
      context,
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
    } = this;

    const balance = await asset.balanceOf(
      stringToTicker(ticker, context),
      stringToIdentityId(did, context)
    );
    return balanceToBigNumber(balance);
  }

  /**
   * Check whether this Identity possesses all specified roles
   */
  public async hasRoles(roles: Role[]): Promise<boolean> {
    const checkedRoles = await Promise.all(roles.map(this.hasRole.bind(this)));

    return checkedRoles.every(hasRole => hasRole);
  }
}
