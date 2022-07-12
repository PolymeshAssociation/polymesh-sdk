import BigNumber from 'bignumber.js';
import { find } from 'lodash';

import { assertSecondaryAccounts } from '~/api/procedures/utils';
import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RemoveSecondaryAccountsParams, TxTags } from '~/types';
import { stringToAccountId } from '~/utils/conversion';

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

  const identity = await context.getSigningIdentity();

  const [{ account: primaryAccount }, secondaryAccounts] = await Promise.all([
    identity.getPrimaryAccount(),
    identity.getSecondaryAccounts(),
  ]);

  const isPrimaryAccountPresent = find(accounts, account => account.isEqual(primaryAccount));

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
    args: [accounts.map(({ address }) => stringToAccountId(address, context))],
  });
}

/**
 * @hidden
 */
export const removeSecondaryAccounts = (): Procedure<RemoveSecondaryAccountsParams> =>
  new Procedure(prepareRemoveSecondaryAccounts, {
    permissions: {
      transactions: [TxTags.identity.RemoveSecondaryKeys],
      assets: [],
      portfolios: [],
    },
  });
