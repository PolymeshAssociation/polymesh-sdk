import BigNumber from 'bignumber.js';

import { createAuthorizationResolver } from '~/api/procedures/utils';
import { AuthorizationRequest, Identity, Procedure } from '~/internal';
import {
  Authorization,
  AuthorizationType,
  PortfolioId,
  RoleType,
  SetCustodianParams,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  portfolioIdToPortfolio,
  signerToSignerValue,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';
import { assertNoPendingAuthorizationExists, optionize } from '~/utils/internal';

/**
 * @hidden
 *
 * @note `id` is required: the chain's `accept_portfolio_custody` rejects a default Portfolio with
 *   `DefaultPortfoliosCannotHaveCustodians`, and `add_authorization` does not check, so allowing
 *   one here would only produce an Authorization Request that can never be accepted
 */
export type Params = { did: string; id: BigNumber } & SetCustodianParams;

/**
 * @hidden
 */
export async function prepareSetCustodian(
  this: Procedure<Params, AuthorizationRequest>,
  args: Params
): Promise<TransactionSpec<AuthorizationRequest, ExtrinsicParams<'identity', 'addAuthorization'>>> {
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
  const issuerIdentity = await context.getSigningIdentity();

  const targetDid = signerToString(targetIdentity);
  const target = new Identity({ did: targetDid }, context);

  const [authorizationRequests, signingIdentity] = await Promise.all([
    target.authorizations.getReceived({
      type: AuthorizationType.PortfolioCustody,
      includeExpired: false,
    }),
    context.getSigningIdentity(),
  ]);

  const authorization: Authorization = {
    type: AuthorizationType.PortfolioCustody,
    value: portfolio,
  };

  assertNoPendingAuthorizationExists({
    authorizationRequests,
    issuer: signingIdentity,
    message: "The target Identity already has a pending invitation to be the Portfolio's custodian",
    authorization,
  });

  const rawSignatory = signerValueToSignatory(signerToSignerValue(target), context);

  const rawAuthorizationData = authorizationToAuthorizationData(authorization, context);

  const rawExpiry = optionize(dateToMoment)(expiry, context);

  return {
    transaction: identity.addAuthorization,
    resolver: createAuthorizationResolver(
      authorization,
      issuerIdentity,
      target,
      expiry || null,
      context
    ),
    args: [rawSignatory, rawAuthorizationData, rawExpiry],
  };
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
      portfolios: [portfolioIdToPortfolio(portfolioId, context)],
      assets: [],
    },
  };
}

/**
 * @hidden
 */
export const setCustodian = (): Procedure<Params, AuthorizationRequest> =>
  new Procedure(prepareSetCustodian, getAuthorization);
