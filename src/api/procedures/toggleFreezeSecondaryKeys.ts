import { CurrentIdentity, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';

export interface ToggleFreezeSecondaryKeysParams {
  freeze: boolean;
  identity: CurrentIdentity;
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
  } = this;
  const { freeze, identity } = args;

  const areSecondaryKeysFrozen = await identity.areSecondaryKeysFrozen();

  if (freeze) {
    if (areSecondaryKeysFrozen) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The secondary keys are already frozen',
      });
    }

    this.addTransaction(identityTx.freezeSecondaryKeys, {});
  } else {
    if (!areSecondaryKeysFrozen) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
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
      tokens: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const toggleFreezeSecondaryKeys = (): Procedure<ToggleFreezeSecondaryKeysParams, void> =>
  new Procedure(prepareToggleFreezeSecondaryKeys, getAuthorization);
