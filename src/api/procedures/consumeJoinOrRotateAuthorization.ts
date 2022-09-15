import { assertAuthorizationRequestValid } from '~/api/procedures/utils';
import { Account, AuthorizationRequest, Identity, PolymeshError, Procedure } from '~/internal';
import { AuthorizationType, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  bigNumberToU64,
  booleanToBool,
  signerToSignerValue,
  signerValueToSignatory,
} from '~/utils/conversion';

/**
 * @hidden
 */
export interface ConsumeJoinOrRotateAuthorizationParams {
  authRequest: AuthorizationRequest;
  accept: boolean;
}

export interface Storage {
  signingAccount: Account;
  calledByTarget: boolean;
}

/**
 * @hidden
 *
 * Consumes JoinIdentity, RotatePrimaryKey and RotatePrimaryKeyToSecondaryKey Authorizations
 */
export async function prepareConsumeJoinOrRotateAuthorization(
  this: Procedure<ConsumeJoinOrRotateAuthorizationParams, void, Storage>,
  args: ConsumeJoinOrRotateAuthorizationParams
): Promise<
  | TransactionSpec<void, ExtrinsicParams<'identity', 'removeAuthorization'>>
  | TransactionSpec<void, ExtrinsicParams<'identity', 'joinIdentityAsKey'>>
  | TransactionSpec<void, ExtrinsicParams<'identity', 'acceptPrimaryKey'>>
  | TransactionSpec<void, ExtrinsicParams<'identity', 'rotatePrimaryKeyToSecondary'>>
> {
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

  const {
    target,
    authId,
    issuer,
    data: { type },
  } = authRequest;

  if (
    ![
      AuthorizationType.JoinIdentity,
      AuthorizationType.RotatePrimaryKeyToSecondary,
      AuthorizationType.RotatePrimaryKey,
    ].includes(type)
  ) {
    throw new PolymeshError({
      code: ErrorCode.UnexpectedError,
      message: `Unrecognized auth type: "${type}" for consumeJoinOrRotateAuthorization method`,
    });
  }

  const rawAuthId = bigNumberToU64(authId, context);

  if (!accept) {
    const baseArgs: { paidForBy?: Identity } = {};

    if (calledByTarget) {
      baseArgs.paidForBy = issuer;
    }

    return {
      transaction: identity.removeAuthorization,
      ...baseArgs,
      args: [
        signerValueToSignatory(signerToSignerValue(target), context),
        rawAuthId,
        booleanToBool(calledByTarget, context),
      ],
      resolver: undefined,
    };
  }

  await assertAuthorizationRequestValid(authRequest, context);

  if (type === AuthorizationType.JoinIdentity) {
    return {
      transaction: identity.joinIdentityAsKey,
      paidForBy: issuer,
      args: [rawAuthId],
      resolver: undefined,
    };
  } else {
    const transaction =
      type === AuthorizationType.RotatePrimaryKey
        ? identity.acceptPrimaryKey
        : identity.rotatePrimaryKeyToSecondary;

    return {
      transaction,
      paidForBy: issuer,
      args: [rawAuthId, null],
      resolver: undefined,
    };
  }
}

/**
 * @hidden
 *
 * - If the auth is being accepted, we check that the caller is the target
 * - If the auth is being rejected, we check that the caller is either the target or the issuer
 */
export async function getAuthorization(
  this: Procedure<ConsumeJoinOrRotateAuthorizationParams, void, Storage>,
  { authRequest, accept }: ConsumeJoinOrRotateAuthorizationParams
): Promise<ProcedureAuthorization> {
  const { issuer } = authRequest;
  const {
    storage: { signingAccount, calledByTarget },
  } = this;
  let hasRoles = calledByTarget;

  const {
    data: { type },
  } = authRequest;

  /*
   * when accepting a JoinIdentity request, you don't need permissions (and can't have them by definition),
   *   you just need to be the target
   */
  if (accept) {
    return {
      roles: hasRoles || `"${type}" Authorization Requests must be accepted by the target Account`,
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
      `"${type}" Authorization Requests can only be removed by the issuer Identity or the target Account`,
    permissions: {
      transactions: [TxTags.identity.RemoveAuthorization],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<ConsumeJoinOrRotateAuthorizationParams, void, Storage>,
  { authRequest: { target } }: ConsumeJoinOrRotateAuthorizationParams
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
export const consumeJoinOrRotateAuthorization = (): Procedure<
  ConsumeJoinOrRotateAuthorizationParams,
  void,
  Storage
> => new Procedure(prepareConsumeJoinOrRotateAuthorization, getAuthorization, prepareStorage);
