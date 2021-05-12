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
    account: { address },
  } = args;

  const currentIdentity = await context.getCurrentIdentity();

  const secondaryKeys = await currentIdentity.getSecondaryKeys();
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
