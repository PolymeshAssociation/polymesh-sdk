import BigNumber from 'bignumber.js';

import { Account, Identity, PolymeshError, Procedure } from '~/internal';
import { AccountBalance, ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  numberToBalance,
  signerToString,
  stringToAccountId,
  stringToMemo,
} from '~/utils/conversion';

export interface TransferPolyxParams {
  /**
   * account that will receive the POLYX
   */
  to: string | Account;
  /**
   * amount of POLYX to be transferred
   */
  amount: BigNumber;
  /**
   * identifier string to help differentiate transfers
   */
  memo?: string;
}

/**
 * @hidden
 */
export async function prepareTransferPolyx(
  this: Procedure<TransferPolyxParams>,
  args: TransferPolyxParams
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { to, amount, memo } = args;

  let toAccount: Account;

  if (to instanceof Account) {
    toAccount = to;
  } else {
    toAccount = new Account({ address: to }, context);
  }

  const rawAccountId = stringToAccountId(signerToString(to), context);

  const [{ free: freeBalance }, receiverIdentity] = await Promise.all<
    AccountBalance,
    Identity | null
  >([context.accountBalance(), toAccount.getIdentity()]);

  if (amount.isGreaterThan(freeBalance)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Insufficient free balance',
      data: {
        freeBalance,
      },
    });
  }

  if (!receiverIdentity) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The destination account doesn't have an asssociated Identity",
    });
  }

  const senderIdentity = await context.getCurrentIdentity();

  const [senderCdd, receiverCdd] = await Promise.all([
    senderIdentity.hasValidCdd(),
    receiverIdentity.hasValidCdd(),
  ]);

  if (!senderCdd) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The sender Identity has an invalid CDD claim',
    });
  }

  if (!receiverCdd) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The receiver Identity has an invalid CDD claim',
    });
  }

  const rawAmount = numberToBalance(amount, context);

  if (memo) {
    this.addTransaction(
      tx.balances.transferWithMemo,
      {},
      rawAccountId,
      rawAmount,
      stringToMemo(memo, context)
    );
  } else {
    this.addTransaction(tx.balances.transfer, {}, rawAccountId, rawAmount);
  }
}

/**
 * @hidden
 */
export function getAuthorization({ memo }: TransferPolyxParams): ProcedureAuthorization {
  return {
    signerPermissions: {
      transactions: [memo ? TxTags.balances.TransferWithMemo : TxTags.balances.Transfer],
      tokens: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const transferPolyx = (): Procedure<TransferPolyxParams> =>
  new Procedure(prepareTransferPolyx, getAuthorization);
