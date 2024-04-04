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
export interface ConsumeAddRelayerPayingKeyAuthorizationParams {
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
 * Consumes AddRelayerPayingKey Authorizations
 */
export async function prepareConsumeAddRelayerPayingKeyAuthorization(
  this: Procedure<ConsumeAddRelayerPayingKeyAuthorizationParams, void, Storage>,
  args: ConsumeAddRelayerPayingKeyAuthorizationParams
): Promise<
  | TransactionSpec<void, ExtrinsicParams<'identity', 'removeAuthorization'>>
  | TransactionSpec<void, ExtrinsicParams<'relayer', 'acceptPayingKey'>>
> {
  const {
    context: {
      polymeshApi: {
        tx: { relayer, identity },
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

  if (type !== AuthorizationType.AddRelayerPayingKey) {
    throw new PolymeshError({
      code: ErrorCode.UnexpectedError,
      message: `Unrecognized auth type: "${type}" for consumeAddRelayerPayingKeyAuthorization method`,
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

  return {
    transaction: relayer.acceptPayingKey,
    paidForBy: issuer,
    args: [rawAuthId],
    resolver: undefined,
  };
}

/**
 * @hidden
 *
 * - If the auth is being accepted, we check that the caller is the target
 * - If the auth is being rejected, we check that the caller is either the target or the issuer
 */
export async function getAuthorization(
  this: Procedure<ConsumeAddRelayerPayingKeyAuthorizationParams, void, Storage>,
  { authRequest, accept }: ConsumeAddRelayerPayingKeyAuthorizationParams
): Promise<ProcedureAuthorization> {
  const { issuer } = authRequest;
  const {
    storage: { signingAccount, calledByTarget },
  } = this;
  let hasRoles = calledByTarget;

  if (accept) {
    return {
      roles:
        hasRoles ||
        `"${AuthorizationType.AddRelayerPayingKey}" Authorization Requests must be accepted by the target Account`,
    };
  }

  const identity = await signingAccount.getIdentity();

  hasRoles = hasRoles || !!identity?.isEqual(issuer);

  return {
    roles:
      hasRoles ||
      `"${AuthorizationType.AddRelayerPayingKey}" Authorization Requests can only be removed by the issuer Identity or the target Account`,
    permissions: {
      transactions: [TxTags.identity.RemoveAuthorization],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<ConsumeAddRelayerPayingKeyAuthorizationParams, void, Storage>,
  { authRequest: { target } }: ConsumeAddRelayerPayingKeyAuthorizationParams
): Promise<Storage> {
  const { context } = this;

  // AddRelayerPayingKey Authorizations always target an Account
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
export const consumeAddRelayerPayingKeyAuthorization = (): Procedure<
  ConsumeAddRelayerPayingKeyAuthorizationParams,
  void,
  Storage
> =>
  new Procedure(prepareConsumeAddRelayerPayingKeyAuthorization, getAuthorization, prepareStorage);
