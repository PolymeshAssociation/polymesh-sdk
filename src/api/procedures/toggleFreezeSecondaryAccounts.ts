import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';

export interface ToggleFreezeSecondaryAccountsParams {
  freeze: boolean;
}

/**
 * @hidden
 */
export async function prepareToggleFreezeSecondaryAccounts(
  this: Procedure<ToggleFreezeSecondaryAccountsParams, void>,
  args: ToggleFreezeSecondaryAccountsParams
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { identity: identityTx },
      },
    },
    context,
  } = this;
  const { freeze } = args;

  const identity = await context.getCurrentIdentity();

  const areSecondaryAccountsFrozen = await identity.areSecondaryAccountsFrozen();

  if (freeze) {
    if (areSecondaryAccountsFrozen) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The secondary Accounts are already frozen',
      });
    }

    this.addTransaction(identityTx.freezeSecondaryKeys, {});
  } else {
    if (!areSecondaryAccountsFrozen) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The secondary Accounts are already unfrozen',
      });
    }

    this.addTransaction(identityTx.unfreezeSecondaryKeys, {});
  }
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
