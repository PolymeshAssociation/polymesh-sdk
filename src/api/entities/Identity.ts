import { BigNumber } from 'bignumber.js';

import { Entity } from '~/base';
import { Context } from '~/context';
import { balanceToBigNumber } from '~/utils';

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

  /**
   * Create an Identity entity
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { did } = identifiers;

    this.did = did;
  }

  /**
   * Retrieve the POLY balance of this particular Identity
   */
  public getIdentityBalance = async (): Promise<BigNumber> => {
    const { context, did } = this;
    const balance = await context.polymeshApi.query.balances.identityBalance(did);

    return balanceToBigNumber(balance);
  };
}
