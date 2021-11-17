import BigNumber from 'bignumber.js';

import { Context, Entity, SecurityToken } from '~/internal';
import { GroupPermissions, PermissionGroupType } from '~/types';

export interface UniqueIdentifiers {
  ticker: string;
  id?: BigNumber;
  type?: PermissionGroupType;
}

/**
 * Represents a group of permissions for a Security Token
 */
export abstract class PermissionGroup extends Entity<UniqueIdentifiers, unknown> {
  /**
   * Security Token for which this group specifies permissions
   */
  public token: SecurityToken;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { ticker } = identifiers;

    this.token = new SecurityToken({ ticker }, context);
  }

  /**
   * Retrieve the Permissions associated with this Permission Group
   */
  public abstract getPermissions(): Promise<GroupPermissions>;
}
