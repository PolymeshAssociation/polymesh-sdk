import { PolymeshError, Procedure, Subsidy } from '~/internal';
import {
  AllowanceOperation,
  DecreaseAllowanceParams,
  ErrorCode,
  IncreaseAllowanceParams,
  SetAllowanceParams,
  TxTags,
} from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { bigNumberToBalance, stringToAccountId } from '~/utils/conversion';

export type ModifyAllowanceParams = (
  | IncreaseAllowanceParams
  | DecreaseAllowanceParams
  | SetAllowanceParams
) & {
  subsidy: Subsidy;
};

/**
 * @hidden
 */
export async function prepareModifyAllowance(
  this: Procedure<ModifyAllowanceParams, void>,
  args: ModifyAllowanceParams
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const {
    subsidy: {
      beneficiary: { address: beneficiaryAddress },
    },
    subsidy,
    allowance,
    operation,
  } = args;

  const [exists, currentAllowance] = await Promise.all([subsidy.exists(), subsidy.getAllowance()]);

  if (!exists) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'The Subsidy no longer exists',
    });
  }

  const rawAllowance = bigNumberToBalance(allowance, context);

  const rawBeneficiaryAccount = stringToAccountId(beneficiaryAddress, context);

  let transaction = tx.relayer.increasePolyxLimit;

  if (operation === AllowanceOperation.Set) {
    if (currentAllowance.eq(allowance)) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'Amount of allowance to set is equal to the current allowance',
      });
    }

    transaction = tx.relayer.updatePolyxLimit;
  }

  if (operation === AllowanceOperation.Decrease) {
    if (currentAllowance.lte(allowance)) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Amount of allowance to decrease cannot be more than the current allowance',
      });
    }

    transaction = tx.relayer.decreasePolyxLimit;
  }

  this.addTransaction({
    transaction,
    args: [rawBeneficiaryAccount, rawAllowance],
  });
}

/**
 * @hidden
 *
 * To modify the allowance for a Subsidy, the caller must be the subsidizer
 */
export function getAuthorization(
  this: Procedure<ModifyAllowanceParams, void>,
  args: ModifyAllowanceParams
): ProcedureAuthorization {
  const { context } = this;
  const {
    subsidy: { subsidizer },
    operation,
  } = args;

  const currentAccount = context.getSigningAccount();

  const hasRoles = subsidizer.isEqual(currentAccount);

  const transactionMap = {
    [AllowanceOperation.Increase]: TxTags.relayer.IncreasePolyxLimit,
    [AllowanceOperation.Decrease]: TxTags.relayer.DecreasePolyxLimit,
    [AllowanceOperation.Set]: TxTags.relayer.UpdatePolyxLimit,
  };

  return {
    roles: hasRoles || 'Only the subsidizer is allowed to modify the allowance of a Subsidy',
    permissions: {
      transactions: [transactionMap[operation]],
    },
  };
}

/**
 * @hidden
 */
export const modifyAllowance = (): Procedure<ModifyAllowanceParams, void> =>
  new Procedure(prepareModifyAllowance, getAuthorization);
