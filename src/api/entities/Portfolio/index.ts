import BigNumber from 'bignumber.js';

import { Entity, Identity } from '~/api/entities';
import { Context } from '~/base';

export interface UniqueIdentifiers {
  did: string;
  id?: BigNumber;
}

/**
 * Represents a base Portfolio for a specific Identity in the Polymesh blockchain
 */
export class Portfolio extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { did, id } = identifier as UniqueIdentifiers;

    return typeof did === 'string' && (id === undefined || id instanceof BigNumber);
  }

  /**
   * identity of the Portfolio's owner
   */
  public owner: Identity;

  /**
   * internal Portfolio identifier (unused for default Portfolio)
   */
  protected _id?: BigNumber;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { did, id } = identifiers;

    this.owner = new Identity({ did }, context);
    this._id = id;
  }

  /**
   * Return whether the current Identity is the portfolio owner
   */
  public async isOwned(): Promise<boolean> {
    const {
      owner: { did: ownerDid },
      context,
    } = this;

    const { did } = await context.getCurrentIdentity();

    return ownerDid === did;
  }
}
