import BigNumber from 'bignumber.js';

import { Context, PermissionGroup, setGroupPermissions } from '~/internal';
import { GroupPermissions, ProcedureMethod, SetGroupPermissionsParams } from '~/types';
import {
  assetToMeshAssetId,
  bigNumberToU32,
  extrinsicPermissionsToTransactionPermissions,
  transactionPermissionsToTxGroups,
  u32ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod, toHumanReadable } from '~/utils/internal';

export interface HumanReadable {
  id: string;
  /**
   * @deprecated in favour of `assetId`
   */
  ticker: string;
  assetId: string;
}

export interface UniqueIdentifiers {
  id: BigNumber;
  assetId: string;
}

/**
 * Represents a group of custom permissions for an Asset
 */
export class CustomPermissionGroup extends PermissionGroup {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id, assetId } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof assetId === 'string';
  }

  public id: BigNumber;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id } = identifiers;

    this.id = id;

    this.setPermissions = createProcedureMethod(
      { getProcedureAndArgs: args => [setGroupPermissions, { group: this, ...args }] },
      context
    );
  }

  /**
   * Modify the group's permissions
   */
  public setPermissions: ProcedureMethod<SetGroupPermissionsParams, void>;

  /**
   * Retrieve the list of permissions and transaction groups associated with this Permission Group
   */
  public async getPermissions(): Promise<GroupPermissions> {
    const {
      context: {
        polymeshApi: {
          query: { externalAgents },
        },
      },
      context,
      asset,
      id,
    } = this;

    const rawAssetId = assetToMeshAssetId(asset, context);

    const rawAgId = bigNumberToU32(id, context);

    const rawGroupPermissions = await externalAgents.groupPermissions(rawAssetId, rawAgId);

    const transactions = extrinsicPermissionsToTransactionPermissions(
      rawGroupPermissions.unwrap(),
      context
    );

    const transactionGroups = transactionPermissionsToTxGroups(transactions);

    return {
      transactions,
      transactionGroups,
    };
  }

  /**
   * Determine whether this Custom Permission Group exists on chain
   */
  public async exists(): Promise<boolean> {
    const { asset, id, context } = this;

    const rawAssetId = assetToMeshAssetId(asset, context);

    const currentId = await context.polymeshApi.query.externalAgents.agIdSequence(rawAssetId);

    // 1 <= id <= currentId
    return u32ToBigNumber(currentId).gte(id) && id.gte(1);
  }

  /**
   * Return the Group's static data
   */
  public toHuman(): HumanReadable {
    const { id, asset } = this;

    return toHumanReadable({
      id,
      ticker: asset,
      assetId: asset,
    });
  }
}
