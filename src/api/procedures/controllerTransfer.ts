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
  originPortfolio: PortfolioLike;
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
  const { ticker, originPortfolio, amount } = args;

  const token = new SecurityToken({ ticker }, context);

  const originPortfolioId = portfolioLikeToPortfolioId(originPortfolio);

  const fromPortfolio = portfolioIdToPortfolio(originPortfolioId, context);

  const [{ total: portfolioBalance, locked }] = await fromPortfolio.getTokenBalances({
    tokens: [token],
  });

  if (portfolioBalance.minus(locked).lt(amount)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Portfolio does not have enough free balance for this transfer',
      data: { portfolioBalance },
    });
  }

  this.addTransaction(
    tx.asset.controllerTransfer,
    {},
    stringToTicker(ticker, context),
    numberToBalance(amount, context),
    portfolioIdToMeshPortfolioId(originPortfolioId, context)
  );
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, void>,
  { ticker }: Params
): Promise<ProcedureAuthorization> {
  const { context } = this;

  const token = new SecurityToken({ ticker }, context);
  const {
    primaryIssuanceAgent: { did },
  } = await token.details();

  const portfolioId = portfolioLikeToPortfolioId(did);

  return {
    identityRoles: [
      { type: RoleType.TokenPia, ticker },
      { type: RoleType.PortfolioCustodian, portfolioId },
    ],
    signerPermissions: {
      tokens: [new SecurityToken({ ticker }, context)],
      transactions: [TxTags.asset.ControllerTransfer],
      portfolios: [portfolioIdToPortfolio(portfolioId, context)],
    },
  };
}

/**
 * @hidden
 */
export const controllerTransfer = new Procedure(prepareControllerTransfer, getAuthorization);
