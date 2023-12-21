import { createAuthorizationResolver } from '~/api/procedures/utils';
import { Procedure } from '~/internal';
import {
  AttestPrimaryKeyRotationParams,
  Authorization,
  AuthorizationRequest,
  AuthorizationType,
  RoleType,
  TxTags,
} from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  expiryToMoment,
  signerToSignatory,
} from '~/utils/conversion';
import { asAccount, asIdentity, throwIfPendingAuthorizationExists } from '~/utils/internal';

/**
 * @hidden
 */
export async function prepareAttestPrimaryKeyRotation(
  this: Procedure<AttestPrimaryKeyRotationParams, AuthorizationRequest>,
  args: AttestPrimaryKeyRotationParams
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
  const { targetAccount, identity, expiry } = args;

  const issuerIdentity = await context.getSigningIdentity();

  const target = asAccount(targetAccount, context);
  const targetIdentity = asIdentity(identity, context);

  const authorizationRequests = await target.authorizations.getReceived({
    type: AuthorizationType.AttestPrimaryKeyRotation,
    includeExpired: false,
  });

  const authorization: Authorization = {
    type: AuthorizationType.AttestPrimaryKeyRotation,
    value: targetIdentity,
  };

  throwIfPendingAuthorizationExists({
    authorizationRequests,
    message:
      'The target Account already has a pending attestation to become the primary key of the target Identity',
    authorization,
  });

  const rawSignatory = signerToSignatory(target, context);

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
export const attestPrimaryKeyRotation = (): Procedure<
  AttestPrimaryKeyRotationParams,
  AuthorizationRequest
> =>
  new Procedure(prepareAttestPrimaryKeyRotation, {
    roles: [{ type: RoleType.CddProvider }],
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [TxTags.identity.AddAuthorization],
    },
  });
