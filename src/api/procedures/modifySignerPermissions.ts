import { assertSecondaryAccounts } from '~/api/procedures/utils';
import { Identity, Procedure } from '~/internal';
import { ModifySignerPermissionsParams, TxTags } from '~/types';
import { BatchTransactionSpec, ExtrinsicParams, ProcedureAuthorization } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  permissionsLikeToPermissions,
  permissionsToMeshPermissions,
  signerToSignerValue,
  signerValueToSignatory,
} from '~/utils/conversion';
import { asAccount, getSecondaryAccountPermissions } from '~/utils/internal';

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
): Promise<BatchTransactionSpec<void, ExtrinsicParams<'identity', 'setPermissionToSigner'>[]>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: { identity },
  } = this;

  const { secondaryAccounts } = args;
  const accounts = secondaryAccounts.map(({ account }) => asAccount(account, context));
  const existingSecondaryAccounts = await getSecondaryAccountPermissions(
    { accounts, identity },
    context
  );
  assertSecondaryAccounts(accounts, existingSecondaryAccounts);

  const signersList = secondaryAccounts.map(({ account, permissions: permissionsLike }) => {
    const permissions = permissionsLikeToPermissions(permissionsLike, context);

    const rawPermissions = permissionsToMeshPermissions(permissions, context);

    return tuple(
      signerValueToSignatory(signerToSignerValue(asAccount(account, context)), context),
      rawPermissions
    );
  });

  const transaction = tx.identity.setPermissionToSigner;

  return {
    transactions: signersList.map(params => ({
      transaction,
      args: params,
    })),
    resolver: undefined,
  };
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
