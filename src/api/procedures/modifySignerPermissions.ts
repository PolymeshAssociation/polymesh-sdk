import { assertSecondaryKeys } from '~/api/procedures/utils';
import { Identity, Procedure } from '~/internal';
import { PermissionsLike, RoleType, Signer, TxTags } from '~/types';
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

export type Params = ModifySignerPermissionsParams & {
  identity: Identity;
};

/**
 * @hidden
 */
export async function prepareModifySignerPermissions(
  this: Procedure<Params>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { secondaryKeys: signers, identity } = args;

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
  this: Procedure<Params>,
  { identity: { did } }: Params
): ProcedureAuthorization {
  return {
    roles: [{ type: RoleType.Identity, did }],
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
export const modifySignerPermissions = (): Procedure<Params> =>
  new Procedure(prepareModifySignerPermissions, getAuthorization);
