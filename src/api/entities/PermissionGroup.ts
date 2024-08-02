import BigNumber from 'bignumber.js';

import { BaseAsset, Context, Entity, FungibleAsset } from '~/internal';
import { GroupPermissions, PermissionGroupType } from '~/types';

export interface UniqueIdentifiers {
  assetId: string;
  id?: BigNumber;
  type?: PermissionGroupType;
}

/**
 * Represents a group of permissions for an Asset
 */
export abstract class PermissionGroup extends Entity<UniqueIdentifiers, unknown> {
  /**
   * Asset for which this group specifies permissions
   */
  public asset: BaseAsset;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { assetId } = identifiers;

    this.asset = new FungibleAsset({ assetId }, context);
  }

  /**
   * Retrieve the Permissions associated with this Permission Group
   */
  public abstract getPermissions(): Promise<GroupPermissions>;
}
