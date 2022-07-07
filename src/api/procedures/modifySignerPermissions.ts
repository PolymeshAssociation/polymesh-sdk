import { assertSecondaryAccounts } from '~/api/procedures/utils';
import { Identity, Procedure } from '~/internal';
import { ModifySignerPermissionsParams, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  permissionsLikeToPermissions,
  permissionsToMeshPermissions,
  signerToSignerValue,
  signerValueToSignatory,
} from '~/utils/conversion';

/**
 * @hidden
 */
export interface Storage {
  identity: Identity;
}

/**
 * @hidden
 */
export async function prepareModifySignerPermissions(
  this: Procedure<ModifySignerPermissionsParams, void, Storage>,
  args: ModifySignerPermissionsParams
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: { identity },
  } = this;

  const { secondaryAccounts } = args;

  const existingSecondaryAccounts = await identity.getSecondaryAccounts();

  assertSecondaryAccounts(
    secondaryAccounts.map(({ account }) => account),
    existingSecondaryAccounts
  );

  const signersList = secondaryAccounts.map(({ account, permissions: permissionsLike }) => {
    const permissions = permissionsLikeToPermissions(permissionsLike, context);

    const rawPermissions = permissionsToMeshPermissions(permissions, context);

    return tuple(signerValueToSignatory(signerToSignerValue(account), context), rawPermissions);
  });

  const transaction = tx.identity.setPermissionToSigner;

  this.addBatchTransaction({
    transactions: signersList.map(params => ({
      transaction,
      args: params,
    })),
  });
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<ModifySignerPermissionsParams, void, Storage>
): Promise<ProcedureAuthorization> {
  const {
    context,
    storage: { identity },
  } = this;

  const signingAccount = context.getSigningAccount();
  const { account: primaryAccount } = await identity.getPrimaryAccount();

  if (!signingAccount.isEqual(primaryAccount)) {
    return {
      signerPermissions:
        "Secondary Account permissions can only be modified by the Identity's primary Account",
    };
  }

  return {
    permissions: {
      transactions: [TxTags.identity.SetPermissionToSigner],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<ModifySignerPermissionsParams, void, Storage>
): Promise<Storage> {
  const { context } = this;

  return {
    identity: await context.getSigningIdentity(),
  };
}

/**
 * @hidden
 */
export const modifySignerPermissions = (): Procedure<
  ModifySignerPermissionsParams,
  void,
  Storage
> => new Procedure(prepareModifySignerPermissions, getAuthorization, prepareStorage);
