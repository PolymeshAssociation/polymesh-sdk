import { assertSecondaryKeys } from '~/api/procedures/utils';
import { Identity, Procedure } from '~/internal';
import { PermissionsLike, Signer, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  permissionsLikeToPermissions,
  permissionsToMeshPermissions,
  signerToSignerValue,
  signerValueToSignatory,
} from '~/utils/conversion';

export interface ModifySignerPermissionsParams {
  /**
   * list of secondary keys
   */
  secondaryKeys: {
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
export interface Storage {
  identity: Identity;
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

  const { secondaryKeys: signers } = args;

  const identity = await context.getCurrentIdentity();

  const secondaryKeys = await identity.getSecondaryKeys();
  const signerValues = signers.map(({ signer, permissions }) => {
    return {
      signer: signerToSignerValue(signer),
      permissions,
    };
  });

  assertSecondaryKeys(
    signerValues.map(({ signer }) => signer),
    secondaryKeys
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
export function getAuthorization(
  this: Procedure<ModifySignerPermissionsParams>
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.identity.SetPermissionToSigner],
      tokens: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const modifySignerPermissions = (): Procedure<ModifySignerPermissionsParams> =>
  new Procedure(prepareModifySignerPermissions, getAuthorization);
