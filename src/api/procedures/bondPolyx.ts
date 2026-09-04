import { PolymeshError, Procedure } from '~/internal';
import { Account, Balance, BondPolyxParams, ErrorCode, StakingLedger } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToBalance } from '~/utils/conversion';
import { asAccount, calculateRawStakingPayee } from '~/utils/internal';

export interface Storage {
  actingBalance: Balance;
  actingAccount: Account;
  /** the controller the acting Account has bonded to, where it is a stash already */
  currentController: Account | null;
  /** the ledger the acting Account controls, where it is some other stash's controller */
  controlledLedger: StakingLedger | null;
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
      currentController,
      controlledLedger,
    },
  } = this;
  const { autoStake, payee: payeeInput, amount } = args;

  const payee = asAccount(payeeInput, context);

  if (currentController) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The stash account is already bonded. Use bondExtra to add to the existing bond',
      data: {
        actingAccount: actingAccount.address,
        currentController: currentController.address,
      },
    });
  }

  /* the chain will not let one Account be a controller and a stash at the same time */
  if (controlledLedger) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The account is a controller for another stash, so it cannot become a stash itself',
      data: {
        actingAccount: actingAccount.address,
        stash: controlledLedger.stash.address,
      },
    });
  }

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

  const [actingBalance, currentController, controlledLedger] = await Promise.all([
    actingAccount.getBalance(),
    actingAccount.staking.getController(),
    actingAccount.staking.getLedger(),
  ]);

  return {
    actingAccount,
    actingBalance,
    currentController,
    controlledLedger,
  };
}

/**
 * @hidden
 */
export const bondPolyx = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareBondPolyx, getAuthorization, prepareStorage);
