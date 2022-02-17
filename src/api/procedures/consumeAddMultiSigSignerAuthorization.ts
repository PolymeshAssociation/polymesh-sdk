import { TxTag, TxTags } from 'polymesh-types/types';

import { assertAuthorizationRequestValid } from '~/api/procedures/utils';
import { Account, AuthorizationRequest, Identity, Procedure } from '~/internal';
import { ProcedureAuthorization } from '~/types/internal';
import {
  bigNumberToU64,
  booleanToBool,
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

  const { target, authId, issuer } = authRequest;

  const rawAuthId = bigNumberToU64(authId, context);

  if (!accept) {
    const { address } = context.getCurrentAccount();

    const paidByThirdParty = address === signerToString(target);
    const addTransactionArgs: { paidForBy?: Identity } = {};

    if (paidByThirdParty) {
      addTransactionArgs.paidForBy = issuer;
    }

    this.addTransaction({
      transaction: identity.removeAuthorization,
      ...addTransactionArgs,
      args: [
        signerValueToSignatory(signerToSignerValue(target), context),
        rawAuthId,
        booleanToBool(paidByThirdParty, context),
      ],
    });

    return;
  }

  await assertAuthorizationRequestValid(authRequest, context);

  if (target instanceof Account) {
    const transaction = multiSig.acceptMultisigSignerAsKey;
    this.addTransaction({ transaction, paidForBy: issuer, args: [rawAuthId] });
  } else {
    const transaction = multiSig.acceptMultisigSignerAsIdentity;
    this.addTransaction({ transaction, paidForBy: issuer, args: [rawAuthId] });
  }
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

  let permissions;
  if (target instanceof Account) {
    calledByTarget = currentAccount.address === target.address;
    hasRoles = calledByTarget;
    transactions = [TxTags.multiSig.AcceptMultisigSignerAsKey];
    // An account accepting multisig cannot be part of an Identity, so we cannot check for permissions
  } else {
    calledByTarget = !!identity?.isEqual(target);
    hasRoles = calledByTarget;
    transactions = [TxTags.multiSig.AcceptMultisigSignerAsIdentity];
    permissions = { transactions };
  }

  if (accept) {
    return {
      roles:
        hasRoles ||
        '"AddMultiSigSigner" Authorization Requests can only be accepted by the target Signer',
      permissions,
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
export const consumeAddMultiSigSignerAuthorization =
  (): Procedure<ConsumeAddMultiSigSignerAuthorizationParams> =>
    new Procedure(prepareConsumeAddMultiSigSignerAuthorization, getAuthorization);
