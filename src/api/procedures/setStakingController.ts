import { PolymeshError, Procedure } from '~/internal';
import { Account, ErrorCode } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';

export interface Storage {
  actingAccount: Account;

  currentController: Account | null;
}

/**
 * @hidden
 */
export function prepareSetStakingController(
  this: Procedure<void, void, Storage>
): Promise<TransactionSpec<void, ExtrinsicParams<'staking', 'setController'>>> {
  const {
    context: {
      polymeshApi: {
        tx: {
          staking: { setController },
        },
      },
    },
    storage: { actingAccount, currentController },
  } = this;

  if (!currentController) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Current controller not found. The acting account must be a stash account',
      data: { actingAccount: actingAccount.address },
    });
  }

  // This is a no arg extrinsic
  return Promise.resolve({
    transaction: setController,
    args: undefined,
    resolver: undefined,
  });
}

/**
 * @hidden
 * @note the staking module is exempt from permission checks
 */
export function getAuthorization(this: Procedure<void, void, Storage>): ProcedureAuthorization {
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
export async function prepareStorage(this: Procedure<void, void, Storage>): Promise<Storage> {
  const { context } = this;

  const actingAccount = await context.getActingAccount();

  const currentController = await actingAccount.staking.getController();

  return {
    actingAccount,
    currentController,
  };
}

/**
 * @hidden
 */
export const setStakingController = (): Procedure<void, void, Storage> =>
  new Procedure(prepareSetStakingController, getAuthorization, prepareStorage);
