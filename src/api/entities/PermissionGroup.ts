import BigNumber from 'bignumber.js';

import { Context, Entity } from '~/internal';

export interface UniqueIdentifiers {
  id: BigNumber;
}

/**
 * Represents a group of permissions for a Security Token
 */
export class PermissionGroup extends Entity<UniqueIdentifiers, string> {
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

  /**
   * Return the Group's ID
   */
  public toJson(): string {
    return this.id.toString();
  }
}
