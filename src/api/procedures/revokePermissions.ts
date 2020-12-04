import { assertSecondaryKeys } from '~/api/procedures/utils';
import { Procedure } from '~/internal';
import { Signer } from '~/types';
import { tuple } from '~/types/utils';
import { signerToSignerValue, signerValueToSignatory } from '~/utils/conversion';

export interface RevokePermissionsParams {
  signers: Signer[];
}

/**
 * @hidden
 */
export async function prepareRevokePermissions(
  this: Procedure<RevokePermissionsParams>,
  args: RevokePermissionsParams
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { signers } = args;

  const secondaryKeys = await context.getSecondaryKeys();
  const signerValues = signers.map(signer => signerToSignerValue(signer));

  assertSecondaryKeys(signerValues, secondaryKeys);

  const signersList = signerValues.map(signer =>
    tuple(signerValueToSignatory(signer, context), { asset: [], extrinsic: [], portfolio: [] })
  );

  this.addBatchTransaction(tx.identity.setPermissionToSigner, {}, signersList);
}

/**
 * @hidden
 */
export const revokePermissions = new Procedure(prepareRevokePermissions);
