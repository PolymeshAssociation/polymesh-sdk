import { ISubmittableResult } from '@polkadot/types/types';

import { Identity } from '~/api/entities';
import { PostTransactionValue, Procedure } from '~/base';
import { Context } from '~/context';
import { IdentityId } from '~/polkadot';
import { Role, RoleType, SigningKey } from '~/types';
import {
  dateToMoment,
  findEventRecord,
  identityIdToString,
  signingKeyToMeshSigningKey,
  stringToAccountId,
} from '~/utils';

export interface RegisterIdentityParams {
  targetAccount: string;
  expiry?: Date;
  signingKeys?: SigningKey[];
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
  const { targetAccount, expiry, signingKeys = [] } = args;

  const rawTargetAccount = stringToAccountId(targetAccount, context);
  const rawExpiry = expiry ? dateToMoment(expiry, context) : null;
  const rawSigningKeys = signingKeys.map(signingKey =>
    signingKeyToMeshSigningKey(signingKey, context)
  );

  const [newIdentity] = this.addTransaction(
    identity.cddRegisterDid,
    {
      resolvers: [createRegisterIdentityResolver(context)],
    },
    rawTargetAccount,
    rawExpiry,
    rawSigningKeys
  );

  return newIdentity;
}

/**
 * @hidden
 */
export function getRequiredRoles(): Role[] {
  return [{ type: RoleType.CddProvider }];
}

/**
 * @hidden
 */
export const registerIdentity = new Procedure(prepareRegisterIdentity, getRequiredRoles);
