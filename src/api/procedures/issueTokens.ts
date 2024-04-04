import BigNumber from 'bignumber.js';

import { FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { MAX_BALANCE } from '~/utils/constants';
import { bigNumberToBalance, portfolioToPortfolioKind, stringToTicker } from '~/utils/conversion';

export interface IssueTokensParams {
  amount: BigNumber;
  ticker: string;
  portfolioId?: BigNumber;
}

export interface Storage {
  asset: FungibleAsset;
}

/**
 * @hidden
 */
export async function prepareIssueTokens(
  this: Procedure<IssueTokensParams, FungibleAsset, Storage>,
  args: IssueTokensParams
): Promise<TransactionSpec<FungibleAsset, ExtrinsicParams<'asset', 'issue'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { asset },
      },
    },
    context,
    storage: { asset: assetEntity },
  } = this;
  const { ticker, amount, portfolioId } = args;

  const [{ isDivisible, totalSupply }, signingIdentity] = await Promise.all([
    assetEntity.details(),
    context.getSigningIdentity(),
  ]);
  const supplyAfterMint = amount.plus(totalSupply);

  if (supplyAfterMint.isGreaterThan(MAX_BALANCE)) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: `This issuance operation will cause the total supply of "${ticker}" to exceed the supply limit`,
      data: {
        currentSupply: totalSupply,
        supplyLimit: MAX_BALANCE,
      },
    });
  }

  const portfolio = portfolioId
    ? await signingIdentity.portfolios.getPortfolio({ portfolioId })
    : await signingIdentity.portfolios.getPortfolio();

  const rawTicker = stringToTicker(ticker, context);
  const rawValue = bigNumberToBalance(amount, context, isDivisible);
  const rawPortfolio = portfolioToPortfolioKind(portfolio, context);

  return {
    transaction: asset.issue,
    args: [rawTicker, rawValue, rawPortfolio],
    resolver: assetEntity,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<IssueTokensParams, FungibleAsset, Storage>
): ProcedureAuthorization {
  const {
    storage: { asset },
  } = this;
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
export function prepareStorage(
  this: Procedure<IssueTokensParams, FungibleAsset, Storage>,
  { ticker }: IssueTokensParams
): Storage {
  const { context } = this;

  return {
    asset: new FungibleAsset({ ticker }, context),
  };
}

/**
 * @hidden
 */
export const issueTokens = (): Procedure<IssueTokensParams, FungibleAsset, Storage> =>
  new Procedure(prepareIssueTokens, getAuthorization, prepareStorage);
