import { TxTag, TxTags } from 'polymesh-types/types';

import { Account, AuthorizationRequest, Identity, PolymeshError, Procedure } from '~/internal';
import { ErrorCode } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  booleanToBool,
  numberToU64,
  signerToSignerValue,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';

/**
 * @hidden
 */
export interface ConsumeAddMultiSigSignerAuthorizationParams {
  authRequest: AuthorizationRequest;
  accept: boolean;
}

/**
 * @hidden
 */
export async function prepareConsumeAddMultiSigSignerAuthorization(
  this: Procedure<ConsumeAddMultiSigSignerAuthorizationParams>,
  args: ConsumeAddMultiSigSignerAuthorizationParams
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { identity, multiSig },
      },
    },
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
    const { address } = context.getCurrentAccount();

    const paidByThirdParty = address === signerToString(target);
    const opts: { paidForBy?: Identity } = {};

    if (paidByThirdParty) {
      opts.paidForBy = issuer;
    }

    this.addTransaction(
      identity.removeAuthorization,
      opts,
      signerValueToSignatory(signerToSignerValue(target), context),
      rawAuthId,
      booleanToBool(paidByThirdParty, context)
    );

    return;
  }

  let transaction = multiSig.acceptMultisigSignerAsIdentity;

  if (target instanceof Account) {
    const existingIdentity = await target.getIdentity();

    if (existingIdentity) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The target Account is already part of an Identity',
      });
    }

    transaction = multiSig.acceptMultisigSignerAsKey;
  }

  this.addTransaction(transaction, { paidForBy: issuer }, rawAuthId);
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<ConsumeAddMultiSigSignerAuthorizationParams>,
  { authRequest, accept }: ConsumeAddMultiSigSignerAuthorizationParams
): Promise<ProcedureAuthorization> {
  const { target, issuer } = authRequest;
  const { context } = this;

  let roles;
  let transactions: TxTag[] = [];

  const currentAccount = context.getCurrentAccount();
  const identity = await currentAccount.getIdentity();

  let calledByTarget: boolean;

  if (target instanceof Account) {
    calledByTarget = currentAccount.address === target.address;
    roles = calledByTarget;
    transactions = [TxTags.multiSig.AcceptMultisigSignerAsKey];
  } else {
    calledByTarget = !!identity?.isEqual(target);
    roles = calledByTarget;
    transactions = [TxTags.multiSig.AcceptMultisigSignerAsIdentity];
  }

  if (accept) {
    return {
      roles,
      permissions: {
        transactions,
      },
    };
  }

  transactions = [TxTags.identity.RemoveAuthorization];

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
    permissions: { transactions },
  };
}

/**
 * @hidden
 */
export const consumeAddMultiSigSignerAuthorization = (): Procedure<ConsumeAddMultiSigSignerAuthorizationParams> =>
  new Procedure(prepareConsumeAddMultiSigSignerAuthorization, getAuthorization);
