import BigNumber from 'bignumber.js';

import { Asset, DefaultPortfolio, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { numberToBalance, stringToTicker } from '~/utils/conversion';

export interface RedeemAssetParams {
  amount: BigNumber;
}

/**
 * @hidden
 */
export type Params = { ticker: string } & RedeemAssetParams;

/**
 * @hidden
 */
export async function prepareRedeemAsset(
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

  const asset = new Asset({ ticker }, context);
  const rawTicker = stringToTicker(ticker, context);

  const [{ isDivisible }, { did }] = await Promise.all([
    asset.details(),
    context.getCurrentIdentity(),
  ]);

  const defaultPortfolio = new DefaultPortfolio({ did }, context);

  const portfolioBalance = await defaultPortfolio.getAssetBalances({ assets: [ticker] });

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
    numberToBalance(amount, context, isDivisible)
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
      assets: [new Asset({ ticker }, context)],
      portfolios: [new DefaultPortfolio({ did }, context)],
    },
  };
}

/**
 * @hidden
 */
export const redeemAsset = (): Procedure<Params, void> =>
  new Procedure(prepareRedeemAsset, getAuthorization);
