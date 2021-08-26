import { find } from 'lodash';

import { assertSecondaryKeys } from '~/api/procedures/utils';
import { Identity, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RoleType, Signer, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { signerToSignerValue, signerValueToSignatory } from '~/utils/conversion';

export interface RemoveSecondaryKeysParams {
  signers: Signer[];
}

export type Params = RemoveSecondaryKeysParams & {
  identity: Identity;
};

/**
 * @hidden
 */
export async function prepareRemoveSecondaryKeys(
  this: Procedure<Params>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { signers, identity } = args;

  const [primaryKey, secondaryKeys] = await Promise.all([
    identity.getPrimaryKey(),
    identity.getSecondaryKeys(),
  ]);

  const signerValues = signers.map(signer => signerToSignerValue(signer));
  const isPrimaryKeyPresent = find(signerValues, ({ value }) => value === primaryKey.address);

  if (isPrimaryKeyPresent) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You cannot remove the primary key',
    });
  }

  assertSecondaryKeys(signerValues, secondaryKeys);

  this.addTransaction(
    tx.identity.removeSecondaryKeys,
    {},
    signerValues.map(signer => signerValueToSignatory(signer, context))
  );
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params>,
  { identity: { did } }: Params
): ProcedureAuthorization {
  return {
    roles: [{ type: RoleType.Identity, did }],
    permissions: {
      transactions: [TxTags.identity.RemoveSecondaryKeys],
      tokens: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removeSecondaryKeys = (): Procedure<Params> =>
  new Procedure(prepareRemoveSecondaryKeys, getAuthorization);
