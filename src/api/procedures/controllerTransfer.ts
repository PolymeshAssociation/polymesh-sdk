import BigNumber from 'bignumber.js';

import { Identity, PolymeshError, Procedure, SecurityToken } from '~/internal';
import {
  AuthorizationType,
  DefaultPortfolio,
  ErrorCode,
  NumberedPortfolio,
  PortfolioLike,
  RoleType,
  TxTags,
} from '~/types';
import { ProcedureAuthorization, SignerType } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';

export interface ControllerTransferParams {
  portfolio: PortfolioLike;
  amount: BigNumber;
}

/**
 * @hidden
 */
export type Params = { ticker: string } & ControllerTransferParams;

/**
 * @hidden
 */
export async function prepareControllerTransfer(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, portfolio, amount } = args;

  const token = new SecurityToken({ ticker }, context);

  const portfolioId = portfolioLikeToPortfolioId(portfolio);

  const fromPortfolio = portfolioIdToPortfolio(portfolioId, context);

  const [{ total: totalTokenBalance }] = await fromPortfolio.getTokenBalances({
    tokens: [token],
  });

  if (totalTokenBalance.lt(amount)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Portfolio does not have enough balance for this transfer',
      data: { totalTokenBalance },
    });
  }

  // const rawSignatory = signerValueToSignatory(
  //   { type: SignerType.Identity, value: signerToString(target) },
  //   context
  // );
  // const rawAuthorizationData = authorizationToAuthorizationData(
  //   { type: AuthorizationType.TransferAssetOwnership, value: ticker },
  //   context
  // );
  // const rawExpiry = expiry ? dateToMoment(expiry, context) : null;

  // this.addTransaction(
  //   tx.identity.addAuthorization,
  //   {},
  //   rawSignatory,
  //   rawAuthorizationData,
  //   rawExpiry
  // );

  // return new SecurityToken({ ticker }, context);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    identityRoles: [{ type: RoleType.TokenPia, ticker }],
    signerPermissions: {
      tokens: [new SecurityToken({ ticker }, this.context)],
      transactions: [TxTags.asset.ControllerTransfer],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const controllerTransfer = new Procedure(prepareControllerTransfer, getAuthorization);
