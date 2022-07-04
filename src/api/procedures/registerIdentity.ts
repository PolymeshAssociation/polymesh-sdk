import { ISubmittableResult } from '@polkadot/types/types';

import { Account, Context, Identity, Procedure } from '~/internal';
import { PermissionedAccount, PermissionsLike, RoleType, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import { Modify } from '~/types/utils';
import {
  identityIdToString,
  permissionsLikeToPermissions,
  secondaryAccountToMeshSecondaryKey,
  signerToString,
  stringToAccountId,
} from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

export interface RegisterIdentityParams {
  targetAccount: string | Account;
  secondaryAccounts?: Modify<PermissionedAccount, { permissions: PermissionsLike }>[];
}

/**
 * @hidden
 */
export const createRegisterIdentityResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): Identity => {
    const [{ data }] = filterEventRecords(receipt, 'identity', 'DidCreated');
    const did = identityIdToString(data[0]);

    return new Identity({ did }, context);
  };

/**
 * @hidden
 */
export async function prepareRegisterIdentity(
  this: Procedure<RegisterIdentityParams, Identity>,
  args: RegisterIdentityParams
): Promise<TransactionSpec<Identity, ExtrinsicParams<'identity', 'cddRegisterDid'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    context,
  } = this;
  const { targetAccount, secondaryAccounts = [] } = args;

  const rawTargetAccount = stringToAccountId(signerToString(targetAccount), context);
  const rawSecondaryKeys = secondaryAccounts.map(({ permissions, ...rest }) =>
    secondaryAccountToMeshSecondaryKey(
      { ...rest, permissions: permissionsLikeToPermissions(permissions, context) },
      context
    )
  );

  return {
    transaction: identity.cddRegisterDid,
    args: [rawTargetAccount, rawSecondaryKeys],
    resolver: createRegisterIdentityResolver(context),
  };
}

/**
 * @hidden
 */
export const registerIdentity = (): Procedure<RegisterIdentityParams, Identity> =>
  new Procedure(prepareRegisterIdentity, {
    roles: [{ type: RoleType.CddProvider }],
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [TxTags.identity.CddRegisterDid],
    },
  });
