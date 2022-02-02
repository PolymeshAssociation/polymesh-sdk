import BigNumber from 'bignumber.js';
import { find } from 'lodash';

import { assertSecondaryAccounts } from '~/api/procedures/utils';
import { PolymeshError, Procedure } from '~/internal';
import { Account, ErrorCode, TxTags } from '~/types';
import { signerToSignerValue, signerValueToSignatory } from '~/utils/conversion';

export interface RemoveSecondaryAccountsParams {
  accounts: Account[];
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

  const { accounts } = args;

  const identity = await context.getCurrentIdentity();

  const [
    {
      account: { address: primaryAccountAddress },
    },
    secondaryAccounts,
  ] = await Promise.all([identity.getPrimaryAccount(), identity.getSecondaryAccounts()]);

  const isPrimaryAccountPresent = find(
    accounts,
    ({ address }) => address === primaryAccountAddress
  );

  if (isPrimaryAccountPresent) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'You cannot remove the primary Account',
    });
  }

  assertSecondaryAccounts(accounts, secondaryAccounts);

  this.addTransaction({
    transaction: tx.identity.removeSecondaryKeys,
    feeMultiplier: new BigNumber(accounts.length),
    args: [accounts.map(account => signerValueToSignatory(signerToSignerValue(account), context))],
  });
}

/**
 * @hidden
 */
export const removeSecondaryAccounts = (): Procedure<RemoveSecondaryAccountsParams> =>
  new Procedure(prepareRemoveSecondaryAccounts, {
    permissions: {
      transactions: [TxTags.identity.RemoveSecondaryKeys],
      tokens: [],
      portfolios: [],
    },
  });
