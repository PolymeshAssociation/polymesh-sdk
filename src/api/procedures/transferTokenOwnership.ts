import { createAuthorizationResolver } from '~/api/procedures/utils';
import {
  AuthorizationRequest,
  Identity,
  PostTransactionValue,
  Procedure,
  SecurityToken,
} from '~/internal';
import { Authorization, AuthorizationType, SignerType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';
import { optionize } from '~/utils/internal';

export interface TransferTokenOwnershipParams {
  target: string | Identity;
  /**
   * date at which the authorization request for transfer expires (optional)
   */
  expiry?: Date;
}

/**
 * @hidden
 */
export type Params = { ticker: string } & TransferTokenOwnershipParams;

/**
 * @hidden
 */
export async function prepareTransferTokenOwnership(
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
      tokens: [new SecurityToken({ ticker }, this.context)],
      transactions: [TxTags.identity.AddAuthorization],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const transferTokenOwnership = (): Procedure<Params, AuthorizationRequest> =>
  new Procedure(prepareTransferTokenOwnership, getAuthorization);
