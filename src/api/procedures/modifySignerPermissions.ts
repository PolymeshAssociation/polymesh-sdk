import { assertSecondaryAccounts } from '~/api/procedures/utils';
import { Procedure } from '~/internal';
import { PermissionsLike, Signer, TxTags } from '~/types';
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
    signer: Signer;
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

  const { secondaryAccounts: signers } = args;

  const identity = await context.getCurrentIdentity();

  const secondaryAccounts = await identity.getSecondaryAccounts();
  const signerValues = signers.map(({ signer, permissions }) => {
    return {
      signer: signerToSignerValue(signer),
      permissions,
    };
  });

  assertSecondaryAccounts(
    signerValues.map(({ signer }) => signer),
    secondaryAccounts
  );

  const signersList = signerValues.map(({ signer, permissions: permissionsLike }) => {
    const permissions = permissionsLikeToPermissions(permissionsLike, context);

    const rawPermissions = permissionsToMeshPermissions(permissions, context);

    return tuple(signerValueToSignatory(signer, context), rawPermissions);
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
