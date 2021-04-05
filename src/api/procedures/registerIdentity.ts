import { ISubmittableResult } from '@polkadot/types/types';
import { TxTags } from 'polymesh-types/types';

import { Account, Context, Identity, PostTransactionValue, Procedure } from '~/internal';
import { PermissionsLike, RoleType, SecondaryKey } from '~/types';
import {
  identityIdToString,
  permissionsLikeToPermissions,
  secondaryKeyToMeshSecondaryKey,
  signerToString,
  stringToAccountId,
} from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

export interface RegisterIdentityParams {
  targetAccount: string | Account;
  secondaryKeys?: (Omit<SecondaryKey, 'permissions'> & { permissions: PermissionsLike })[];
}

/**
 * @hidden
 */
export const createRegisterIdentityResolver = (context: Context) => (
  receipt: ISubmittableResult
): Identity => {
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
): Promise<PostTransactionValue<Identity>> {
  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    context,
  } = this;
  const { targetAccount, secondaryKeys = [] } = args;

  const rawTargetAccount = stringToAccountId(signerToString(targetAccount), context);
  const rawSecondaryKeys = secondaryKeys.map(({ permissions, ...rest }) =>
    secondaryKeyToMeshSecondaryKey(
      { ...rest, permissions: permissionsLikeToPermissions(permissions, context) },
      context
    )
  );

  const [newIdentity] = this.addTransaction(
    identity.cddRegisterDid,
    {
      resolvers: [createRegisterIdentityResolver(context)],
    },
    rawTargetAccount,
    rawSecondaryKeys
  );

  return newIdentity;
}

/**
 * @hidden
 */
export const registerIdentity = new Procedure(prepareRegisterIdentity, {
  identityRoles: [{ type: RoleType.CddProvider }],
  signerPermissions: {
    tokens: [],
    portfolios: [],
    transactions: [TxTags.identity.CddRegisterDid],
  },
});
