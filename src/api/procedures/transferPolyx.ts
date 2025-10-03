import { Account, PolymeshError, Procedure } from '~/internal';
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
export function prepareTransferPolyx(
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
  const rawAmount = bigNumberToBalance(amount, context);

  const preRunValidation = async ({ asProposal }: { asProposal: boolean }): Promise<void> => {
    const signingAccount = context.getSigningAccount();
    let fromAccount: Account;

    if (asProposal) {
      // Running as proposal - use MultiSig account balance
      fromAccount = await context.getActingAccount();
    } else {
      // Running directly - use signing account balance
      fromAccount = signingAccount;
    }

    const { free: freeBalance } = await fromAccount.getBalance();

    if (amount.isGreaterThan(freeBalance)) {
      throw new PolymeshError({
        code: ErrorCode.InsufficientBalance,
        message: 'Insufficient free balance',
        data: {
          freeBalance,
          fromAccount: fromAccount.address,
        },
      });
    }
  };

  if (memo) {
    return Promise.resolve({
      transaction: tx.balances.transferWithMemo,
      args: [rawAccountId, rawAmount, stringToMemo(memo, context)],
      resolver: undefined,
      preRunValidation,
    });
  }

  return Promise.resolve({
    transaction: tx.balances.transfer,
    args: [rawAccountId, rawAmount],
    resolver: undefined,
    preRunValidation,
  });
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
