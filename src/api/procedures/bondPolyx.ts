import { PolymeshError, Procedure } from '~/internal';
import { Account, Balance, BondPolyxParams, ErrorCode } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToBalance, stringToAccountId } from '~/utils/conversion';
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
  const { autoStake, controller: controllerInput, payee: payeeInput, amount } = args;

  const payee = asAccount(payeeInput, context);
  const controller = asAccount(controllerInput, context);

  const controllerId = await controller.getIdentity();
  if (!controllerId) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The controller should be associated to an Identity',
      data: { controller: controller.address },
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
  const rawController = stringToAccountId(controller.address, context);
  const rawPayee = await calculateRawStakingPayee(
    payee,
    actingAccount,
    controller,
    autoStake,
    context
  );

  return {
    transaction: bond,
    args: [rawController, rawAmount, rawPayee],
    resolver: undefined,
  };
}

/**
 * @hidden
 * @note the staking module is exempt from permission checks
 */
export function getAuthorization(this: Procedure<Params, void, Storage>): ProcedureAuthorization {
  return {
    permissions: {
      assets: [],
      transactions: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(this: Procedure<Params, void, Storage>): Promise<Storage> {
  const { context } = this;

  const actingAccount = await context.getActingAccount();

  const [actingBalance] = await Promise.all([actingAccount.getBalance()]);

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
