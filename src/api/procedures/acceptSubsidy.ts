import { PolymeshError, Procedure } from '~/internal';
import { AcceptSubsidyParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import { stringToAccountId } from '~/utils/conversion';
import { asAccount } from '~/utils/internal';

/**
 * @hidden
 */
export async function prepareAcceptSubsidy(
  this: Procedure<AcceptSubsidyParams, void>,
  args: AcceptSubsidyParams
): Promise<TransactionSpec<void, ExtrinsicParams<'relayer', 'acceptSubsidy'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { subsidizer } = args;

  if (context.isV7) {
    throw new PolymeshError({
      code: ErrorCode.NotSupported,
      message: 'This method is not supported for chain 7.x.',
    });
  }

  const subsidizerAccount = asAccount(subsidizer, context);
  const { address: subsidizerAddress } = subsidizerAccount;

  const actingAccount = await context.getActingAccount();

  const [pendingSubsidy] = await context.getPendingSubsidies(actingAccount, [subsidizerAccount]);

  if (!pendingSubsidy) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'There is no pending subsidy to accept',
    });
  }

  const rawSubsidizer = stringToAccountId(subsidizerAddress, context);

  return {
    transaction: tx.relayer.acceptSubsidy,
    args: [rawSubsidizer],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export const acceptSubsidy = (): Procedure<AcceptSubsidyParams, void> =>
  new Procedure(prepareAcceptSubsidy, {
    roles: [],
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [TxTags.relayer.AcceptSubsidy],
    },
  });
