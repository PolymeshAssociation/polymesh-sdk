import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TransferPolyxParams } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  bigNumberToBalance,
  signerToString,
  stringToAccountId,
  stringToMemo,
} from '~/utils/conversion';

/**
 * @hidden
 */
export async function prepareTransferPolyx(
  this: Procedure<TransferPolyxParams>,
  args: TransferPolyxParams
): Promise<
  | TransactionSpec<void, ExtrinsicParams<'balances', 'transfer'>>
  | TransactionSpec<void, ExtrinsicParams<'balances', 'transferWithMemo'>>
> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { to, amount, memo } = args;

  const rawAccountId = stringToAccountId(signerToString(to), context);

  const { free: freeBalance } = await context.accountBalance();

  if (amount.isGreaterThan(freeBalance)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'Insufficient free balance',
      data: {
        freeBalance,
      },
    });
  }

  const rawAmount = bigNumberToBalance(amount, context);

  if (memo) {
    return {
      transaction: tx.balances.transferWithMemo,
      args: [rawAccountId, rawAmount, stringToMemo(memo, context)],
      resolver: undefined,
    };
  }

  return {
    transaction: tx.balances.transfer,
    args: [rawAccountId, rawAmount],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(): ProcedureAuthorization {
  return {
    signerPermissions: true,
  };
}

/**
 * @hidden
 */
export const transferPolyx = (): Procedure<TransferPolyxParams> =>
  new Procedure(prepareTransferPolyx, getAuthorization);
