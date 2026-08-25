import { PolymeshError, Procedure } from '~/internal';
import { Account, ErrorCode, StakingLedger } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';

/**
 * @hidden
 */
export interface Storage {
  actingAccount: Account;
  controllerEntry: StakingLedger | null;
}

/**
 * @hidden
 */
export function prepareChillStaking(
  this: Procedure<void, void, Storage>
): Promise<TransactionSpec<void, ExtrinsicParams<'staking', 'chill'>>> {
  const {
    context: {
      polymeshApi: {
        tx: {
          staking: { chill },
        },
      },
    },
    storage: { actingAccount, controllerEntry },
  } = this;

  if (!controllerEntry) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The caller must be a controller account',
      data: { actingAccount: actingAccount.address },
    });
  }

  return Promise.resolve({
    transaction: chill,
    args: undefined,
    resolver: undefined,
  });
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
export function getAuthorization(this: Procedure<void, void, Storage>): ProcedureAuthorization {
  return {
    permissions: true,
  };
}

/**
 * @hidden
 */
export async function prepareStorage(this: Procedure<void, void, Storage>): Promise<Storage> {
  const { context } = this;

  const actingAccount = await context.getActingAccount();

  const controllerEntry = await actingAccount.staking.getLedger();

  return {
    actingAccount,
    controllerEntry,
  };
}

/**
 * @hidden
 */
export const chillStaking = (): Procedure<void, void, Storage> =>
  new Procedure(prepareChillStaking, getAuthorization, prepareStorage);
