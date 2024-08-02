import { FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, IssueTokensParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { MAX_BALANCE } from '~/utils/constants';
import {
  assetToMeshAssetId,
  bigNumberToBalance,
  portfolioToPortfolioKind,
} from '~/utils/conversion';

export type Params = IssueTokensParams & {
  asset: FungibleAsset;
};

/**
 * @hidden
 */
export async function prepareIssueTokens(
  this: Procedure<Params, FungibleAsset>,
  args: Params
): Promise<TransactionSpec<FungibleAsset, ExtrinsicParams<'asset', 'issue'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { asset },
      },
    },
    context,
  } = this;
  const { asset: assetEntity, amount, portfolioId } = args;

  const [{ isDivisible, totalSupply }, signingIdentity] = await Promise.all([
    assetEntity.details(),
    context.getSigningIdentity(),
  ]);
  const supplyAfterMint = amount.plus(totalSupply);

  if (supplyAfterMint.isGreaterThan(MAX_BALANCE)) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: `This issuance operation will cause the total supply of "${assetEntity.id}" to exceed the supply limit`,
      data: {
        currentSupply: totalSupply,
        supplyLimit: MAX_BALANCE,
      },
    });
  }

  const portfolio = portfolioId
    ? await signingIdentity.portfolios.getPortfolio({ portfolioId })
    : await signingIdentity.portfolios.getPortfolio();

  const rawAssetId = assetToMeshAssetId(assetEntity, context);
  const rawValue = bigNumberToBalance(amount, context, isDivisible);
  const rawPortfolio = portfolioToPortfolioKind(portfolio, context);

  return {
    transaction: asset.issue,
    args: [rawAssetId, rawValue, rawPortfolio],
    resolver: assetEntity,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, FungibleAsset>,
  { asset }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.asset.Issue],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const issueTokens = (): Procedure<Params, FungibleAsset> =>
  new Procedure(prepareIssueTokens, getAuthorization);
