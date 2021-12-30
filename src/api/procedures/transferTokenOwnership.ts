import { createAuthorizationResolver } from '~/api/procedures/utils';
import {
  AuthorizationRequest,
  Identity,
  PostTransactionValue,
  Procedure,
  SecurityToken,
} from '~/internal';
import { AuthorizationType, SignerType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';

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
  const { ticker, target, expiry } = args;
  const issuer = await context.getCurrentIdentity();
  let targetIdentity;
  if (typeof target === 'string') {
    targetIdentity = new Identity({ did: target }, context);
  } else {
    targetIdentity = target;
  }

  const rawSignatory = signerValueToSignatory(
    { type: SignerType.Identity, value: signerToString(target) },
    context
  );

  const authRequest = {
    type: AuthorizationType.TransferAssetOwnership as AuthorizationType.TransferAssetOwnership,
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
