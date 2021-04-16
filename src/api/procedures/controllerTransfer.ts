import BigNumber from 'bignumber.js';

import { DefaultPortfolio, PolymeshError, Procedure, SecurityToken } from '~/internal';
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

  const [{ free }] = await fromPortfolio.getTokenBalances({
    tokens: [token],
  });

  if (free.lt(amount)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Portfolio does not have enough free balance for this transfer',
      data: { free },
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

  const portfolioId = { did };

  return {
    identityRoles: [
      { type: RoleType.TokenPia, ticker },
      { type: RoleType.PortfolioCustodian, portfolioId },
    ],
    signerPermissions: {
      tokens: [token],
      transactions: [TxTags.asset.ControllerTransfer],
      portfolios: [new DefaultPortfolio({ did }, context)],
    },
  };
}

/**
 * @hidden
 */
export const controllerTransfer = (): Procedure<Params, void> =>
  new Procedure(prepareControllerTransfer, getAuthorization);
