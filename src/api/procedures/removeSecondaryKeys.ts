import { find } from 'lodash';

import { assertSecondaryKeys } from '~/api/procedures/utils';
import { PolymeshError, Procedure } from '~/internal';
import { Account, ErrorCode, TxTags } from '~/types';
import { signerToSignerValue, signerValueToSignatory } from '~/utils/conversion';

export interface RemoveSecondaryKeysParams {
  accounts: Account[];
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

  const { accounts } = args;

  const identity = await context.getCurrentIdentity();

  console.log(await identity.getPrimaryKey());
  console.log(await identity.getSecondaryKeys());
  const [
    {
      account: { address: primaryKeyAddress },
    },
    secondaryKeys,
  ] = await Promise.all([identity.getPrimaryKey(), identity.getSecondaryKeys()]);

  const isPrimaryKeyPresent = find(accounts, ({ address }) => address === primaryKeyAddress);

  if (isPrimaryKeyPresent) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'You cannot remove the primary key',
    });
  }

  assertSecondaryKeys(accounts, secondaryKeys);

  this.addTransaction(
    tx.identity.removeSecondaryKeys,
    {},
    accounts.map(account => signerValueToSignatory(signerToSignerValue(account), context))
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
