import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, PortfolioLike, RoleType, TxTags } from '~/types';
import { PortfolioId, ProcedureAuthorization } from '~/types/internal';
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
export interface Storage {
  originPortfolioId: PortfolioId;
}

/**
 * @hidden
 */
export async function prepareControllerTransfer(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: { originPortfolioId },
  } = this;
  const { ticker, amount } = args;

  const token = new SecurityToken({ ticker }, context);

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
export function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { ticker }: Params
): ProcedureAuthorization {
  const {
    storage: { originPortfolioId },
    context,
  } = this;
  return {
    identityRoles: [
      { type: RoleType.TokenPia, ticker },
      { type: RoleType.PortfolioCustodian, portfolioId: originPortfolioId },
    ],
    signerPermissions: {
      tokens: [new SecurityToken({ ticker }, context)],
      transactions: [TxTags.asset.ControllerTransfer],
      portfolios: [portfolioIdToPortfolio(originPortfolioId, context)],
    },
  };
}

/**
 * @hidden
 */
export function prepareStorage(
  this: Procedure<Params, void, Storage>,
  { originPortfolio }: Params
): Storage {
  return {
    originPortfolioId: portfolioLikeToPortfolioId(originPortfolio),
  };
}

/**
 * @hidden
 */
export const controllerTransfer = new Procedure(
  prepareControllerTransfer,
  getAuthorization,
  prepareStorage
);
