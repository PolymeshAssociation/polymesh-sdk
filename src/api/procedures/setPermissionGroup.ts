import { AgentGroup, TxTags } from 'polymesh-types/types';

import { isFullGroupType } from '~/api/procedures/utils';
import {
  Asset,
  Context,
  createGroup,
  CustomPermissionGroup,
  KnownPermissionGroup,
  PolymeshError,
  PostTransactionValue,
  Procedure,
} from '~/internal';
import { ErrorCode, Identity, TransactionPermissions, TxGroup } from '~/types';
import { MaybePostTransactionValue, ProcedureAuthorization } from '~/types/internal';
import { isEntity } from '~/utils';
import {
  permissionGroupIdentifierToAgentGroup,
  stringToIdentityId,
  stringToTicker,
} from '~/utils/conversion';
import { getAsset } from '~/utils/internal';

interface AssetBase {
  /**
   * Asset over which the Identity will be granted permissions
   */
  asset: string | Asset;
}

interface TransactionsParams extends AssetBase {
  transactions: TransactionPermissions;
}

interface TxGroupParams extends AssetBase {
  transactionGroups: TxGroup[];
}

/**
 * This procedure can be called with:
 *   - An Asset's existing Custom Permission Group. The Identity will be assigned as an Agent of that Group for that Asset
 *   - A Known Permission Group and an Asset. The Identity will be assigned as an Agent of that Group for that Asset
 *   - A set of Transaction Permissions and an Asset. A Custom Permission Group will be created for that Asset with those permissions, and
 *     the Identity will be assigned as an Agent of that Group for that Asset
 *   - An array of [[TxGroup]]s that represent a set of permissions. A Custom Permission Group will be created with those permissions, and
 *     the Identity will be assigned as an Agent of that Group for that Asset
 */
export interface SetPermissionGroupParams {
  group: KnownPermissionGroup | CustomPermissionGroup | TransactionsParams | TxGroupParams;
}

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
  asset: Asset;
}

/**
 * @hidden
 */
const agentGroupResolver = (
  group: CustomPermissionGroup | KnownPermissionGroup,
  context: Context
): AgentGroup =>
  permissionGroupIdentifierToAgentGroup(
    group instanceof CustomPermissionGroup ? { custom: group.id } : group.type,
    context
  );

/**
 * @hidden
 */
export async function prepareSetPermissionGroup(
  this: Procedure<Params, CustomPermissionGroup | KnownPermissionGroup, Storage>,
  args: Params
): Promise<MaybePostTransactionValue<CustomPermissionGroup | KnownPermissionGroup>> {
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
    identity.assetPermissions.getGroup({ asset: asset }),
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

  let returnValue: MaybePostTransactionValue<CustomPermissionGroup | KnownPermissionGroup>;
  let rawAgentGroup;

  if (!isEntity(group)) {
    returnValue = await this.addProcedure(createGroup(), {
      ticker,
      permissions: group,
    });
    rawAgentGroup = (returnValue as PostTransactionValue<CustomPermissionGroup>).transform(
      customPermissionGroup => agentGroupResolver(customPermissionGroup, context)
    );
  } else {
    if (group.isEqual(currentGroup)) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The Agent is already part of this permission group',
      });
    }

    returnValue = group;
    rawAgentGroup = agentGroupResolver(group, context);
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawIdentityId = stringToIdentityId(identity.did, context);

  this.addTransaction({
    transaction: externalAgents.changeGroup,
    args: [rawTicker, rawIdentityId, rawAgentGroup],
  });

  return returnValue;
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
    asset: getAsset(asset, context),
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
