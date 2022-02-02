import { TxTags } from 'polymesh-types/types';

import { PolymeshError, Procedure, Subsidy } from '~/internal';
import { ErrorCode } from '~/types';
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
      subsidizer: { address: subsidizerAddress },
    },
    subsidy,
  } = args;

  const { address } = await context.getCurrentAccount();

  if (![beneficiaryAddress, subsidizerAddress].includes(address)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Only the subsidizer and the beneficiary are allowed to quit a Subsidy',
    });
  }

  const exists = await subsidy.exists();

  if (!exists) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'The Subsidy no longer exists',
    });
  }

  const rawBeneficiaryAccount = stringToAccountId(beneficiaryAddress, context);

  const rawSubsidizerAccount = stringToAccountId(subsidizerAddress, context);

  this.addTransaction({
    transaction: tx.relayer.removePayingKey,
    args: [rawBeneficiaryAccount, rawSubsidizerAccount],
  });
}

/**
 * @hidden
 */
export const quitSubsidy = (): Procedure<QuitSubsidyParams, void> =>
  new Procedure(prepareQuitSubsidy, {
    permissions: {
      transactions: [TxTags.relayer.RemovePayingKey],
      tokens: [],
      portfolios: [],
    },
  });
