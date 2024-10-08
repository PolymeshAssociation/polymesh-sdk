import { PolymeshError, Procedure, Subsidy } from '~/internal';
import {
  AllowanceOperation,
  DecreaseAllowanceParams,
  ErrorCode,
  IncreaseAllowanceParams,
  SetAllowanceParams,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
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
): Promise<
  TransactionSpec<
    void,
    ExtrinsicParams<'relayer', 'updatePolyxLimit' | 'decreasePolyxLimit' | 'increasePolyxLimit'>
  >
> {
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

  return {
    transaction,
    args: [rawBeneficiaryAccount, rawAllowance],
    resolver: undefined,
  };
}

/**
 * @hidden
 *
 * To modify the allowance for a Subsidy, the caller must be the subsidizer
 */
export async function getAuthorization(
  this: Procedure<ModifyAllowanceParams, void>,
  args: ModifyAllowanceParams
): Promise<ProcedureAuthorization> {
  const { context } = this;
  const {
    subsidy: { subsidizer },
    operation,
  } = args;

  const actingAccount = await context.getActingAccount();

  const hasRoles = subsidizer.isEqual(actingAccount);

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
