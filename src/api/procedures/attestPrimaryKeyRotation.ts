import { createAuthorizationResolver } from '~/api/procedures/utils';
import { PolymeshError, Procedure } from '~/internal';
import {
  AttestPrimaryKeyRotationParams,
  Authorization,
  AuthorizationRequest,
  AuthorizationType,
  ErrorCode,
  RoleType,
  TxTags,
} from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToSignatory,
} from '~/utils/conversion';
import { asAccount, asIdentity, optionize } from '~/utils/internal';

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
  const rawSignatory = signerToSignatory(target, context);

  const authRequest: Authorization = {
    type: AuthorizationType.AttestPrimaryKeyRotation,
    value: asIdentity(identity, context),
  };
  const rawAuthorizationData = authorizationToAuthorizationData(authRequest, context);

  if (expiry && expiry <= new Date()) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Expiry date must be in the future',
    });
  }
  const rawExpiry = optionize(dateToMoment)(expiry, context);

  return {
    transaction: addAuthorization,
    args: [rawSignatory, rawAuthorizationData, rawExpiry],
    resolver: createAuthorizationResolver(
      authRequest,
      issuerIdentity,
      target,
      expiry || null,
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
