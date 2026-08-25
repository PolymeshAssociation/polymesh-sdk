import { PolymeshError, Procedure } from '~/internal';
import { Account, Balance, BondPolyxParams, ErrorCode } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToBalance } from '~/utils/conversion';
import { asAccount, calculateRawStakingPayee } from '~/utils/internal';

export interface Storage {
  actingBalance: Balance;
  actingAccount: Account;
}

/**
 * @hidden
 */
export type Params = BondPolyxParams;

/**
 * @hidden
 */
export async function prepareBondPolyx(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'staking', 'bond'>>> {
  const {
    context: {
      polymeshApi: {
        tx: {
          staking: { bond },
        },
      },
    },
    context,
    storage: {
      actingAccount,
      actingBalance: { free, locked },
    },
  } = this;
  const { autoStake, payee: payeeInput, amount } = args;

  const payee = asAccount(payeeInput, context);

  if (free.lt(amount)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'The stash account has insufficient POLYX to bond',
      data: {
        amount: amount.toString(),
        free: free.toString(),
        locked: locked.toString(),
        actingAccount: actingAccount.address,
      },
    });
  }

  const rawAmount = bigNumberToBalance(amount, context);
  const rawPayee = await calculateRawStakingPayee(payee, actingAccount, autoStake, context);

  return {
    transaction: bond,
    args: [rawAmount, rawPayee],
    resolver: undefined,
  };
}

/**
 * @hidden
 *
 * The staking pallet does not consult a signer's `ExtrinsicPermissions` — no Substrate pallet in
 *   the Polymesh runtime does — so no permission is required to run this, for a secondary key or
 *   an external agent alike.
 *
 * `true` rather than empty arrays: an empty `SimplePermissions` still routes through
 *   `Account.checkPermissions`, which reads the key's permissions from chain and **throws** for an
 *   Account with no Identity. That turns a check that should be a no-op into a failure, and costs
 *   a query either way.
 */
export function getAuthorization(this: Procedure<Params, void, Storage>): ProcedureAuthorization {
  return {
    permissions: true,
  };
}

/**
 * @hidden
 */
export async function prepareStorage(this: Procedure<Params, void, Storage>): Promise<Storage> {
  const { context } = this;

  const actingAccount = await context.getActingAccount();

  const actingBalance = await actingAccount.getBalance();

  return {
    actingAccount,
    actingBalance,
  };
}

/**
 * @hidden
 */
export const bondPolyx = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareBondPolyx, getAuthorization, prepareStorage);
