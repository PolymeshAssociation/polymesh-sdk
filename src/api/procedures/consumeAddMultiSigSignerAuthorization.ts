import { assertAuthorizationRequestValid } from '~/api/procedures/utils';
import { Account, AuthorizationRequest, Identity, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTag, TxTags } from '~/types';
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

  await assertAuthorizationRequestValid(authRequest, context);

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

  this.addTransaction({ transaction, paidForBy: issuer, args: [rawAuthId] });
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
    calledByTarget = target.isEqual(currentAccount);
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
export const consumeAddMultiSigSignerAuthorization =
  (): Procedure<ConsumeAddMultiSigSignerAuthorizationParams> =>
    new Procedure(prepareConsumeAddMultiSigSignerAuthorization, getAuthorization);
