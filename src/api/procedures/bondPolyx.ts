import { RewardDestination } from '@polkadot/types/interfaces';

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
  const { autoStake, controller: controllerInput, rewardDestination: payeeInput, amount } = args;

  const payee = asAccount(payeeInput, context);
  const controller = asAccount(controllerInput, context);

  if (autoStake && !payee.isEqual(actingAccount)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'auto staking requires the payee to be the acting account',
      data: {
        payee: payee.address,
        actingAccount: actingAccount.address,
        autoStake,
      },
    });
  }

  if (free.lt(amount)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'The stash account has insufficient POLYX',
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

  let rawPayee: RewardDestination;
  if (autoStake) {
    rawPayee = stakingRewardDestinationToRaw({ staked: true }, context);
  } else if (actingAccount.isEqual(payee)) {
    rawPayee = stakingRewardDestinationToRaw({ stash: true }, context);
  } else if (controller.isEqual(payee)) {
    rawPayee = stakingRewardDestinationToRaw({ controller: true }, context);
  } else {
    rawPayee = stakingRewardDestinationToRaw({ account: payee }, context);
  }

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
