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

  let hasRoles;
  let transactions: TxTag[] = [];

  const currentAccount = context.getCurrentAccount();
  const identity = await currentAccount.getIdentity();

  let calledByTarget: boolean;

  if (target instanceof Account) {
    calledByTarget = currentAccount.address === target.address;
    hasRoles = calledByTarget;
    transactions = [TxTags.multiSig.AcceptMultisigSignerAsKey];
  } else {
    calledByTarget = !!identity?.isEqual(target);
    hasRoles = calledByTarget;
    transactions = [TxTags.multiSig.AcceptMultisigSignerAsIdentity];
  }

  if (accept) {
    return {
      roles:
        hasRoles ||
        '"AddMultiSigSigner" Authorization Requests can only be accepted by the target Signer',
      permissions: {
        transactions,
      },
    };
  }

  transactions = [TxTags.identity.RemoveAuthorization];

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
      '"AddMultiSigSigner" Authorization Request can only be removed by the issuing Identity or the target Signer',
    permissions: { transactions },
  };
}

/**
 * @hidden
 */
export const consumeAddMultiSigSignerAuthorization = (): Procedure<ConsumeAddMultiSigSignerAuthorizationParams> =>
  new Procedure(prepareConsumeAddMultiSigSignerAuthorization, getAuthorization);
