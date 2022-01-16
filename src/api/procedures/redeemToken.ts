import BigNumber from 'bignumber.js';

import { DefaultPortfolio, PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { bigNumberToBalance, stringToTicker } from '~/utils/conversion';

export interface RedeemTokenParams {
  amount: BigNumber;
}

/**
 * @hidden
 */
export type Params = { ticker: string } & RedeemTokenParams;

/**
 * @hidden
 */
export async function prepareRedeemToken(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context,
    context: {
      polymeshApi: { tx },
    },
  } = this;
  const { ticker, amount } = args;

  const securityToken = new SecurityToken({ ticker }, context);
  const rawTicker = stringToTicker(ticker, context);

  const [{ isDivisible }, { did }] = await Promise.all([
    securityToken.details(),
    context.getCurrentIdentity(),
  ]);

  const defaultPortfolio = new DefaultPortfolio({ did }, context);

  const portfolioBalance = await defaultPortfolio.getTokenBalances({ tokens: [ticker] });

  const { free } = portfolioBalance[0];

  if (free.lt(amount)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'Insufficient free balance',
      data: {
        free,
      },
    });
  }

  this.addTransaction(
    tx.asset.redeem,
    {},
    rawTicker,
    bigNumberToBalance(amount, context, isDivisible)
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

  const { did } = await context.getCurrentIdentity();

  return {
    permissions: {
      transactions: [TxTags.asset.Redeem],
      tokens: [new SecurityToken({ ticker }, context)],
      portfolios: [new DefaultPortfolio({ did }, context)],
    },
  };
}

/**
 * @hidden
 */
export const redeemToken = (): Procedure<Params, void> =>
  new Procedure(prepareRedeemToken, getAuthorization);
