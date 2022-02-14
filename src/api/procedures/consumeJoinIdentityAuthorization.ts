import { TxTags } from 'polymesh-types/types';

import { assertAuthorizationRequestValid } from '~/api/procedures/utils';
import { Account, AuthorizationRequest, Identity, Procedure } from '~/internal';
import { ProcedureAuthorization } from '~/types/internal';
import {
  bigNumberToU64,
  booleanToBool,
  signerToSignerValue,
  signerValueToSignatory,
} from '~/utils/conversion';

/**
 * @hidden
 */
export interface ConsumeJoinIdentityAuthorizationParams {
  authRequest: AuthorizationRequest;
  accept: boolean;
}

export interface Storage {
  signingAccount: Account;
  calledByTarget: boolean;
}

/**
 * @hidden
 */
export async function prepareConsumeJoinIdentityAuthorization(
  this: Procedure<ConsumeJoinIdentityAuthorizationParams, void, Storage>,
  args: ConsumeJoinIdentityAuthorizationParams
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    storage: { calledByTarget },
    context,
  } = this;
  const { authRequest, accept } = args;

  const { target, authId, issuer } = authRequest;

  const rawAuthId = bigNumberToU64(authId, context);

  if (!accept) {
    const baseArgs: { paidForBy?: Identity } = {};

    if (calledByTarget) {
      baseArgs.paidForBy = issuer;
    }

    this.addTransaction({
      transaction: identity.removeAuthorization,
      ...baseArgs,
      args: [
        signerValueToSignatory(signerToSignerValue(target), context),
        rawAuthId,
        booleanToBool(calledByTarget, context),
      ],
    });

    return;
  }

  await assertAuthorizationRequestValid(authRequest, context);

  this.addTransaction({
    transaction: identity.joinIdentityAsKey,
    paidForBy: issuer,
    args: [rawAuthId],
  });
}

/**
 * @hidden
 *
 * - If the auth is being accepted, we check that the caller is the target
 * - If the auth is being rejected, we check that the caller is either the target or the issuer
 */
export async function getAuthorization(
  this: Procedure<ConsumeJoinIdentityAuthorizationParams, void, Storage>,
  { authRequest, accept }: ConsumeJoinIdentityAuthorizationParams
): Promise<ProcedureAuthorization> {
  const { issuer } = authRequest;
  const {
    storage: { signingAccount, calledByTarget },
  } = this;

  let hasRoles = calledByTarget;

  /*
   * when accepting a JoinIdentity request, you don't need permissions (and can't have them by definition),
   *   you just need to be the target
   */
  if (accept) {
    return {
      roles:
        hasRoles || '"JoinIdentity" Authorization Requests must be accepted by the target Account',
    };
  }

  const identity = await signingAccount.getIdentity();

  /*
   * if the target is removing the auth request and they don't have an Identity,
   *   no permissions are required
   */
  if (calledByTarget && !identity) {
    return {
      roles: true,
    };
  }

  // both the issuer and the target can remove the authorization request
  hasRoles = hasRoles || !!identity?.isEqual(issuer);

  return {
    roles:
      hasRoles ||
      '"JoinIdentity" Authorization Requests can only be removed by the issuer Identity or the target Account',
    permissions: {
      transactions: [TxTags.identity.RemoveAuthorization],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<ConsumeJoinIdentityAuthorizationParams, void, Storage>,
  { authRequest: { target } }: ConsumeJoinIdentityAuthorizationParams
): Promise<Storage> {
  const { context } = this;

  // JoinIdentity Authorizations always target an Account
  const targetAccount = target as Account;
  const signingAccount = context.getSigningAccount();
  const calledByTarget = targetAccount.isEqual(signingAccount);

  return {
    signingAccount,
    calledByTarget,
  };
}

/**
 * @hidden
 */
export const consumeJoinIdentityAuthorization = (): Procedure<
  ConsumeJoinIdentityAuthorizationParams,
  void,
  Storage
> => new Procedure(prepareConsumeJoinIdentityAuthorization, getAuthorization, prepareStorage);
