import { Balance } from '@polymathnetwork/polkadot/types/interfaces';

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
  public getPolyBalance = async (): Promise<Balance> => {
    const { context, did } = this;
    // TODO MSDK-48 - Create an human readable value conversion
    return context.polymeshApi.query.balances.identityBalance(did);
  };
}
