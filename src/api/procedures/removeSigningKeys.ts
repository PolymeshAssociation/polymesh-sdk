import { find } from 'lodash';

import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, Signer } from '~/types';
import { signerToSignatory } from '~/utils';

export interface RemoveSigningKeysParams {
  signers: Signer[];
}

/**
 * @hidden
 */
export async function prepareRemoveSigningKeys(
  this: Procedure<RemoveSigningKeysParams>,
  args: RemoveSigningKeysParams
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { signers } = args;

  const identity = context.getCurrentIdentity();

  const [masterKey, signingKeys] = await Promise.all([
    identity.getMasterKey(),
    context.getSigningKeys(),
  ]);

  const isMasterKeyPresent = find(signers, ({ value }) => value === masterKey);

  if (isMasterKeyPresent) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You cannot remove the master key',
    });
  }

  const notInTheList: string[] = [];
  signers.forEach(({ value: itemValue }) => {
    const isPresent = signingKeys.find(({ value }) => value === itemValue);
    if (!isPresent) {
      notInTheList.push(itemValue);
    }
  });

  if (notInTheList.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You cannot remove a signing key that is not present in your signing keys list',
      data: {
        missing: notInTheList,
      },
    });
  }

  this.addTransaction(
    tx.identity.removeSigningKeys,
    {},
    signers.map(signer => signerToSignatory(signer, context))
  );
}

/**
 * @hidden
 */
export async function isAuthorized(this: Procedure<RemoveSigningKeysParams>): Promise<boolean> {
  const { context } = this;

  const identity = context.getCurrentIdentity();
  const masterKey = await identity.getMasterKey();

  return masterKey === context.getCurrentPair().address;
}

/**
 * @hidden
 */
export const removeSigningKeys = new Procedure(prepareRemoveSigningKeys, isAuthorized);
