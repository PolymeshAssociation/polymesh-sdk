import BigNumber from 'bignumber.js';

import { Asset, DefaultPortfolio, NumberedPortfolio, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RedeemTokensParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToBalance, portfolioToPortfolioKind, stringToTicker } from '~/utils/conversion';

export interface Storage {
  fromPortfolio: DefaultPortfolio | NumberedPortfolio;
}

/**
 * @hidden
 */
export type Params = { ticker: string } & RedeemTokensParams;

/**
 * @hidden
 */
export async function prepareRedeemTokens(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<
  | TransactionSpec<void, ExtrinsicParams<'asset', 'redeem'>>
  | TransactionSpec<void, ExtrinsicParams<'asset', 'redeemFromPortfolio'>>
> {
  const {
    context,
    context: {
      polymeshApi: { tx },
    },
    storage: { fromPortfolio },
  } = this;

  const { ticker, amount, from } = args;

  const asset = new Asset({ ticker }, context);
  const rawTicker = stringToTicker(ticker, context);

  const [[{ free }], { isDivisible }] = await Promise.all([
    fromPortfolio.getAssetBalances({ assets: [ticker] }),
    asset.details(),
  ]);

  if (free.lt(amount)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'Insufficient free balance',
      data: {
        free,
      },
    });
  }

  const rawAmount = bigNumberToBalance(amount, context, isDivisible);

  if (from) {
    return {
      transaction: tx.asset.redeemFromPortfolio,
      args: [rawTicker, rawAmount, portfolioToPortfolioKind(fromPortfolio, context)],
      resolver: undefined,
    };
  }

  return {
    transaction: tx.asset.redeem,
    args: [rawTicker, rawAmount],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { ticker, from }: Params
): Promise<ProcedureAuthorization> {
  const {
    context,
    storage: { fromPortfolio },
  } = this;

  return {
    permissions: {
      transactions: [from ? TxTags.asset.RedeemFromPortfolio : TxTags.asset.Redeem],
      assets: [new Asset({ ticker }, context)],
      portfolios: [fromPortfolio],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, void, Storage>,
  { from }: Params
): Promise<Storage> {
  const { context } = this;

  const { did } = await context.getSigningIdentity();

  let fromPortfolio: DefaultPortfolio | NumberedPortfolio;

  if (!from) {
    fromPortfolio = new DefaultPortfolio({ did }, context);
  } else if (from instanceof BigNumber) {
    fromPortfolio = new NumberedPortfolio({ did, id: from }, context);
  } else {
    fromPortfolio = from;
  }

  return {
    fromPortfolio,
  };
}

/**
 * @hidden
 */
export const redeemTokens = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareRedeemTokens, getAuthorization, prepareStorage);
