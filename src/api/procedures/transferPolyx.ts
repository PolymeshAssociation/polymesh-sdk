import { Account, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TransferPolyxParams } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  bigNumberToBalance,
  signerToString,
  stringToAccountId,
  stringToMemo,
} from '~/utils/conversion';
import { optionize } from '~/utils/internal';

/**
 * @hidden
 */
export function prepareTransferPolyx(
  this: Procedure<TransferPolyxParams>,
  args: TransferPolyxParams
): Promise<TransactionSpec<void, ExtrinsicParams<'balances', 'transferWithMemo'>>> {
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

  // istanbul ignore next: will be removed with v7 support
  if (context.isV7) {
    if (memo) {
      return Promise.resolve({
        transaction: tx.balances.transferWithMemo,
        args: [rawAccountId, rawAmount, stringToMemo(memo, context)],
        resolver: undefined,
        preRunValidation,
      });
    } else {
      return Promise.resolve({
        // a type cast is needed for v7 since v8 transfers always have a memo argument
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transaction: (tx.balances as any).transfer,
        args: [rawAccountId, rawAmount],
        resolver: undefined,
        preRunValidation,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    }
  } else {
    return Promise.resolve({
      transaction: tx.balances.transferWithMemo,
      args: [rawAccountId, rawAmount, optionize(stringToMemo)(memo, context)],
      resolver: undefined,
      preRunValidation,
    });
  }
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
