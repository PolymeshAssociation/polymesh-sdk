import { Account, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';

export interface LeaveIdentityParams {
  account: Account;
}

/**
 * @hidden
 */
export async function prepareLeaveIdentity(
  this: Procedure<LeaveIdentityParams, void>,
  args: LeaveIdentityParams
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
  } = this;
  const { account } = args;

  const currentIdentity = await account.getIdentity();

  if (!currentIdentity) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'There is no Identity associated to this Account',
    });
  }

  const secondaryAccounts = await currentIdentity.getSecondaryAccounts();
  const isSecondaryAccount = secondaryAccounts.find(({ account: secondaryAccount }) =>
    secondaryAccount.isEqual(account)
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
export function getAuthorization(
  this: Procedure<LeaveIdentityParams, void>,
  { account }: LeaveIdentityParams
): ProcedureAuthorization {
  const currentAccount = this.context.getCurrentAccount();

  const hasRoles = account.isEqual(currentAccount);

  const permissions = {
    assets: [],
    portfolios: [],
    transactions: [TxTags.identity.LeaveIdentityAsKey],
  };

  return {
    roles: hasRoles || 'Only the current Account can leave its Identity',
    permissions,
  };
}

/**
 * @hidden
 */
export const leaveIdentity = (): Procedure<LeaveIdentityParams, void> =>
  new Procedure(prepareLeaveIdentity, getAuthorization);
