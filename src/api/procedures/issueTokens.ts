import BigNumber from 'bignumber.js';

import { Asset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { MAX_BALANCE } from '~/utils/constants';
import { bigNumberToBalance, portfolioToPortfolioKind, stringToTicker } from '~/utils/conversion';

export interface IssueTokensParams {
  amount: BigNumber;
  ticker: string;
}

export interface Storage {
  asset: Asset;
}

/**
 * @hidden
 */
export async function prepareIssueTokens(
  this: Procedure<IssueTokensParams, Asset, Storage>,
  args: IssueTokensParams
): Promise<TransactionSpec<Asset, ExtrinsicParams<'asset', 'issue'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { asset },
      },
      isV5,
    },
    context,
    storage: { asset: assetEntity },
  } = this;
  const { ticker, amount } = args;

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

  const defaultPortfolio = await signingIdentity.portfolios.getPortfolio();

  const rawTicker = stringToTicker(ticker, context);
  const rawValue = bigNumberToBalance(amount, context, isDivisible);
  const rawPortfolio = portfolioToPortfolioKind(defaultPortfolio, context);

  const issueArgs: any[] = [rawTicker, rawValue];

  if (!isV5) {
    issueArgs.push(rawPortfolio);
  }

  return {
    transaction: asset.issue,
    args: issueArgs as any,
    resolver: assetEntity,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<IssueTokensParams, Asset, Storage>
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
  this: Procedure<IssueTokensParams, Asset, Storage>,
  { ticker }: IssueTokensParams
): Storage {
  const { context } = this;

  return {
    asset: new Asset({ ticker }, context),
  };
}

/**
 * @hidden
 */
export const issueTokens = (): Procedure<IssueTokensParams, Asset, Storage> =>
  new Procedure(prepareIssueTokens, getAuthorization, prepareStorage);
