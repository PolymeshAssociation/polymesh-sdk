import { Identity, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';

export interface ToggleFreezeSecondaryKeysParams {
  freeze: boolean;
  identity: Identity;
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
  { freeze, identity: { did } }: ToggleFreezeSecondaryKeysParams
): ProcedureAuthorization {
  return {
    roles: [{ type: RoleType.Identity, did }],
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
