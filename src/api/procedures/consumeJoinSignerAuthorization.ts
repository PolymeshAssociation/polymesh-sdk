import { TxTag, TxTags } from 'polymesh-types/types';

import { Account, AuthorizationRequest, Identity, PolymeshError, Procedure } from '~/internal';
import { AuthorizationType, ErrorCode } from '~/types';
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
export type ConsumeJoinSignerAuthorizationParams = {
  authRequest: AuthorizationRequest;
  accept: boolean;
};

/**
 * @hidden
 */
export async function prepareConsumeJoinSignerAuthorization(
  this: Procedure<ConsumeJoinSignerAuthorizationParams>,
  args: ConsumeJoinSignerAuthorizationParams
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

  const {
    target,
    authId,
    data: { type },
    expiry,
    issuer,
  } = authRequest;

  if (authRequest.isExpired()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Authorization Request has expired',
      data: {
        expiry,
      },
    });
  }

  let transaction;

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

  const isMultiSig = type === AuthorizationType.AddMultiSigSigner;

  if (target instanceof Account) {
    transaction = isMultiSig ? multiSig.acceptMultisigSignerAsKey : identity.joinIdentityAsKey;
  } else {
    transaction = isMultiSig
      ? multiSig.acceptMultisigSignerAsIdentity
      : identity.joinIdentityAsIdentity;
  }

  this.addTransaction(transaction, { paidForBy: issuer }, rawAuthId);
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<ConsumeJoinSignerAuthorizationParams>,
  { authRequest, accept }: ConsumeJoinSignerAuthorizationParams
): Promise<ProcedureAuthorization> {
  const {
    target,
    issuer,
    data: { type },
  } = authRequest;
  const { context } = this;

  let roles;
  let transactions: TxTag[] = [];
  let bypassSignerPermissions = false;
  let identity: Identity | null;
  const currentAccount = context.getCurrentAccount();

  const fetchIdentity = async () =>
    identity === undefined ? currentAccount.getIdentity() : identity;

  if (target instanceof Account) {
    roles = currentAccount.address === target.address;
    // if the current account is joining an identity or multisig, it doesn't need (and couldn't possibly have) any permissions
    bypassSignerPermissions = roles;
  } else {
    identity = await fetchIdentity();
    roles = identity?.did === target.did;
    transactions = [
      type === AuthorizationType.AddMultiSigSigner
        ? TxTags.multiSig.AcceptMultisigSignerAsIdentity
        : TxTags.identity.JoinIdentityAsIdentity,
    ];
  }

  if (!accept) {
    transactions = [TxTags.identity.RemoveAuthorization];

    identity = await fetchIdentity();
    // both the issuer and the target can remove the authorization request
    roles = roles || identity?.did === issuer.did;
  }

  if (bypassSignerPermissions) {
    return {
      roles,
    };
  }

  return {
    roles,
    permissions: { transactions, tokens: [], portfolios: [] },
  };
}

/**
 * @hidden
 */
export const consumeJoinSignerAuthorization = (): Procedure<ConsumeJoinSignerAuthorizationParams> =>
  new Procedure(prepareConsumeJoinSignerAuthorization, getAuthorization);
