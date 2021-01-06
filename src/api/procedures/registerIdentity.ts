import { ISubmittableResult } from '@polkadot/types/types';
import { IdentityId, TxTags } from 'polymesh-types/types';

import { Account, Context, Identity, PostTransactionValue, Procedure } from '~/internal';
import { RoleType, SecondaryKey } from '~/types';
import {
  identityIdToString,
  secondaryKeyToMeshSecondaryKey,
  signerToString,
  stringToAccountId,
} from '~/utils/conversion';
import { findEventRecord } from '~/utils/internal';

export interface RegisterIdentityParams {
  targetAccount: string | Account;
  secondaryKeys?: SecondaryKey[];
}

/**
 * @hidden
 */
export const createRegisterIdentityResolver = (context: Context) => (
  receipt: ISubmittableResult
): Identity => {
  const eventRecord = findEventRecord(receipt, 'identity', 'DidCreated');
  const data = eventRecord.event.data;
  const did = identityIdToString(data[0] as IdentityId);

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
  const rawSecondaryKeys = secondaryKeys.map(secondaryKey =>
    secondaryKeyToMeshSecondaryKey(secondaryKey, context)
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
