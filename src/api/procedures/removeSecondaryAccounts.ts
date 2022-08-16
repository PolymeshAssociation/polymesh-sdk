import BigNumber from 'bignumber.js';

import { assertSecondaryAccounts } from '~/api/procedures/utils';
import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RemoveSecondaryAccountsParams, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import { stringToAccountId } from '~/utils/conversion';
import { getSecondaryAccountPermissions } from '~/utils/internal';

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
    getSecondaryAccountPermissions({ accounts, identity }, context),
  ]);

  const isPrimaryAccountPresent = accounts.find(account => account.isEqual(primaryAccount));

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
