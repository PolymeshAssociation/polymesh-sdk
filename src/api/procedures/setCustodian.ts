import BigNumber from 'bignumber.js';

import { createAuthorizationResolver } from '~/api/procedures/utils';
import {
  AuthorizationRequest,
  DefaultPortfolio,
  Identity,
  NumberedPortfolio,
  PolymeshError,
  PostTransactionValue,
  Procedure,
} from '~/internal';
import { AuthorizationType, ErrorCode, RoleType, TxTags } from '~/types';
import { PortfolioId, ProcedureAuthorization } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  portfolioIdToPortfolio,
  signerToSignerValue,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';

export interface SetCustodianParams {
  targetIdentity: string | Identity;
  expiry?: Date;
}

/**
 * @hidden
 */
export type Params = { did: string; id?: BigNumber } & SetCustodianParams;

/**
 * @hidden
 */
export async function prepareSetCustodian(
  this: Procedure<Params, AuthorizationRequest>,
  args: Params
): Promise<PostTransactionValue<AuthorizationRequest>> {
  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    context,
  } = this;

  const { targetIdentity, expiry, did, id } = args;
  const portfolio = portfolioIdToPortfolio({ did, number: id }, context);
  const issuerIdentity = await context.getCurrentIdentity();

  const targetDid = signerToString(targetIdentity);
  const target = new Identity({ did: targetDid }, context);

  const [authorizationRequests, currentIdentity] = await Promise.all([
    target.authorizations.getReceived({
      type: AuthorizationType.PortfolioCustody,
      includeExpired: false,
    }),
    context.getCurrentIdentity(),
  ]);

  const hasPendingAuth = !!authorizationRequests.find(authorizationRequest => {
    const { issuer, data } = authorizationRequest;
    const authorizationData = data as { value: NumberedPortfolio | DefaultPortfolio };
    return currentIdentity.isEqual(issuer) && authorizationData.value.isEqual(portfolio);
  });

  if (hasPendingAuth) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message:
        "The target Identity already has a pending invitation to be the Portfolio's custodian",
    });
  }

  const rawSignatory = signerValueToSignatory(signerToSignerValue(target), context);

  const authRequest = {
    type: AuthorizationType.PortfolioCustody as AuthorizationType.PortfolioCustody,
    value: portfolio,
  };
  const rawAuthorizationData = authorizationToAuthorizationData(authRequest, context);

  const rawExpiry = expiry ? dateToMoment(expiry, context) : null;

  const [auth] = this.addTransaction(
    identity.addAuthorization,
    {
      resolvers: [
        createAuthorizationResolver(authRequest, issuerIdentity, target, expiry || null, context),
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
  { did, id }: Params
): ProcedureAuthorization {
  const { context } = this;
  const portfolioId: PortfolioId = { did, number: id };
  return {
    roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
    permissions: {
      transactions: [TxTags.identity.AddAuthorization],
      portfolios: [portfolioIdToPortfolio({ did, number: id }, context)],
      tokens: [],
    },
  };
}

/**
 * @hidden
 */
export const setCustodian = (): Procedure<Params, AuthorizationRequest> =>
  new Procedure(prepareSetCustodian, getAuthorization);
