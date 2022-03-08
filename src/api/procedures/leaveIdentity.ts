import { TxTags } from 'polymesh-types/types';

import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode } from '~/types';

/**
 * @hidden
 */
export async function prepareLeaveIdentity(this: Procedure<void, void>): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const signingAccount = context.getSigningAccount();
  const signingIdentity = await signingAccount.getIdentity();

  if (!signingIdentity) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'There is no Identity associated to the signing Account',
    });
  }

  const secondaryAccounts = await signingIdentity.getSecondaryAccounts();
  const isSecondaryAccount = secondaryAccounts.find(({ account }) =>
    account.isEqual(signingAccount)
  );

  if (!isSecondaryAccount) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Only secondary Accounts are allowed to leave an Identity',
    });
  }

  this.addTransaction({ transaction: tx.identity.leaveIdentityAsKey });
}

/**
 * @hidden
 */
export const leaveIdentity = (): Procedure<void, void> =>
  new Procedure(prepareLeaveIdentity, {
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [TxTags.identity.LeaveIdentityAsKey],
    },
  });
