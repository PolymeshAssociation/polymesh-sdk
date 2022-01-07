import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';

export interface ToggleFreezeSecondaryKeysParams {
  freeze: boolean;
}

/**
 * @hidden
 */
export async function prepareToggleFreezeSecondaryKeys(
  this: Procedure<ToggleFreezeSecondaryKeysParams, void>,
  args: ToggleFreezeSecondaryKeysParams
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

  const areSecondaryKeysFrozen = await identity.areSecondaryKeysFrozen();

  if (freeze) {
    if (areSecondaryKeysFrozen) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The secondary keys are already frozen',
      });
    }

    this.addTransaction(identityTx.freezeSecondaryKeys, {});
  } else {
    if (!areSecondaryKeysFrozen) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The secondary keys are already unfrozen',
      });
    }

    this.addTransaction(identityTx.unfreezeSecondaryKeys, {});
  }
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<ToggleFreezeSecondaryKeysParams, void>,
  { freeze }: ToggleFreezeSecondaryKeysParams
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
export const toggleFreezeSecondaryKeys = (): Procedure<ToggleFreezeSecondaryKeysParams, void> =>
  new Procedure(prepareToggleFreezeSecondaryKeys, getAuthorization);
