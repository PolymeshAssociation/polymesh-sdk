import { Option } from '@polkadot/types';
import { PalletStakingSlashingSlashingSpans } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure } from '~/internal';
import { Account, ErrorCode, StakingLedger } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToU32, stringToAccountId } from '~/utils/conversion';

/**
 * @hidden
 */
export interface Storage {
  actingAccount: Account;
  controllerEntry: StakingLedger | null;
  /** `null` if there is no `controllerEntry`, since the query is keyed by its stash */
  optSpans: Option<PalletStakingSlashingSlashingSpans> | null;
}

/**
 * @hidden
 */
export function prepareWithdrawUnbondedPolyx(
  this: Procedure<void, void, Storage>
): Promise<TransactionSpec<void, ExtrinsicParams<'staking', 'withdrawUnbonded'>>> {
  const {
    context: {
      polymeshApi: {
        tx: {
          staking: { withdrawUnbonded },
        },
      },
    },
    context,
    storage: { actingAccount, controllerEntry, optSpans },
  } = this;

  if (!controllerEntry) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The caller must be a controller account',
      data: { actingAccount: actingAccount.address },
    });
  }

  const spanCount = optSpans?.isSome
    ? new BigNumber(optSpans.unwrap().prior.length + 1)
    : new BigNumber(0);
  const rawSpanCount = bigNumberToU32(spanCount, context);

  return Promise.resolve({
    transaction: withdrawUnbonded,
    args: [rawSpanCount],
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
  const {
    context,
    context: {
      polymeshApi: {
        query: {
          staking: { slashingSpans },
        },
      },
    },
  } = this;

  const actingAccount = await context.getActingAccount();

  const controllerEntry = await actingAccount.staking.getLedger();

  // `slashingSpans` is keyed by the stash, which can differ from the signing controller
  const optSpans = controllerEntry
    ? await slashingSpans(stringToAccountId(controllerEntry.stash.address, context))
    : null;

  return {
    actingAccount,
    controllerEntry,
    optSpans,
  };
}

/**
 * @hidden
 */
export const withdrawUnbondedPolyx = (): Procedure<void, void, Storage> =>
  new Procedure(prepareWithdrawUnbondedPolyx, getAuthorization, prepareStorage);
