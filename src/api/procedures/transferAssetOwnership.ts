import { createAuthorizationResolver } from '~/api/procedures/utils';
import { Asset, AuthorizationRequest, Identity, PostTransactionValue, Procedure } from '~/internal';
import { Authorization, AuthorizationType, SignerType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';

export interface TransferAssetOwnershipParams {
  target: string | Identity;
  /**
   * date at which the authorization request for transfer expires (optional)
   */
  expiry?: Date;
}

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
  const { ticker, target, expiry } = args;
  const issuer = await context.getCurrentIdentity();
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
  const rawExpiry = expiry ? dateToMoment(expiry, context) : null;

  const [auth] = this.addTransaction(
    tx.identity.addAuthorization,
    {
      resolvers: [
        createAuthorizationResolver(authRequest, issuer, targetIdentity, expiry || null, context),
      ],
    },
    rawSignatory,
    rawAuthorizationData,
    rawExpiry
  );

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
