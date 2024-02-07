import { createAuthorizationResolver } from '~/api/procedures/utils';
import { AuthorizationRequest, FungibleAsset, Procedure } from '~/internal';
import {
  Authorization,
  AuthorizationType,
  SignerType,
  TransferAssetOwnershipParams,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';
import { asIdentity, assertNoPendingAuthorizationExists, optionize } from '~/utils/internal';

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
): Promise<TransactionSpec<AuthorizationRequest, ExtrinsicParams<'identity', 'addAuthorization'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, target, expiry = null } = args;
  const issuer = await context.getSigningIdentity();
  const targetIdentity = asIdentity(target, context);

  const authorizationRequests = await targetIdentity.authorizations.getReceived({
    type: AuthorizationType.TransferAssetOwnership,
    includeExpired: false,
  });

  const rawSignatory = signerValueToSignatory(
    { type: SignerType.Identity, value: signerToString(target) },
    context
  );

  const authorization: Authorization = {
    type: AuthorizationType.TransferAssetOwnership,
    value: ticker,
  };

  assertNoPendingAuthorizationExists({
    authorizationRequests,
    issuer,
    message: 'The target Identity already has a pending transfer Asset Ownership request',
    authorization,
  });

  const rawAuthorizationData = authorizationToAuthorizationData(authorization, context);
  const rawExpiry = optionize(dateToMoment)(expiry, context);

  return {
    transaction: tx.identity.addAuthorization,
    args: [rawSignatory, rawAuthorizationData, rawExpiry],
    resolver: createAuthorizationResolver(authorization, issuer, targetIdentity, expiry, context),
  };
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
      assets: [new FungibleAsset({ ticker }, this.context)],
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
