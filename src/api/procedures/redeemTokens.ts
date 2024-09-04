import BigNumber from 'bignumber.js';

import {
  DefaultPortfolio,
  FungibleAsset,
  NumberedPortfolio,
  PolymeshError,
  Procedure,
} from '~/internal';
import { ErrorCode, RedeemTokensParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  bigNumberToBalance,
  portfolioToPortfolioKind,
} from '~/utils/conversion';

export interface Storage {
  fromPortfolio: DefaultPortfolio | NumberedPortfolio;
}

/**
 * @hidden
 */
export type Params = { asset: FungibleAsset } & RedeemTokensParams;

/**
 * @hidden
 */
export async function prepareRedeemTokens(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'asset', 'redeem'>>> {
  const {
    context,
    context: {
      polymeshApi: { tx },
      isV6,
    },
    storage: { fromPortfolio },
  } = this;

  const { asset, amount } = args;

  const rawAssetId = assetToMeshAssetId(asset, context);

  const [[{ free }], { isDivisible }] = await Promise.all([
    fromPortfolio.getAssetBalances({ assets: [asset.id] }),
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

  let transaction = tx.asset.redeem;
  /* istanbul ignore if: this will be removed after dual version support for v6-v7 */
  if (isV6) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction = (tx.asset as any).redeemFromPortfolio; // NOSONAR
  }
  return {
    transaction,
    args: [rawAssetId, rawAmount, portfolioToPortfolioKind(fromPortfolio, context)],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { asset, from }: Params
): Promise<ProcedureAuthorization> {
  const {
    storage: { fromPortfolio },
  } = this;

  return {
    permissions: {
      transactions: [from ? TxTags.asset.RedeemFromPortfolio : TxTags.asset.Redeem],
      assets: [asset],
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
