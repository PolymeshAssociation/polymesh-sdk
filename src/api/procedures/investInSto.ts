import BigNumber from 'bignumber.js';
import { sumBy } from 'lodash';

import { PolymeshError, Procedure, Sto } from '~/internal';
import { ErrorCode, PortfolioLike, RoleType, StoStatus, TxTags } from '~/types';
import { PortfolioId, ProcedureAuthorization } from '~/types/internal';
import {
  numberToBalance,
  numberToU64,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
  stringToTicker,
} from '~/utils/conversion';

export type InvestInStoParams = {
  investmentPortfolio: PortfolioLike;
  fundingPortfolio: PortfolioLike;
  investmentAmount: BigNumber;
  maxPrice?: BigNumber;
};

/**
 * @hidden
 */
export type Params = InvestInStoParams & {
  id: BigNumber;
  ticker: string;
};

/**
 * @hidden
 */
export interface Storage {
  investmentPortfolio: PortfolioId;
  fundingPortfolio: PortfolioId;
}

/**
 * @hidden
 */
export async function prepareInvestInSto(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { sto: txSto },
      },
    },
    context,
    storage: { investmentPortfolio, fundingPortfolio },
  } = this;
  const { ticker, id, investmentAmount, maxPrice } = args;

  const sto = new Sto({ ticker, id }, context);

  const { status, end, minInvestment, tiers } = await sto.details();

  if (status !== StoStatus.Live) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The STO is not live',
    });
  }

  const now = new Date();

  if (end && now > end) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The STO has already ended',
    });
  }

  if (investmentAmount.lt(minInvestment)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Investment amount must be equals or greater than minimum investment',
    });
  }

  const portfolio = portfolioIdToPortfolio(fundingPortfolio, context);
  const [{ total: totalTokenBalance }] = await portfolio.getTokenBalances({ tokens: [ticker] });

  if (totalTokenBalance.lt(investmentAmount)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The Portfolio's token balance is lower than the investment amout seted",
    });
  }

  const totalStoRemaining = new BigNumber(sumBy(tiers, ({ remaining }) => remaining.toNumber()));

  if (totalStoRemaining.lt(investmentAmount)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The STO does not have enough remaining tokens to fulfill the investment',
    });
  }

  if (maxPrice) {
    const filterTiers = tiers.filter(({ price }) => price.lte(maxPrice));
    const remainingAmount = new BigNumber(
      sumBy(filterTiers, ({ remaining }) => remaining.toNumber())
    );
    if (remainingAmount.lt(investmentAmount)) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The STO does not have enough tiers that satisfy your constraint',
      });
    }
  }

  this.addTransaction(
    txSto.invest,
    {},
    investmentPortfolio,
    fundingPortfolio,
    stringToTicker(ticker, context),
    numberToU64(id, context),
    numberToBalance(investmentAmount, context),
    maxPrice ? numberToBalance(maxPrice, context) : null,
    null
  );
}

/**
 * @hidden
 */
export function getAuthorization(this: Procedure<Params, void, Storage>): ProcedureAuthorization {
  const {
    storage: { investmentPortfolio, fundingPortfolio },
    context,
  } = this;

  return {
    identityRoles: [
      { type: RoleType.PortfolioCustodian, portfolioId: investmentPortfolio },
      { type: RoleType.PortfolioCustodian, portfolioId: fundingPortfolio },
    ],
    signerPermissions: {
      transactions: [TxTags.sto.Invest],
      tokens: [],
      portfolios: [
        portfolioIdToPortfolio(investmentPortfolio, context),
        portfolioIdToPortfolio(fundingPortfolio, context),
      ],
    },
  };
}

/**
 * @hidden
 */
export function prepareStorage(
  this: Procedure<Params, void, Storage>,
  { investmentPortfolio, fundingPortfolio }: Params
): Storage {
  return {
    investmentPortfolio: portfolioLikeToPortfolioId(investmentPortfolio),
    fundingPortfolio: portfolioLikeToPortfolioId(fundingPortfolio),
  };
}

/**
 * @hidden
 */
export const investInSto = new Procedure(prepareInvestInSto, getAuthorization, prepareStorage);
