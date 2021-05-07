import { TxTags } from 'polymesh-types/types';

import { CurrentAccount, PolymeshError, Procedure } from '~/internal';
import { ErrorCode } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { signerToString } from '~/utils/conversion';

export interface LeaveIdentityParams {
  account: CurrentAccount;
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
    context,
  } = this;
  const {
    account,
    account: { address },
  } = args;

  const [existingIdentity, currentIdentity] = await Promise.all([
    account.getIdentity(),
    context.getCurrentIdentity(),
  ] as const);

  if (!existingIdentity) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "You don't have a current identity to leave",
    });
  }

  const secondaryKeys = await currentIdentity.getSecondaryKeys();
  const isSecondaryKey = secondaryKeys.find(({ signer }) => address === signerToString(signer));

  if (!isSecondaryKey) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Only Seconday Keys are allowed to leave an identity',
    });
  }

  this.addTransaction(tx.identity.leaveIdentityAsKey, {});
}

/**
 * @hidden
 */
export function getAuthorization(): ProcedureAuthorization {
  return {
    signerPermissions: {
      tokens: [],
      portfolios: [],
      transactions: [TxTags.identity.LeaveIdentityAsKey],
    },
  };
}

/**
 * @hidden
 */
export const leaveIdentity = (): Procedure<LeaveIdentityParams, void> =>
  new Procedure(prepareLeaveIdentity, getAuthorization);
