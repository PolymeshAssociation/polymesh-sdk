import { find } from 'lodash';

import { assertSecondaryKeys } from '~/api/procedures/utils';
import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, Signer, TxTags } from '~/types';
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

  assertSecondaryKeys(signerValues, secondaryKeys);

  this.addTransaction(
    tx.identity.removeSecondaryKeys,
    {},
    signerValues.map(signer => signerValueToSignatory(signer, context))
  );
}

/**
 * @hidden
 */
export const removeSecondaryKeys = (): Procedure<RemoveSecondaryKeysParams> =>
  new Procedure(prepareRemoveSecondaryKeys, {
    permissions: {
      transactions: [TxTags.identity.RemoveSecondaryKeys],
      tokens: [],
      portfolios: [],
    },
  });
