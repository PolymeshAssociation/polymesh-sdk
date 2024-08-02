import { isEqual } from 'lodash';

import { CustomPermissionGroup, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, SetGroupPermissionsParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  bigNumberToU32,
  permissionsLikeToPermissions,
  transactionPermissionsToExtrinsicPermissions,
} from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = { group: CustomPermissionGroup } & SetGroupPermissionsParams;

/**
 * @hidden
 */
export async function prepareSetGroupPermissions(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'externalAgents', 'setGroupPermissions'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { externalAgents },
      },
    },
    context,
  } = this;

  const { group, permissions } = args;

  const { transactions } = permissionsLikeToPermissions(permissions, context);
  const { transactions: transactionPermissions } = await group.getPermissions();

  if (isEqual(transactionPermissions, transactions)) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'New permissions are the same as the current ones',
    });
  }

  const { asset, id } = group;
  const rawAssetId = assetToMeshAssetId(asset, context);
  const rawAgId = bigNumberToU32(id, context);
  const rawExtrinsicPermissions = transactionPermissionsToExtrinsicPermissions(
    transactions,
    context
  );

  return {
    transaction: externalAgents.setGroupPermissions,
    args: [rawAssetId, rawAgId, rawExtrinsicPermissions],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params>,
  { group: { asset } }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.externalAgents.SetGroupPermissions],
      portfolios: [],
      assets: [asset],
    },
  };
}

/**
 * @hidden
 */
export const setGroupPermissions = (): Procedure<Params, void> =>
  new Procedure(prepareSetGroupPermissions, getAuthorization);
