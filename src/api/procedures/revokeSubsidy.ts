import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RevokeSubsidyParams, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import { stringToAccountId } from '~/utils/conversion';
import { asAccount } from '~/utils/internal';

/**
 * @hidden
 */
export async function prepareRevokeSubsidy(
  this: Procedure<RevokeSubsidyParams, void>,
  args: RevokeSubsidyParams
): Promise<TransactionSpec<void, ExtrinsicParams<'relayer', 'revokeSubsidy'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { beneficiary } = args;

  if (context.isV7) {
    throw new PolymeshError({
      code: ErrorCode.NotSupported,
      message: 'This method is not supported for chain 7.x.',
    });
  }

  const beneficiaryAccount = asAccount(beneficiary, context);
  const { address: beneficiaryAddress } = beneficiaryAccount;

  const actingAccount = await context.getActingAccount();

  const [pendingSubsidy] = await context.getPendingSubsidies(beneficiaryAccount, [actingAccount]);

  if (!pendingSubsidy) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'There is no pending subsidy to revoke',
    });
  }

  const rawBeneficiary = stringToAccountId(beneficiaryAddress, context);

  return {
    transaction: tx.relayer.revokeSubsidy,
    args: [rawBeneficiary],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export const revokeSubsidy = (): Procedure<RevokeSubsidyParams, void> =>
  new Procedure(prepareRevokeSubsidy, {
    roles: [],
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [TxTags.relayer.RevokeSubsidy],
    },
  });
