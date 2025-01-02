import { PolymeshError, Procedure } from '~/internal';
import { Account, ErrorCode, StakingLedgerEntry, TxTags, UnbondPolyxParams } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToBalance } from '~/utils/conversion';

export interface Storage {
  actingAccount: Account;
  controllerEntry: StakingLedgerEntry | null;
}

/**
 * @hidden
 */
export async function prepareUnbondPolyx(
  this: Procedure<UnbondPolyxParams, void, Storage>,
  args: UnbondPolyxParams
): Promise<TransactionSpec<void, ExtrinsicParams<'staking', 'unbond'>>> {
  const {
    context: {
      polymeshApi: {
        tx: {
          staking: { unbond },
        },
      },
    },
    context,
    storage: { actingAccount, controllerEntry },
  } = this;
  const { amount } = args;

  if (!controllerEntry) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Caller must be a controller account',
      data: { actingAccount: actingAccount.address },
    });
  }

  const { active } = controllerEntry;

  if (controllerEntry.active.lt(amount)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'Insufficient bonded POLYX',
      data: {
        amount: amount.toString(),
        active: active.toString(),
        actingAccount: actingAccount.address,
      },
    });
  }

  const rawAmount = bigNumberToBalance(amount, context);

  return {
    transaction: unbond,
    args: [rawAmount],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<UnbondPolyxParams, void, Storage>
): ProcedureAuthorization {
  return {
    permissions: {
      assets: [],
      transactions: [TxTags.staking.Unbond],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<UnbondPolyxParams, void, Storage>
): Promise<Storage> {
  const { context } = this;

  const actingAccount = await context.getActingAccount();

  const controllerEntry = await actingAccount.staking.getLedgerEntry();

  return {
    actingAccount,
    controllerEntry,
  };
}

/**
 * @hidden
 */
export const unbondPolyx = (): Procedure<UnbondPolyxParams, void, Storage> =>
  new Procedure(prepareUnbondPolyx, getAuthorization, prepareStorage);
