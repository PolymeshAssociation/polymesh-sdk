import { assertSecondaryAccounts } from '~/api/procedures/utils';
import { Identity, Procedure } from '~/internal';
import { Account, ModifySignerPermissionsParams, TxTags } from '~/types';
import { BatchTransactionSpec, ExtrinsicParams, ProcedureAuthorization } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  permissionsLikeToPermissions,
  permissionsToMeshPermissions,
  stringToAccountId,
} from '~/utils/conversion';
import { areSameAccounts, asAccount, getSecondaryAccountPermissions } from '~/utils/internal';

/**
 * @hidden
 */
export interface Storage {
  identity: Identity;
  actingAccount: Account;
}

/**
 * @hidden
 */
export async function prepareModifySignerPermissions(
  this: Procedure<ModifySignerPermissionsParams, void, Storage>,
  args: ModifySignerPermissionsParams
): Promise<
  BatchTransactionSpec<void, ExtrinsicParams<'identity', 'setSecondaryKeyPermissions'>[]>
> {
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

    const { address } = asAccount(account, context);
    const rawSignatory = stringToAccountId(address, context);

    return tuple(rawSignatory, rawPermissions);
  });

  const transaction = tx.identity.setSecondaryKeyPermissions;

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
    storage: { identity, actingAccount },
  } = this;

  const { account: primaryAccount } = await identity.getPrimaryAccount();

  if (!areSameAccounts(actingAccount, primaryAccount)) {
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

  const [identity, actingAccount] = await Promise.all([
    context.getSigningIdentity(),
    context.getActingAccount(),
  ]);

  return {
    identity,
    actingAccount,
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
