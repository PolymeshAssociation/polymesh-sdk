import { TxTags } from 'polymesh-types/types';

import { Account, PolymeshError, Procedure } from '~/internal';
import { ErrorCode } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { signerToString } from '~/utils/conversion';

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
      code: ErrorCode.ValidationError,
      message: 'There is no Identity associated to this Account',
    });
  }

  const secondaryKeys = await currentIdentity.getSecondaryKeys();
  const { address } = account;
  const isSecondaryKey = secondaryKeys.find(({ signer }) => address === signerToString(signer));

  if (!isSecondaryKey) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Only Seconday Keys are allowed to leave an Identity',
    });
  }

  this.addTransaction(tx.identity.leaveIdentityAsKey, {});
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
    tokens: [],
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
