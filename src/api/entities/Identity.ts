import { BigNumber } from 'bignumber.js';

import { Entity } from '~/base';
import { Context } from '~/context';

/**
 * Properties that uniquely identify an Identity
 */
export interface UniqueIdentifiers {
  did: string;
}

/**
 * Constructor parameters
 */
export type Params = UniqueIdentifiers;

/**
 * Used to manage an Identity
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
   * Identity ID as stored in the blockchain
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
    // TODO remove this line when MSDK-29 is done
    const balance = await context.polymeshApi.query.balances.identityBalance(did);
    const result = new BigNumber(balance.toString());
    return result;
  };
}
