import { uniqBy } from 'lodash';

import { PolymeshError, Procedure } from '~/internal';
import { Account, ErrorCode, NominateValidatorsParams, StakingLedger } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { stringToAccountId } from '~/utils/conversion';
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
      },
    },
    context,
    storage: { actingAccount, ledger },
  } = this;
  const { validators: validatorsInput } = args;

  const validators = validatorsInput.map(validator => asAccount(validator, context));

  if (uniqBy(validators, 'address').length !== validators.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Validators cannot be repeated',
    });
  }

  const commissions = await Promise.all(
    validators.map(validator => {
      return validator.staking.getCommission();
    })
  );

  const missingCommissions = commissions.reduce((missing, commission, index) => {
    if (!commission) {
      missing.push(index);
    }

    return missing;
  }, [] as number[]);

  if (missingCommissions.length) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Commission not found for validator(s)',
      data: {
        missingCommissions: missingCommissions.map(
          missingIndex => validators[missingIndex].address
        ),
      },
    });
  }

  if (!ledger) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The acting account must be a controller',
      data: { actingAccount: actingAccount.address },
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
 * @note the staking module is exempt from permission checks
 */
export function getAuthorization(this: Procedure<Params, void, Storage>): ProcedureAuthorization {
  return {
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [],
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
