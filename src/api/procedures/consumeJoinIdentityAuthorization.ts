import { TxTags } from 'polymesh-types/types';

import { Account, AuthorizationRequest, Identity, PolymeshError, Procedure } from '~/internal';
import { ErrorCode } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  booleanToBool,
  numberToU64,
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
  currentAccount: Account;
  calledByTarget: boolean;
  existingIdentity: Identity | null;
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
    storage: { calledByTarget, existingIdentity },
    context,
  } = this;
  const { authRequest, accept } = args;

  const { target, authId, expiry, issuer } = authRequest;

  if (authRequest.isExpired()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Authorization Request has expired',
      data: {
        expiry,
      },
    });
  }

  const rawAuthId = numberToU64(authId, context);

  if (!accept) {
    const opts: { paidForBy?: Identity } = {};

    if (calledByTarget) {
      opts.paidForBy = issuer;
    }

    this.addTransaction(
      identity.removeAuthorization,
      opts,
      signerValueToSignatory(signerToSignerValue(target), context),
      rawAuthId,
      booleanToBool(calledByTarget, context)
    );

    return;
  }

  if (existingIdentity) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'This Account is already part of an Identity',
    });
  }

  this.addTransaction(identity.joinIdentityAsKey, { paidForBy: issuer }, rawAuthId);
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
    storage: { currentAccount, calledByTarget },
  } = this;

  let roles = calledByTarget;

  if (accept) {
    return {
      roles,
      permissions: {
        transactions: [TxTags.identity.JoinIdentityAsKey],
      },
    };
  }

  const identity = await currentAccount.getIdentity();

  // both the issuer and the target can remove the authorization request
  roles = roles || !!identity?.isEqual(issuer);

  /*
   * if the target is removing the auth request and they don't have an Identity,
   *   no permissions are required
   */
  if (calledByTarget && !identity) {
    return {
      roles,
    };
  }

  return {
    roles,
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

  // joinIdentity Authorizations always target an Account
  const targetAccount = target as Account;
  const currentAccount = context.getCurrentAccount();
  const calledByTarget = targetAccount.isEqual(currentAccount);
  const existingIdentity = await targetAccount.getIdentity();

  return {
    currentAccount,
    calledByTarget,
    existingIdentity,
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
