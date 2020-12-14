import P from 'bluebird';

import { assertSecondaryKeys } from '~/api/procedures/utils';
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
  secondaryKeys: {
    signer: Signer;
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

  const { secondaryKeys: signers } = args;

  const secondaryKeys = await context.getSecondaryKeys();
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

  const signersList = await P.map(
    signerValues,
    async ({ signer, permissions: permissionsLike }) => {
      const permissions = await permissionsLikeToPermissions(permissionsLike, context);

      const rawPermissions = permissionsToMeshPermissions(permissions, context);

      return tuple(signerValueToSignatory(signer, context), rawPermissions);
    }
  );

  this.addBatchTransaction(tx.identity.setPermissionToSigner, {}, signersList);
}

/**
 * @hidden
 */
export const modifySignerPermissions = new Procedure(prepareModifySignerPermissions, {
  signerPermissions: {
    transactions: [TxTags.identity.SetPermissionToSigner],
    tokens: [],
    portfolios: [],
  },
});
