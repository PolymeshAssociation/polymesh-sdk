import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, PortfolioLike, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  numberToBalance,
  portfolioIdToMeshPortfolioId,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
  stringToTicker,
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

  const [{ total: totalTokenBalance, locked }] = await fromPortfolio.getTokenBalances({
    tokens: [token],
  });

  if (totalTokenBalance.minus(locked).lt(amount)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Portfolio does not have enough balance for this transfer',
      data: { totalTokenBalance },
    });
  }

  this.addTransaction(
    tx.asset.controllerTransfer,
    {},
    stringToTicker(ticker, context),
    numberToBalance(amount, context),
    portfolioIdToMeshPortfolioId(portfolioId, context)
  );
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
