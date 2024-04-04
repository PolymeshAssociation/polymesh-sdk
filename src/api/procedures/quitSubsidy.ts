import { PolymeshError, Procedure, Subsidy } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { stringToAccountId } from '~/utils/conversion';

export interface QuitSubsidyParams {
  subsidy: Subsidy;
}

/**
 * @hidden
 */
export async function prepareQuitSubsidy(
  this: Procedure<QuitSubsidyParams, void>,
  args: QuitSubsidyParams
): Promise<TransactionSpec<void, ExtrinsicParams<'relayer', 'removePayingKey'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const {
    subsidy: {
      beneficiary: { address: beneficiaryAddress },
      subsidizer: { address: subsidizerAddress },
    },
    subsidy,
  } = args;

  const exists = await subsidy.exists();

  if (!exists) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'The Subsidy no longer exists',
    });
  }

  const rawBeneficiaryAccount = stringToAccountId(beneficiaryAddress, context);

  const rawSubsidizerAccount = stringToAccountId(subsidizerAddress, context);

  return {
    transaction: tx.relayer.removePayingKey,
    args: [rawBeneficiaryAccount, rawSubsidizerAccount],
    resolver: undefined,
  };
}

/**
 * @hidden
 *
 * To quit a Subsidy, the caller should be either the beneficiary or the subsidizer
 */
export async function getAuthorization(
  this: Procedure<QuitSubsidyParams, void>,
  args: QuitSubsidyParams
): Promise<ProcedureAuthorization> {
  const { context } = this;
  const {
    subsidy: {
      beneficiary: { address: beneficiaryAddress },
      subsidizer: { address: subsidizerAddress },
    },
  } = args;

  const { address } = context.getSigningAccount();

  const hasRoles = [beneficiaryAddress, subsidizerAddress].includes(address);

  return {
    roles: hasRoles || 'Only the subsidizer or the beneficiary are allowed to quit a Subsidy',
    permissions: {
      transactions: [TxTags.relayer.RemovePayingKey],
    },
  };
}

/**
 * @hidden
 */
export const quitSubsidy = (): Procedure<QuitSubsidyParams, void> =>
  new Procedure(prepareQuitSubsidy, getAuthorization);
