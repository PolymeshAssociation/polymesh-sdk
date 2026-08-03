import {
  BaseAsset,
  DefaultPortfolio,
  NumberedPortfolio,
  PolymeshError,
  Procedure,
} from '~/internal';
import { ErrorCode, PortfolioId, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolioId,
} from '~/utils/conversion';
import { asBaseAsset } from '~/utils/internal';

/**
 * @hidden
 */
export interface Params {
  portfolio: DefaultPortfolio | NumberedPortfolio;
  asset: BaseAsset | string;
  preApprove: boolean;
}

export interface Storage {
  portfolioId: PortfolioId;
}

/**
 * @hidden
 */
export async function prepareTogglePortfolioPreApproval(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'portfolio', 'preApprovePortfolio'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    storage: { portfolioId },
    context,
  } = this;
  const { portfolio, asset, preApprove } = args;

  const baseAsset = await asBaseAsset(asset, context);
  const isPreApproved = await portfolio.isAssetPreApproved(baseAsset);

  if (isPreApproved === preApprove) {
    const message = isPreApproved
      ? 'The Portfolio has already pre-approved the asset'
      : 'The Portfolio has not pre-approved the asset';
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message,
      data: { portfolioId, assetId: baseAsset.id },
    });
  }

  const rawAssetId = assetToMeshAssetId(baseAsset, context);
  const rawPortfolioId = portfolioIdToMeshPortfolioId(portfolioId, context);

  const transaction = preApprove
    ? tx.portfolio.preApprovePortfolio
    : tx.portfolio.removePortfolioPreApproval;

  return {
    transaction,
    args: [rawAssetId, rawPortfolioId],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { preApprove, portfolio }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [
        preApprove
          ? TxTags.portfolio.PreApprovePortfolio
          : TxTags.portfolio.RemovePortfolioPreApproval,
      ],
      assets: [],
      portfolios: [portfolio],
    },
  };
}

/**
 * @hidden
 */
export function prepareStorage(
  this: Procedure<Params, void, Storage>,
  { portfolio }: Params
): Storage {
  return {
    portfolioId: portfolioLikeToPortfolioId(portfolio),
  };
}

/**
 * @hidden
 */
export const togglePortfolioPreApproval = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareTogglePortfolioPreApproval, getAuthorization, prepareStorage);
