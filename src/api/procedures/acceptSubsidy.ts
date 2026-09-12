import { PolymeshError, Procedure } from '~/internal';
import { AcceptSubsidyParams, ErrorCode } from '~/types';
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
    /*
     * the chain charges the paying key for an accepted subsidy (`handle_relayer_calls`), which is
     *   what lets a beneficiary with no POLYX accept one. The pending subsidy checked above is the
     *   same condition the chain applies before attributing the fee
     */
    paidForBy: subsidizerAccount,
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
      // every `relayer` extrinsic is gated by `ensure_signed` alone, so the chain never
      // consults `ExtrinsicPermissions` - no permission grant can satisfy this tag
      transactions: [],
    },
  });
