import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';

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

  const secondaryAccounts = await signingIdentity.getSecondaryAccounts({ fetchAll: true }); // TODO there should be a more efficient way to do this
  const isSecondaryAccount = secondaryAccounts.data.find(({ account }) =>
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
