import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, SubsidizeAccountParams } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import { bigNumberToBalance, stringToAccountId } from '~/utils/conversion';
import { asAccount } from '~/utils/internal';

export type Params = SubsidizeAccountParams;

/**
 * @hidden
 */
export async function prepareSubsidizeAccount(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'relayer', 'approveSubsidy'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { beneficiary, allowance } = args;

  const beneficiaryAccount = asAccount(beneficiary, context);

  const { address: beneficiaryAddress } = beneficiaryAccount;

  const subsidizer = await context.getActingAccount();

  const rawBeneficiary = stringToAccountId(beneficiaryAddress, context);

  const rawAllowance = bigNumberToBalance(allowance, context);

  const [existingPendingSubsidy] = await context.getPendingSubsidies(beneficiary, [subsidizer]);

  if (existingPendingSubsidy!.allowance.eq(allowance)) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message:
        'The Beneficiary Account already has a pending subsidy for acceptance with the same allowance',
    });
  }

  return {
    transaction: tx.relayer.approveSubsidy,
    args: [rawBeneficiary, rawAllowance],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export const subsidizeAccount = (): Procedure<Params, void> =>
  new Procedure(prepareSubsidizeAccount, {
    signerPermissions: true,
  });
