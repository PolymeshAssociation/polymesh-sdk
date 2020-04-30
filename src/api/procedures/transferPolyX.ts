import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure } from '~/base';
import { ErrorCode } from '~/types';
import { numberToBalance, stringToAccountKey } from '~/utils';

export interface TransferPolyXParams {
  to: string;
  amount: BigNumber;
}

/**
 * @hidden
 */
export async function prepareTransferPolyX(
  this: Procedure<TransferPolyXParams>,
  args: TransferPolyXParams
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        query: { identity },
        tx,
      },
    },
    context,
  } = this;

  const { to, amount: val } = args;

  const freeBalance = await context.accountBalance();

  if (val.isGreaterThan(freeBalance)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Insufficient balance to perform this action',
    });
  }

  try {
    const identityIds = await identity.keyToIdentityIds(stringToAccountKey(to, context));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const did = identityIds.unwrap().asUnique;
    this.addTransaction(tx.balances.transfer, {}, to, numberToBalance(val, context));
  } catch (err) {
    throw new PolymeshError({
      code: ErrorCode.FatalError,
      message: 'The destination account has not an associated identity',
    });
  }
}

export const transferPolyX = new Procedure(prepareTransferPolyX);
