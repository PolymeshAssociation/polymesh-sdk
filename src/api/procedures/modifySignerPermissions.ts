import { assertSecondaryAccounts } from '~/api/procedures/utils';
import { Procedure } from '~/internal';
import { Account, PermissionsLike, TxTags } from '~/types';
import { tuple } from '~/types/utils';
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
  secondaryAccounts: {
    account: Account;
    /**
     * list of permissions
     */
    permissions: PermissionsLike;
  }[];
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

  this.addBatchTransaction(tx.identity.setPermissionToSigner, {}, signersList);
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
