import {
  createCreateGroupResolver,
  getGroupFromPermissions,
  isFullGroupType,
} from '~/api/procedures/utils';
import {
  BaseAsset,
  CustomPermissionGroup,
  KnownPermissionGroup,
  PolymeshError,
  Procedure,
} from '~/internal';
import {
  ErrorCode,
  Identity,
  SetPermissionGroupParams,
  TransactionPermissions,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { isEntity } from '~/utils';
import {
  assetToMeshAssetId,
  permissionGroupIdentifierToAgentGroup,
  permissionsLikeToPermissions,
  stringToIdentityId,
  transactionPermissionsToExtrinsicPermissions,
} from '~/utils/conversion';
import { asBaseAsset } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = SetPermissionGroupParams & {
  identity: Identity;
};

/**
 * @hidden
 */
export interface Storage {
  asset: BaseAsset;
  /**
   * the Permission Group the Agent will be moved into, or `null` if no existing Group matches the
   *   passed permissions and one has to be created alongside the change
   */
  existingGroup: KnownPermissionGroup | CustomPermissionGroup | null;
  /**
   * transactions to grant the Group that has to be created. Only set when `existingGroup` is `null`
   */
  groupTransactions: TransactionPermissions | null;
}

/**
 * @hidden
 */
export async function prepareSetPermissionGroup(
  this: Procedure<Params, CustomPermissionGroup | KnownPermissionGroup, Storage>,
  args: Params
): Promise<
  | TransactionSpec<
      CustomPermissionGroup | KnownPermissionGroup,
      ExtrinsicParams<'externalAgents', 'createAndChangeCustomGroup'>
    >
  | TransactionSpec<
      KnownPermissionGroup | CustomPermissionGroup,
      ExtrinsicParams<'externalAgents', 'changeGroup'>
    >
> {
  const {
    context: {
      polymeshApi: {
        tx: { externalAgents },
      },
    },
    context,
    storage: { asset, existingGroup, groupTransactions },
  } = this;

  const { identity } = args;

  const [currentGroup, currentAgents] = await Promise.all([
    identity.assetPermissions.getGroup({ asset }),
    asset.permissions.getAgents(),
  ]);

  if (isFullGroupType(currentGroup)) {
    const fullGroupAgents = currentAgents.filter(({ group: groupOfAgent }) =>
      isFullGroupType(groupOfAgent)
    );
    if (fullGroupAgents.length === 1) {
      throw new PolymeshError({
        code: ErrorCode.EntityInUse,
        message:
          'The target is the last Agent with full permissions for this Asset. There should always be at least one Agent with full permissions',
      });
    }
  }

  if (!currentAgents.find(({ agent }) => agent.isEqual(identity))) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The target must already be an Agent for the Asset',
    });
  }

  const rawAssetId = assetToMeshAssetId(asset, context);
  const rawIdentityId = stringToIdentityId(identity.did, context);

  /*
   * we check if the passed permissions correspond to an existing Permission Group. If they don't,
   *   we create the Group and assign the Agent to it. If they do, we just assign the Agent to the existing Group
   */
  if (!existingGroup) {
    return {
      transaction: externalAgents.createAndChangeCustomGroup,
      args: [
        rawAssetId,
        transactionPermissionsToExtrinsicPermissions(groupTransactions, context),
        rawIdentityId,
      ],
      resolver: createCreateGroupResolver(context),
    };
  }

  if (existingGroup.isEqual(currentGroup)) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The Agent is already part of this permission group',
    });
  }

  return {
    transaction: externalAgents.changeGroup,
    args: [
      rawAssetId,
      rawIdentityId,
      permissionGroupIdentifierToAgentGroup(
        existingGroup instanceof CustomPermissionGroup
          ? { custom: existingGroup.id }
          : existingGroup.type,
        context
      ),
    ],
    resolver: existingGroup,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, CustomPermissionGroup | KnownPermissionGroup, Storage>
): ProcedureAuthorization {
  const {
    storage: { asset, existingGroup },
  } = this;
  return {
    permissions: {
      transactions: [
        existingGroup
          ? TxTags.externalAgents.ChangeGroup
          : TxTags.externalAgents.CreateAndChangeCustomGroup,
      ],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, CustomPermissionGroup | KnownPermissionGroup, Storage>,
  { group }: Params
): Promise<Storage> {
  const { context } = this;

  const asset = await asBaseAsset(group.asset, context);

  if (isEntity(group)) {
    return { asset, existingGroup: group, groupTransactions: null };
  }

  let transactions: TransactionPermissions | null;
  if ('transactions' in group) {
    ({ transactions } = group);
  } else {
    ({ transactions } = permissionsLikeToPermissions(group, context));
  }

  return {
    asset,
    existingGroup: (await getGroupFromPermissions(asset, transactions)) ?? null,
    groupTransactions: transactions,
  };
}

/**
 * @hidden
 */
export const setPermissionGroup = (): Procedure<
  Params,
  CustomPermissionGroup | KnownPermissionGroup,
  Storage
> => new Procedure(prepareSetPermissionGroup, getAuthorization, prepareStorage);
