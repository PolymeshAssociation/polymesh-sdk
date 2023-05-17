import { createAuthorizationResolver } from '~/api/procedures/utils';
import { PolymeshError, Procedure } from '~/internal';
import {
  Authorization,
  AuthorizationRequest,
  AuthorizationType,
  ErrorCode,
  RotatePrimaryKeyParams,
  TxTags,
} from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  expiryToMoment,
  signerToSignatory,
  signerToString,
} from '~/utils/conversion';
import { asAccount } from '~/utils/internal';

/**
 * @hidden
 */
export async function prepareRotatePrimaryKey(
  this: Procedure<RotatePrimaryKeyParams, AuthorizationRequest>,
  args: RotatePrimaryKeyParams
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
  const { targetAccount, expiry } = args;

  const issuerIdentity = await context.getSigningIdentity();

  const target = asAccount(targetAccount, context);

  const authorizationRequests = await issuerIdentity.authorizations.getSent();
  const pendingAuthorization = authorizationRequests.data.find(authorizationRequest => {
    const {
      target: targetSigner,
      data: { type },
    } = authorizationRequest;
    return (
      signerToString(targetSigner) === targetAccount &&
      !authorizationRequest.isExpired() &&
      type === AuthorizationType.RotatePrimaryKey
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

  const rawSignatory = signerToSignatory(target, context);

  const authorization: Authorization = {
    type: AuthorizationType.RotatePrimaryKey,
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
export const rotatePrimaryKey = (): Procedure<RotatePrimaryKeyParams, AuthorizationRequest> =>
  new Procedure(prepareRotatePrimaryKey, {
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [TxTags.identity.AddAuthorization],
    },
  });
