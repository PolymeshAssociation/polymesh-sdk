import { ISubmittableResult } from '@polkadot/types/types';
import { TxTags } from 'polymesh-types/types';

import { Account, Context, Identity, PostTransactionValue, Procedure } from '~/internal';
import { PermissionsLike, RoleType, SecondaryAccount } from '~/types';
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
  secondaryAccounts?: Modify<SecondaryAccount, { permissions: PermissionsLike }>[];
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
  const { targetAccount, secondaryAccounts = [] } = args;

  const rawTargetAccount = stringToAccountId(signerToString(targetAccount), context);
  const rawSecondaryKeys = secondaryAccounts.map(({ permissions, ...rest }) =>
    secondaryAccountToMeshSecondaryKey(
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
export const registerIdentity = (): Procedure<RegisterIdentityParams, Identity> =>
  new Procedure(prepareRegisterIdentity, {
    roles: [{ type: RoleType.CddProvider }],
    permissions: {
      tokens: [],
      portfolios: [],
      transactions: [TxTags.identity.CddRegisterDid],
    },
  });
