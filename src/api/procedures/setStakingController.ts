import { PolymeshError, Procedure } from '~/internal';
import { Account, ErrorCode, SetStakingControllerParams, StakingLedger } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { stringToAccountId } from '~/utils/conversion';
import { asAccount } from '~/utils/internal';

export interface Storage {
  actingAccount: Account;

  currentController: Account | null;
  newControllerLedger: StakingLedger | null;
}

/**
 * @hidden
 */
export type Params = SetStakingControllerParams;

/**
 * @hidden
 */
export async function prepareSetStakingController(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'staking', 'setController'>>> {
  const {
    context: {
      polymeshApi: {
        tx: {
          staking: { setController },
        },
      },
    },
    context,
    storage: { actingAccount, currentController, newControllerLedger: targetLedger },
  } = this;
  const { controller: controllerInput } = args;

  const controller = asAccount(controllerInput, context);

  if (targetLedger) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The given controller is already paired with a stash',
      data: {
        givenController: controller.address,
        givenControllerStash: targetLedger.stash.address,
      },
    });
  }

  if (!currentController) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Current controller not found. The acting account must be a stash account',
      data: { actingAccount: actingAccount.address },
    });
  }

  const rawController = stringToAccountId(controller.address, context);

  return {
    transaction: setController,
    args: [rawController],
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
export async function prepareStorage(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<Storage> {
  const { context } = this;

  const targetController = asAccount(args.controller, context);

  const actingAccount = await context.getActingAccount();

  const [currentController, newControllerLedger] = await Promise.all([
    actingAccount.staking.getController(),
    targetController.staking.getLedger(),
  ]);

  return {
    actingAccount,
    currentController,
    newControllerLedger,
  };
}

/**
 * @hidden
 */
export const setStakingController = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareSetStakingController, getAuthorization, prepareStorage);
