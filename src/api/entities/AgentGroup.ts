import BigNumber from 'bignumber.js';

import { Context, Entity } from '~/internal';

export interface UniqueIdentifiers {
  id: BigNumber;
}

/**
 * Represents an external agent for a Security Token
 */
export class AgentGroup extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber;
  }

  public id: BigNumber;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id } = identifiers;

    this.id = id;
  }
}
