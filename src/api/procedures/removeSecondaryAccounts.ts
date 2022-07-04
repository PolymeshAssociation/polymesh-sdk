import BigNumber from 'bignumber.js';
import { find } from 'lodash';

import { assertSecondaryAccounts } from '~/api/procedures/utils';
import { PolymeshError, Procedure } from '~/internal';
import { Account, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import { stringToAccountId } from '~/utils/conversion';

export interface RemoveSecondaryAccountsParams {
  accounts: Account[];
}

/**
 * @hidden
 */
export async function prepareRemoveSecondaryAccounts(
  this: Procedure<RemoveSecondaryAccountsParams>,
  args: RemoveSecondaryAccountsParams
): Promise<TransactionSpec<void, ExtrinsicParams<'identity', 'removeSecondaryKeys'>>> {
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

  return {
    transaction: tx.identity.removeSecondaryKeys,
    feeMultiplier: new BigNumber(accounts.length),
    args: [accounts.map(({ address }) => stringToAccountId(address, context))],
    resolver: undefined,
  };
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
