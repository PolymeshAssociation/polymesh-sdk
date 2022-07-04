import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';

export interface ToggleFreezeSecondaryAccountsParams {
  freeze: boolean;
}

/**
 * @hidden
 */
export async function prepareToggleFreezeSecondaryAccounts(
  this: Procedure<ToggleFreezeSecondaryAccountsParams, void>,
  args: ToggleFreezeSecondaryAccountsParams
): Promise<
  | TransactionSpec<void, ExtrinsicParams<'identity', 'freezeSecondaryKeys'>>
  | TransactionSpec<void, ExtrinsicParams<'identity', 'unfreezeSecondaryKeys'>>
> {
  const {
    context: {
      polymeshApi: {
        tx: { identity: identityTx },
      },
    },
    context,
  } = this;
  const { freeze } = args;

  const identity = await context.getSigningIdentity();

  const areSecondaryAccountsFrozen = await identity.areSecondaryAccountsFrozen();

  if (freeze) {
    if (areSecondaryAccountsFrozen) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The secondary Accounts are already frozen',
      });
    }

    return { transaction: identityTx.freezeSecondaryKeys, resolver: undefined };
  }

  if (!areSecondaryAccountsFrozen) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The secondary Accounts are already unfrozen',
    });
  }

  return { transaction: identityTx.unfreezeSecondaryKeys, resolver: undefined };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<ToggleFreezeSecondaryAccountsParams, void>,
  { freeze }: ToggleFreezeSecondaryAccountsParams
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [
        freeze ? TxTags.identity.FreezeSecondaryKeys : TxTags.identity.UnfreezeSecondaryKeys,
      ],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const toggleFreezeSecondaryAccounts = (): Procedure<
  ToggleFreezeSecondaryAccountsParams,
  void
> => new Procedure(prepareToggleFreezeSecondaryAccounts, getAuthorization);
