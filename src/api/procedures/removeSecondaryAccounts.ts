import { find } from 'lodash';

import { assertSecondaryAccounts } from '~/api/procedures/utils';
import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, Signer, TxTags } from '~/types';
import { signerToSignerValue, signerValueToSignatory } from '~/utils/conversion';

export interface RemoveSecondaryAccountsParams {
  signers: Signer[];
}

/**
 * @hidden
 */
export async function prepareRemoveSecondaryAccounts(
  this: Procedure<RemoveSecondaryAccountsParams>,
  args: RemoveSecondaryAccountsParams
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { signers } = args;

  const identity = await context.getCurrentIdentity();

  const [primaryAccount, secondaryAccounts] = await Promise.all([
    identity.getPrimaryAccount(),
    identity.getSecondaryAccount(),
  ]);

  const signerValues = signers.map(signer => signerToSignerValue(signer));
  const isPrimaryKeyPresent = find(signerValues, ({ value }) => value === primaryAccount.address);

  if (isPrimaryKeyPresent) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'You cannot remove the primary key',
    });
  }

  assertSecondaryAccounts(signerValues, secondaryAccounts);

  this.addTransaction(
    tx.identity.removeSecondaryKeys,
    {},
    signerValues.map(signer => signerValueToSignatory(signer, context))
  );
}

/**
 * @hidden
 */
export const removeSecondaryAccounts = (): Procedure<RemoveSecondaryAccountsParams> =>
  new Procedure(prepareRemoveSecondaryAccounts, {
    permissions: {
      transactions: [TxTags.identity.RemoveSecondaryAccounts],
      tokens: [],
      portfolios: [],
    },
  });
