import { PolymeshError, Procedure } from '~/internal';
import { Account, ErrorCode, SetStakingPayeeParams, StakingLedger, StakingPayee } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { asAccount, calculateRawStakingPayee } from '~/utils/internal';

export interface Storage {
  actingAccount: Account;
  ledger: StakingLedger;
  currentPayee: StakingPayee;
}

/**
 * @hidden
 */
export type Params = SetStakingPayeeParams;

/**
 * @hidden
 */
export async function prepareSetStakingPayee(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'staking', 'setPayee'>>> {
  const {
    context: {
      polymeshApi: {
        tx: {
          staking: { setPayee },
        },
      },
    },
    context,
    storage: { actingAccount, ledger: controllerLedger, currentPayee },
  } = this;
  const { payee: payeeInput, autoStake } = args;

  const payee = asAccount(payeeInput, context);

  if (currentPayee.account.isEqual(payee)) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The given payee is already set',
      data: {
        payee: payee.address,
      },
    });
  }

  const rawPayee = await calculateRawStakingPayee(
    payee,
    controllerLedger.stash,
    actingAccount,
    autoStake,
    context
  );

  return {
    transaction: setPayee,
    args: [rawPayee],
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

  const ledger = await actingAccount.staking.getLedger();
  if (!ledger) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Staking ledger entry was not found. The acting account must be a controller',
      data: { actingAccount: actingAccount.address },
    });
  }

  const currentPayee = await ledger.stash.staking.getPayee();
  if (!currentPayee) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Payee was not found. The acting account must be a controller',
      data: { actingAccount: actingAccount.address, stash: ledger.stash.address },
    });
  }

  return {
    actingAccount,
    ledger,
    currentPayee,
  };
}

/**
 * @hidden
 */
export const setStakingPayee = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareSetStakingPayee, getAuthorization, prepareStorage);
