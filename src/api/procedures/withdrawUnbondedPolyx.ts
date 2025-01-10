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
  optSpans: Option<PalletStakingSlashingSlashingSpans>;
}

/**
 * @hidden
 */
export async function prepareWithdrawUnbondedPolyx(
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

  const spanCount = optSpans.isNone
    ? new BigNumber(0)
    : new BigNumber(optSpans.unwrap().prior.length + 1);
  const rawSpanCount = bigNumberToU32(spanCount, context);

  return {
    transaction: withdrawUnbonded,
    args: [rawSpanCount],
    resolver: undefined,
  };
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
  const rawActingAddress = stringToAccountId(actingAccount.address, context);

  const [controllerEntry, spans] = await Promise.all([
    actingAccount.staking.getLedger(),
    slashingSpans(rawActingAddress),
  ]);

  return {
    actingAccount,
    controllerEntry,
    optSpans: spans,
  };
}

/**
 * @hidden
 */
export const withdrawUnbondedPolyx = (): Procedure<void, void, Storage> =>
  new Procedure(prepareWithdrawUnbondedPolyx, getAuthorization, prepareStorage);
