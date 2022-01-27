import { assertSecondaryAccounts } from '~/api/procedures/utils';
import { Procedure } from '~/internal';
import { PermissionedAccount, PermissionsLike, TxTags } from '~/types';
import { Modify, tuple } from '~/types/utils';
import {
  permissionsLikeToPermissions,
  permissionsToMeshPermissions,
  signerToSignerValue,
  signerValueToSignatory,
} from '~/utils/conversion';

export interface ModifySignerPermissionsParams {
  /**
   * list of secondary accounts
   */
  secondaryAccounts: Modify<PermissionedAccount, { permissions: PermissionsLike }>[];
}

/**
 * @hidden
 */
export async function prepareModifySignerPermissions(
  this: Procedure<ModifySignerPermissionsParams>,
  args: ModifySignerPermissionsParams
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { secondaryAccounts } = args;

  const identity = await context.getCurrentIdentity();

  const existingSecondaryAccounts = await identity.getSecondaryAccounts();

  assertSecondaryAccounts(
    secondaryAccounts.map(({ account }) => account),
    existingSecondaryAccounts
  );

  const signersList = secondaryAccounts.map(({ account, permissions: permissionsLike }) => {
    const permissions = permissionsLikeToPermissions(permissionsLike, context);

    const rawPermissions = permissionsToMeshPermissions(permissions, context);

    return tuple(signerValueToSignatory(signerToSignerValue(account), context), rawPermissions);
  });

  const transaction = tx.identity.setPermissionToSigner;

  this.addBatchTransaction({
    transactions: signersList.map(params => ({
      transaction,
      args: params,
    })),
  });
}

/**
 * @hidden
 */
export const modifySignerPermissions = (): Procedure<ModifySignerPermissionsParams> =>
  new Procedure(prepareModifySignerPermissions, {
    permissions: {
      transactions: [TxTags.identity.SetPermissionToSigner],
      tokens: [],
      portfolios: [],
    },
  });
