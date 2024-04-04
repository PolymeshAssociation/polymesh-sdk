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
  permissionGroupIdentifierToAgentGroup,
  permissionsLikeToPermissions,
  stringToIdentityId,
  stringToTicker,
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
    storage: { asset },
  } = this;

  const { identity, group } = args;
  const { ticker } = asset;

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

  const rawTicker = stringToTicker(ticker, context);
  const rawIdentityId = stringToIdentityId(identity.did, context);

  let existingGroup: KnownPermissionGroup | CustomPermissionGroup | undefined;

  /*
   * we check if the passed permissions correspond to an existing Permission Group. If they don't,
   *   we create the Group and assign the Agent to it. If they do, we just assign the Agent to the existing Group
   */
  if (!isEntity(group)) {
    let transactions: TransactionPermissions | null;
    if ('transactions' in group) {
      ({ transactions } = group);
    } else {
      ({ transactions } = permissionsLikeToPermissions(group, context));
    }

    existingGroup = await getGroupFromPermissions(asset, transactions);

    if (!existingGroup) {
      return {
        transaction: externalAgents.createAndChangeCustomGroup,
        args: [
          rawTicker,
          transactionPermissionsToExtrinsicPermissions(transactions, context),
          rawIdentityId,
        ],
        resolver: createCreateGroupResolver(context),
      };
    }
  } else {
    existingGroup = group;
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
      rawTicker,
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
    storage: { asset },
  } = this;
  return {
    permissions: {
      transactions: [TxTags.externalAgents.ChangeGroup],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export function prepareStorage(
  this: Procedure<Params, CustomPermissionGroup | KnownPermissionGroup, Storage>,
  { group: { asset } }: Params
): Storage {
  const { context } = this;

  return {
    asset: asBaseAsset(asset, context),
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
