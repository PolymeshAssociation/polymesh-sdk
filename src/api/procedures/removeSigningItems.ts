import { find } from 'lodash';

import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, Signer } from '~/types';
import { signerToSignatory } from '~/utils';

export interface RemoveSigningItemsParams {
  signers: Signer[];
}

/**
 * @hidden
 */
export async function prepareRemoveSigningItems(
  this: Procedure<RemoveSigningItemsParams>,
  args: RemoveSigningItemsParams
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
    tx.identity.removeSigningItems,
    {},
    signers.map(signingItems => signerToSignatory(signingItems, context))
  );
}

/**
 * @hidden
 */
export async function isAuthorized(this: Procedure<RemoveSigningItemsParams>): Promise<boolean> {
  const { context } = this;

  const identity = context.getCurrentIdentity();
  const masterKey = await identity.getMasterKey();

  return masterKey === context.getCurrentPair().address;
}

export const removeSigningItems = new Procedure(prepareRemoveSigningItems, isAuthorized);
