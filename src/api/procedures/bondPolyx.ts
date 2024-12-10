import { PolymeshError, Procedure } from '~/internal';
import { Account, Balance, BondPolyxParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  bigNumberToBalance,
  stakingRewardDestinationToRaw,
  stringToAccountId,
} from '~/utils/conversion';
import { asAccount } from '~/utils/internal';

export interface Storage {
  actingBalance: Balance;
  actingAccount: Account;

  currentController: Account | null;
}

/**
 * @hidden
 */
export type Params = BondPolyxParams & {
  payee: Account;
};

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
      actingBalance: { free, locked },
    },
  } = this;
  const { controller: controllerInput, amount } = args;

  // const payee = asAccount(payeeInput, context);
  const controller = asAccount(controllerInput, context);

  if (free.lt(amount)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'Payee account has insufficient POLYX',
      data: { requestAmount: amount.toString(), free: free.toString(), locked: locked.toString },
    });
  }

  const rawAmount = bigNumberToBalance(amount, context);
  const rawController = stringToAccountId(controller.address, context);
  const rawPayee = stakingRewardDestinationToRaw({ stash: true }, context);

  // TODO should return new balance
  return {
    transaction: bond,
    args: [rawController, rawAmount, rawPayee],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(this: Procedure<Params, void, Storage>): ProcedureAuthorization {
  return {
    permissions: {
      assets: [],
      transactions: [TxTags.staking.Bond],
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
  const actingBalance = await actingAccount.getBalance();
  const currentController = await actingAccount.staking.getController();

  return {
    actingAccount,
    actingBalance,
    currentController,
  };
}

/**
 * @hidden
 */
export const bondPolyx = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareBondPolyx, getAuthorization, prepareStorage);
