import { createAuthorizationResolver } from '~/api/procedures/utils';
import { Procedure } from '~/internal';
import {
  Authorization,
  AuthorizationRequest,
  AuthorizationType,
  RotatePrimaryKeyParams,
  TxTags,
} from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  expiryToMoment,
  signerToSignatory,
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
      expiry || null,
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
