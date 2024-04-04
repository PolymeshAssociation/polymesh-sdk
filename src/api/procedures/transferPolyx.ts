import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TransferPolyxParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  bigNumberToBalance,
  signerToString,
  stringToAccountId,
  stringToMemo,
} from '~/utils/conversion';
import { asAccount } from '~/utils/internal';

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

  const toAccount = asAccount(to, context);

  const rawAccountId = stringToAccountId(signerToString(to), context);

  const [{ free: freeBalance }, receiverIdentity] = await Promise.all([
    context.accountBalance(),
    toAccount.getIdentity(),
  ]);

  if (amount.isGreaterThan(freeBalance)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'Insufficient free balance',
      data: {
        freeBalance,
      },
    });
  }

  if (!receiverIdentity) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: "The destination Account doesn't have an associated Identity",
    });
  }

  const senderIdentity = await context.getSigningIdentity();

  const [senderCdd, receiverCdd] = await Promise.all([
    senderIdentity.hasValidCdd(),
    receiverIdentity.hasValidCdd(),
  ]);

  if (!senderCdd) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The sender Identity has an invalid CDD claim',
    });
  }

  if (!receiverCdd) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The receiver Identity has an invalid CDD claim',
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
export function getAuthorization({ memo }: TransferPolyxParams): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [memo ? TxTags.balances.TransferWithMemo : TxTags.balances.Transfer],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const transferPolyx = (): Procedure<TransferPolyxParams> =>
  new Procedure(prepareTransferPolyx, getAuthorization);
