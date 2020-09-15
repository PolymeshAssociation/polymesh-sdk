import { Account, AuthorizationRequest } from '~/api/entities';
import { Procedure } from '~/base';
import { numberToU64 } from '~/utils';

console.log('PROCEDURE', Procedure);

/**
 * @hidden
 */
export type AcceptJoinIdentityAuthorizationParams = {
  authRequest: AuthorizationRequest;
};

/**
 * @hidden
 */
export async function prepareAcceptJoinIdentityAuthorization(
  this: Procedure<AcceptJoinIdentityAuthorizationParams>,
  args: AcceptJoinIdentityAuthorizationParams
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    context,
  } = this;
  const {
    authRequest: { target, authId },
  } = args;

  let transaction;

  if (target instanceof Account) {
    transaction = identity.joinIdentityAsKey;
  } else {
    transaction = identity.joinIdentityAsIdentity;
  }

  this.addTransaction(transaction, {}, numberToU64(authId, context));
}

/**
 * @hidden
 */
export async function isAuthorized(
  this: Procedure<AcceptJoinIdentityAuthorizationParams>,
  { authRequest }: AcceptJoinIdentityAuthorizationParams
): Promise<boolean> {
  const { target } = authRequest;
  const { context } = this;

  let condition;

  if (target instanceof Account) {
    const { address } = context.getCurrentAccount();
    condition = address === target.address;
  } else {
    const { did } = await context.getCurrentIdentity();
    condition = did === target.did;
  }

  return condition && !authRequest.isExpired();
}

/**
 * @hidden
 */
export const acceptJoinIdentityAuthorization = new Procedure(
  prepareAcceptJoinIdentityAuthorization,
  isAuthorized
);
