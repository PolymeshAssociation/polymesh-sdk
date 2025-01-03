import { PolymeshError, Procedure } from '~/internal';
import {
  Account,
  Balance,
  ErrorCode,
  StakingLedgerEntry,
  TxTags,
  UpdatePolyxBondParams,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToBalance } from '~/utils/conversion';

/**
 * @hidden
 */
export interface Storage {
  actingAccount: Account;
  actingBalance: Balance;
  controllerEntry: StakingLedgerEntry | null;
  isStash: boolean;
}

/**
 * @hidden
 */
export type Params = UpdatePolyxBondParams & ({ type: 'unbond' } | { type: 'bondExtra' });

/**
 * @hidden
 */
export async function prepareUnbondPolyx(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<
  | TransactionSpec<void, ExtrinsicParams<'staking', 'unbond'>>
  | TransactionSpec<void, ExtrinsicParams<'staking', 'bondExtra'>>
> {
  const {
    context: {
      polymeshApi: {
        tx: {
          staking: { bondExtra, unbond },
        },
      },
    },
    context,
    storage: { actingAccount, actingBalance, controllerEntry, isStash },
  } = this;

  const { amount, type } = args;

  let transaction: typeof bondExtra | typeof unbond;

  if (type === 'unbond') {
    transaction = unbond;

    if (!controllerEntry) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Caller must be a controller account',
        data: { actingAccount: actingAccount.address },
      });
    }

    const { active } = controllerEntry;

    if (active.lt(amount)) {
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
  } else {
    transaction = bondExtra;

    if (!isStash) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Caller must be a stash account',
        data: { actingAccount: actingAccount.address },
      });
    }

    if (actingBalance.free.lt(amount)) {
      throw new PolymeshError({
        code: ErrorCode.InsufficientBalance,
        message: 'The stash account has insufficient free balance',
        data: {
          actingAccount: actingAccount.address,
          free: actingBalance.free.toString(),
        },
      });
    }
  }

  const rawAmount = bigNumberToBalance(amount, context);

  return {
    transaction,
    args: [rawAmount],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void, Storage>,
  args: Params
): ProcedureAuthorization {
  const { type } = args;
  const txTag = type === 'unbond' ? TxTags.staking.Unbond : TxTags.staking.BondExtra;

  return {
    permissions: {
      assets: [],
      transactions: [txTag],
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

  const [actingBalance, controllerEntry, controller] = await Promise.all([
    actingAccount.getBalance(),
    actingAccount.staking.getLedgerEntry(),
    actingAccount.staking.getController(),
  ]);

  return {
    actingAccount,
    actingBalance,
    controllerEntry,
    isStash: !!controller,
  };
}

/**
 * @hidden
 */
export const updateBondedPolyx = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareUnbondPolyx, getAuthorization, prepareStorage);
