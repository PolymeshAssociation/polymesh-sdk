import BigNumber from 'bignumber.js';

import {
  Account,
  DefaultPortfolio,
  FungibleAsset,
  NumberedPortfolio,
  PolymeshError,
  Procedure,
} from '~/internal';
import { AssetHolder, ErrorCode, RedeemTokensParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetHolderToAssetHolderKind,
  assetToMeshAssetId,
  bigNumberToBalance,
} from '~/utils/conversion';
import { asAccount } from '~/utils/internal';

export interface Storage {
  fromAssetHolder: AssetHolder;
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
    },
    storage: { fromAssetHolder },
  } = this;

  const { asset, amount } = args;

  const rawAssetId = assetToMeshAssetId(asset, context);

  const [[portfolioBalance], { isDivisible }] = await Promise.all([
    fromAssetHolder.getAssetBalances({ assets: [asset.id] }),
    asset.details(),
  ]);

  if (!portfolioBalance || portfolioBalance.free.lt(amount)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'Insufficient free balance',
      data: {
        portfolioBalance,
      },
    });
  }

  const rawAmount = bigNumberToBalance(amount, context, isDivisible);

  return {
    transaction: tx.asset.redeem,
    args: [rawAssetId, rawAmount, assetHolderToAssetHolderKind(fromAssetHolder, context)],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { asset, from }: Params
): ProcedureAuthorization {
  const {
    storage: { fromAssetHolder },
    context,
  } = this;

  let transaction = TxTags.asset.Redeem;
  if (context.isV7 && from) {
    transaction = TxTags.asset.RedeemFromPortfolio;
  }

  return {
    permissions: {
      transactions: [transaction],
      assets: [asset],
      portfolios: fromAssetHolder instanceof Account ? [] : [fromAssetHolder],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, void, Storage>,
  { from, fromAccount }: Params
): Promise<Storage> {
  const { context } = this;

  const { did } = await context.getSigningIdentity();

  let fromAssetHolder: AssetHolder;

  if (from && fromAccount) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Only one of `from` or `fromAccount` can be provided to redeem',
    });
  }

  if (fromAccount) {
    fromAssetHolder = asAccount(fromAccount, context);
  }
  if (!from) {
    fromAssetHolder = new DefaultPortfolio({ did }, context);
  } else if (from instanceof BigNumber) {
    fromAssetHolder = new NumberedPortfolio({ did, id: from }, context);
  } else {
    fromAssetHolder = from;
  }

  return {
    fromAssetHolder,
  };
}

/**
 * @hidden
 */
export const redeemTokens = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareRedeemTokens, getAuthorization, prepareStorage);
