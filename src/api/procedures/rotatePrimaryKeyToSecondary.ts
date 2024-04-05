import { createAuthorizationResolver } from '~/api/procedures/utils';
import { PolymeshError, Procedure } from '~/internal';
import {
  Authorization,
  AuthorizationRequest,
  AuthorizationType,
  ErrorCode,
  RotatePrimaryKeyToSecondaryParams,
  TxTags,
} from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  expiryToMoment,
  permissionsLikeToPermissions,
  signerToSignatory,
  signerToString,
} from '~/utils/conversion';
import { asAccount } from '~/utils/internal';

/**
 * @hidden
 */
export async function prepareRotatePrimaryKeyToSecondary(
  this: Procedure<RotatePrimaryKeyToSecondaryParams, AuthorizationRequest>,
  args: RotatePrimaryKeyToSecondaryParams
): Promise<TransactionSpec<AuthorizationRequest, ExtrinsicParams<'identity', 'addAuthorization'>>> {
  const {
    context: {
      polymeshApi: {
        tx: {
          identity: { addAuthorization },
        },
      },
    },
    context,
  } = this;
  const { permissions, targetAccount, expiry } = args;

  const issuerIdentity = await context.getSigningIdentity();

  const target = asAccount(targetAccount, context);

  const [authorizationRequests, targetIdentity, primaryAccount] = await Promise.all([
    issuerIdentity.authorizations.getSent(),
    target.getIdentity(),
    issuerIdentity.getPrimaryAccount(),
  ]);

  const pendingAuthorization = authorizationRequests.data.some(authorizationRequest => {
    const {
      target: targetSigner,
      data: { type },
    } = authorizationRequest;
    return (
      signerToString(targetSigner) === targetAccount &&
      !authorizationRequest.isExpired() &&
      type === AuthorizationType.RotatePrimaryKeyToSecondary
    );
  });

  if (pendingAuthorization) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message:
        'The target Account already has a pending invitation to become the primary key of the given Identity',
      data: {
        pendingAuthorization,
      },
    });
  }

  if (targetIdentity && issuerIdentity.isEqual(targetIdentity)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The target Account is assigned to another Identity',
      data: {
        pendingAuthorization,
      },
    });
  }

  if (target.isEqual(primaryAccount.account)) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The target Account is already the primary key of the given Identity',
      data: {
        pendingAuthorization,
      },
    });
  }

  const rawSignatory = signerToSignatory(target, context);

  const authorization: Authorization = {
    type: AuthorizationType.RotatePrimaryKeyToSecondary,
    value: permissionsLikeToPermissions(permissions, context),
  };

  const rawAuthorizationData = authorizationToAuthorizationData(authorization, context);

  const rawExpiry = expiryToMoment(expiry, context);

  return {
    transaction: addAuthorization,
    args: [rawSignatory, rawAuthorizationData, rawExpiry],
    resolver: createAuthorizationResolver(
      authorization,
      issuerIdentity,
      target,
      expiry ?? null,
      context
    ),
  };
}

/**
 * @hidden
 */
export const rotatePrimaryKeyToSecondary = (): Procedure<
  RotatePrimaryKeyToSecondaryParams,
  AuthorizationRequest
> =>
  new Procedure(prepareRotatePrimaryKeyToSecondary, {
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [TxTags.identity.AddAuthorization],
    },
  });
