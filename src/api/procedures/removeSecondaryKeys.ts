import { find } from 'lodash';

import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, Signer } from '~/types';
import { signerToSignerValue, signerValueToSignatory } from '~/utils/conversion';

export interface RemoveSecondaryKeysParams {
  signers: Signer[];
}

/**
 * @hidden
 */
export async function prepareRemoveSecondaryKeys(
  this: Procedure<RemoveSecondaryKeysParams>,
  args: RemoveSecondaryKeysParams
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { signers } = args;

  const identity = await context.getCurrentIdentity();

  const [primaryKey, secondaryKeys] = await Promise.all([
    identity.getPrimaryKey(),
    context.getSecondaryKeys(),
  ]);

  const signerValues = signers.map(signer => signerToSignerValue(signer));
  const isPrimaryKeyPresent = find(signerValues, ({ value }) => value === primaryKey);

  if (isPrimaryKeyPresent) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You cannot remove the primary key',
    });
  }

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
      message: 'You cannot remove a key that is not present in your secondary keys list',
      data: {
        missing: notInTheList,
      },
    });
  }

  this.addTransaction(
    tx.identity.removeSecondaryKeys,
    {},
    signerValues.map(signer => signerValueToSignatory(signer, context))
  );
}

/**
 * @hidden
 */
export async function isAuthorized(this: Procedure<RemoveSecondaryKeysParams>): Promise<boolean> {
  const { context } = this;

  const identity = await context.getCurrentIdentity();
  const primaryKey = await identity.getPrimaryKey();

  return primaryKey === context.getCurrentPair().address;
}

/**
 * @hidden
 */
export const removeSecondaryKeys = new Procedure(prepareRemoveSecondaryKeys, isAuthorized);
