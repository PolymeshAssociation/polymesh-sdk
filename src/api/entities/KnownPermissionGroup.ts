import { Context, PermissionGroup } from '~/internal';
import { GroupPermissions, ModuleName, PermissionGroupType, PermissionType, TxTags } from '~/types';
import { transactionPermissionsToTxGroups } from '~/utils/conversion';
import { toHumanReadable } from '~/utils/internal';

export interface HumanReadable {
  type: PermissionGroupType;
  /**
   * @deprecated in favour of `assetId`
   */
  ticker: string;
  assetId: string;
}

export interface UniqueIdentifiers {
  type: PermissionGroupType;
  assetId: string;
}

/**
 * Represents a pre-defined group of permissions for an Asset
 */
export class KnownPermissionGroup extends PermissionGroup {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { type, assetId } = identifier as UniqueIdentifiers;

    return type in PermissionGroupType && typeof assetId === 'string';
  }

  public type: PermissionGroupType;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { type } = identifiers;

    this.type = type;
  }

  /**
   * Retrieve the Permissions associated with this Permission Group
   */
  public async getPermissions(): Promise<GroupPermissions> {
    const { type } = this;
    let transactions;

    switch (type) {
      case PermissionGroupType.ExceptMeta:
        transactions = { values: [ModuleName.ExternalAgents], type: PermissionType.Exclude };
        break;
      case PermissionGroupType.PolymeshV1Caa:
        transactions = {
          values: [
            ModuleName.CapitalDistribution,
            ModuleName.CorporateAction,
            ModuleName.CorporateBallot,
          ],
          type: PermissionType.Include,
        };
        break;
      case PermissionGroupType.PolymeshV1Pia:
        transactions = {
          values: [
            TxTags.asset.ControllerTransfer,
            TxTags.asset.Issue,
            TxTags.asset.Redeem,
            ModuleName.Sto,
          ],
          exceptions: [TxTags.sto.Invest],
          type: PermissionType.Include,
        };
        break;
      default:
        transactions = null;
        break;
    }

    return {
      transactions,
      transactionGroups: transactions ? transactionPermissionsToTxGroups(transactions) : [],
    };
  }

  /**
   * Determine whether this Known Permission Group exists on chain
   */
  public async exists(): Promise<boolean> {
    return true;
  }

  /**
   * Return the KnownPermissionGroup's static data
   */
  public toHuman(): HumanReadable {
    const { type, asset } = this;

    return toHumanReadable({
      type,
      ticker: asset,
      assetId: asset,
    });
  }
}
