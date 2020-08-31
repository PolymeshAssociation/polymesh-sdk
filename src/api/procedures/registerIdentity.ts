import { Identity } from '~/api/entities';
import { Procedure } from '~/base';
import { Role, RoleType, SigningKey } from '~/types';
import { dateToMoment, signingKeyToMeshSigningKey, valueToDid } from '~/utils';

export interface RegisterIdentityParams {
  target: string | Identity;
  expiry?: Date;
  signingKeys?: SigningKey[];
}

/**
 * @hidden
 */
export async function prepareRegisterIdentity(
  this: Procedure<RegisterIdentityParams, void>,
  args: RegisterIdentityParams
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    context,
  } = this;
  const { target, expiry, signingKeys = [] } = args;

  const rawTarget = valueToDid(target);
  const rawExpiry = expiry ? dateToMoment(expiry, context) : null;
  const rawSigningKeys = signingKeys.map(signingKey =>
    signingKeyToMeshSigningKey(signingKey, context)
  );

  this.addTransaction(identity.cddRegisterDid, {}, rawTarget, rawExpiry, rawSigningKeys);
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
