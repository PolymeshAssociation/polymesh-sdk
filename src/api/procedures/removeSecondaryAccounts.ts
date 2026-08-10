import BigNumber from 'bignumber.js';

import { assertSecondaryAccounts } from '~/api/procedures/utils';
import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RemoveSecondaryAccountsParams } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import { stringToAccountId } from '~/utils/conversion';
import { areSameAccounts, getSecondaryAccountPermissions } from '~/utils/internal';

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

  const isPrimaryAccountPresent = accounts.find(account =>
    areSameAccounts(account, primaryAccount)
  );

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
      // `identity.remove_secondary_keys` is gated by `ensure_primary_key`, which never consults
      // `ExtrinsicPermissions` — no permission grant can satisfy it, so declaring the tag would
      // only make pre-flight stricter than the chain.
      transactions: [],
      assets: [],
      portfolios: [],
    },
  });
