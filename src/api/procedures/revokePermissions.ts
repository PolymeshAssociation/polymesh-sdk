import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, Signer } from '~/types';
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

  const notInTheList: string[] = [];
  signerValues.forEach(({ value: itemValue }) => {
    const isPresent = secondaryKeys
      .map(({ signer }) => signerToSignerValue(signer))
      .find(({ value }) => value === itemValue);
    if (!isPresent) {
      notInTheList.push(itemValue);
    }
  });

  if (notInTheList.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message:
        'You cannot revoke permissions for a key that is not present in your secondary keys list',
      data: {
        missing: notInTheList,
      },
    });
  }

  const signersList = signerValues.map(signer =>
    tuple(signerValueToSignatory(signer, context), { asset: [], extrinsic: [], portfolio: [] })
  );

  this.addBatchTransaction(tx.identity.setPermissionToSigner, {}, signersList);
}

/**
 * @hidden
 */
export async function isAuthorized(this: Procedure<RevokePermissionsParams>): Promise<boolean> {
  const { context } = this;

  const identity = await context.getCurrentIdentity();
  const primaryKey = await identity.getPrimaryKey();

  return primaryKey === context.getCurrentPair().address;
}

/**
 * @hidden
 */
export const revokePermissions = new Procedure(prepareRevokePermissions, isAuthorized);
