import { assertGroupDoesNotExist, createCreateGroupResolver } from '~/api/procedures/utils';
import { BaseAsset, CustomPermissionGroup, FungibleAsset, Procedure } from '~/internal';
import { CreateGroupParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  permissionsLikeToPermissions,
  transactionPermissionsToExtrinsicPermissions,
} from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = CreateGroupParams & {
  asset: BaseAsset;
};

/**
 * @hidden
 */
export interface Storage {
  asset: FungibleAsset;
}

/**
 * @hidden
 */
export async function prepareCreateGroup(
  this: Procedure<Params, CustomPermissionGroup>,
  args: Params
): Promise<
  TransactionSpec<CustomPermissionGroup, ExtrinsicParams<'externalAgents', 'createGroup'>>
> {
  const {
    context: {
      polymeshApi: {
        tx: { externalAgents },
      },
    },
    context,
  } = this;
  const { asset, permissions } = args;

  const rawAssetId = assetToMeshAssetId(asset, context);
  const { transactions } = permissionsLikeToPermissions(permissions, context);

  await assertGroupDoesNotExist(asset, transactions);

  const rawExtrinsicPermissions = transactionPermissionsToExtrinsicPermissions(
    transactions,
    context
  );

  return {
    transaction: externalAgents.createGroup,
    args: [rawAssetId, rawExtrinsicPermissions],
    resolver: createCreateGroupResolver(context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, CustomPermissionGroup>,
  { asset }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.externalAgents.CreateGroup],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const createGroup = (): Procedure<Params, CustomPermissionGroup> =>
  new Procedure(prepareCreateGroup, getAuthorization);
