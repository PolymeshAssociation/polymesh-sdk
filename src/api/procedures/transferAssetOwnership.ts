import { createAuthorizationResolver } from '~/api/procedures/utils';
import { AuthorizationRequest, BaseAsset, Procedure } from '~/internal';
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
export type Params = { asset: BaseAsset } & TransferAssetOwnershipParams;

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
  const { asset, target, expiry = null } = args;
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
    value: asset.id,
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
 *
 * The chain defers the real Agent check to acceptance: `acceptAssetOwnershipTransfer` runs
 * `ensure_agent_permissioned` against the authorization's creator, resolved against the accept
 * call. So the caller must already hold that permission, or the offer can never be accepted.
 */
export function getAuthorization(
  this: Procedure<Params, AuthorizationRequest>,
  { asset }: Params
): ProcedureAuthorization {
  return {
    signerPermissions: {
      transactions: [TxTags.identity.AddAuthorization],
      assets: [],
      portfolios: [],
    },
    agentPermissions: {
      transactions: [TxTags.asset.AcceptAssetOwnershipTransfer],
      assets: [asset],
    },
  };
}

/**
 * @hidden
 */
export const transferAssetOwnership = (): Procedure<Params, AuthorizationRequest> =>
  new Procedure(prepareTransferAssetOwnership, getAuthorization);
