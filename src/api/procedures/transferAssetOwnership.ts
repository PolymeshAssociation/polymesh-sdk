import { createAuthorizationResolver } from '~/api/procedures/utils';
import { Asset, AuthorizationRequest, PostTransactionValue, Procedure } from '~/internal';
import {
  Authorization,
  AuthorizationType,
  SignerType,
  TransferAssetOwnershipParams,
  TxTags,
} from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';
import { optionize } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = { ticker: string } & TransferAssetOwnershipParams;

/**
 * @hidden
 */
export async function prepareTransferAssetOwnership(
  this: Procedure<Params, AuthorizationRequest>,
  args: Params
): Promise<PostTransactionValue<AuthorizationRequest>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, target, expiry = null } = args;
  const issuer = await context.getSigningIdentity();
  const targetIdentity = await context.getIdentity(target);

  const rawSignatory = signerValueToSignatory(
    { type: SignerType.Identity, value: signerToString(target) },
    context
  );

  const authRequest: Authorization = {
    type: AuthorizationType.TransferAssetOwnership,
    value: ticker,
  };
  const rawAuthorizationData = authorizationToAuthorizationData(authRequest, context);
  const rawExpiry = optionize(dateToMoment)(expiry, context);

  const [auth] = this.addTransaction({
    transaction: tx.identity.addAuthorization,
    resolvers: [createAuthorizationResolver(authRequest, issuer, targetIdentity, expiry, context)],
    args: [rawSignatory, rawAuthorizationData, rawExpiry],
  });

  return auth;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, AuthorizationRequest>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      assets: [new Asset({ ticker }, this.context)],
      transactions: [TxTags.identity.AddAuthorization],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const transferAssetOwnership = (): Procedure<Params, AuthorizationRequest> =>
  new Procedure(prepareTransferAssetOwnership, getAuthorization);
