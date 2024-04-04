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
): Promise<TransactionSpec<AuthorizationRequest, ExtrinsicParams<'identity', 'addAuthorization'>>> {
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

  return {
    transaction: tx.identity.addAuthorization,
    args: [rawSignatory, rawAuthorizationData, rawExpiry],
    resolver: createAuthorizationResolver(authRequest, issuer, targetIdentity, expiry, context),
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
