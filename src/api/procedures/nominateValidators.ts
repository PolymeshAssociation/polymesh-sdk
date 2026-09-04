import BigNumber from 'bignumber.js';
import { uniqBy } from 'lodash';

import { PolymeshError, Procedure } from '~/internal';
import { Account, ErrorCode, NominateValidatorsParams, StakingLedger } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  balanceToBigNumber,
  bigNumberToBalance,
  stringToAccountId,
  u32ToBigNumber,
} from '~/utils/conversion';
import { asAccount } from '~/utils/internal';

export interface Storage {
  actingAccount: Account;
  ledger: StakingLedger | null;
}

/**
 * @hidden
 */
export type Params = NominateValidatorsParams;

/**
 * @hidden
 */
export async function prepareNominateValidators(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'staking', 'nominate'>>> {
  const {
    context: {
      polymeshApi: {
        tx: {
          staking: { nominate },
        },
        call: {
          stakingApi: { nominationsQuota },
        },
        query: {
          staking: { minNominatorBond },
        },
      },
    },
    context,
    storage: { actingAccount, ledger },
  } = this;
  const { validators: validatorsInput, bonded } = args;

  const validators = validatorsInput.map(validator => asAccount(validator, context));

  if (validators.length === 0) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'At least one validator must be nominated',
    });
  }

  if (uniqBy(validators, 'address').length !== validators.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Validators cannot be repeated',
    });
  }

  const invalidCommissions = await Promise.all(
    validators.map(validator => {
      return validator.staking.getCommission();
    })
  );

  const badValidators = invalidCommissions.reduce(
    (invalidItems, commission, index) => {
      if (!commission) {
        invalidItems.missing.push(index);
      }

      if (commission?.blocked) {
        invalidItems.blocked.push(index);
      }

      return invalidItems;
    },
    { missing: [] as number[], blocked: [] as number[] }
  );

  if (badValidators.missing.length) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Commission not found for validator(s)',
      data: {
        missingCommissions: badValidators.missing.map(
          missingIndex => validators[missingIndex]!.address
        ),
      },
    });
  }

  if (badValidators.blocked.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Validator(s) have been blocked',
      data: {
        blockedValidators: badValidators.blocked.map(
          blockedIndex => validators[blockedIndex]!.address
        ),
      },
    });
  }

  /* `bonded` stands in for the ledger where the bond is being made in the same batch */
  let activeBond: BigNumber;

  if (bonded) {
    activeBond = bonded;
  } else if (ledger) {
    activeBond = ledger.active;
  } else {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message:
        'The acting account must be a controller. Pass `bonded` to nominate against a bond that is being made in the same batch',
      data: { actingAccount: actingAccount.address },
    });
  }

  const minBond = balanceToBigNumber(await minNominatorBond());

  if (activeBond.lt(minBond)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'The bonded amount is below the minimum the chain accepts from a nominator',
      data: {
        actingAccount: actingAccount.address,
        bonded: activeBond.toString(),
        minBond: minBond.toString(),
      },
    });
  }

  /* the chain refuses a list longer than the cap, so check it before the caller signs */
  const rawQuota = await nominationsQuota(bigNumberToBalance(activeBond, context));
  const quota = u32ToBigNumber(rawQuota);

  if (quota.lt(validators.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'More validators nominated than the acting account may nominate',
      data: {
        actingAccount: actingAccount.address,
        nominated: validators.length,
        quota: quota.toString(),
      },
    });
  }

  const rawTargets = validators.map(validator => stringToAccountId(validator.address, context));

  return {
    transaction: nominate,
    args: [rawTargets],
    resolver: undefined,
  };
}

/**
 * @hidden
 *
 * The staking pallet does not consult a signer's `ExtrinsicPermissions` — no Substrate pallet in
 *   the Polymesh runtime does — so no permission is required to run this, for a secondary key or
 *   an external agent alike.
 *
 * `permissions` rather than `signerPermissions`: the latter only overrides the secondary-key
 *   branch, which reads as though external agents were restricted when they are not.
 */
export function getAuthorization(this: Procedure<Params, void, Storage>): ProcedureAuthorization {
  return {
    permissions: true,
  };
}

/**
 * @hidden
 */
export async function prepareStorage(this: Procedure<Params, void, Storage>): Promise<Storage> {
  const { context } = this;

  const actingAccount = await context.getActingAccount();

  const ledger = await actingAccount.staking.getLedger();

  return {
    actingAccount,
    ledger,
  };
}

/**
 * @hidden
 */
export const nominateValidators = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareNominateValidators, getAuthorization, prepareStorage);
