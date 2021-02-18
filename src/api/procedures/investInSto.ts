import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure, Sto } from '~/internal';
import { ErrorCode, PortfolioLike, RoleType, StoStatus, TxTags } from '~/types';
import { PortfolioId, ProcedureAuthorization } from '~/types/internal';
import {
  numberToBalance,
  numberToU64,
  portfolioIdToMeshPortfolioId,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
  stringToTicker,
} from '~/utils/conversion';

export interface InvestInStoParams {
  investmentPortfolio: PortfolioLike;
  fundingPortfolio: PortfolioLike;
  purchaseAmount: BigNumber;
  maxPrice?: BigNumber;
}

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
  investmentPortfolioId: PortfolioId;
  fundingPortfolioId: PortfolioId;
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
    storage: { investmentPortfolioId, fundingPortfolioId },
  } = this;
  const { ticker, id, purchaseAmount, maxPrice } = args;

  const sto = new Sto({ ticker, id }, context);

  const portfolio = portfolioIdToPortfolio(fundingPortfolioId, context);

  const { status, end, minInvestment, tiers, raisingCurrency } = await sto.details();

  const [{ total: totalTokenBalance }] = await portfolio.getTokenBalances({
    tokens: [raisingCurrency],
  });

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

  let remainingAmount = purchaseAmount;

  const { remaining: tiersRemaining, price: priceTotal } = tiers.reduce<{
    remaining: BigNumber;
    price: BigNumber;
  }>(
    (prev, { remaining, price }) => {
      if (!maxPrice || price.lte(maxPrice)) {
        if (remaining.gte(remainingAmount)) {
          return {
            remaining: prev.remaining.plus(remaining),
            price: prev.price.plus(remainingAmount.multipliedBy(price)),
          };
        } else {
          remainingAmount = remainingAmount.minus(remaining);
          return {
            remaining: prev.remaining.plus(remaining),
            price: prev.price.plus(remaining.multipliedBy(price)),
          };
        }
      }
      return prev;
    },
    {
      remaining: new BigNumber(0),
      price: new BigNumber(0),
    }
  );

  if (priceTotal.lt(minInvestment)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Minimum investment not reached',
      data: { priceTotal },
    });
  }

  if (totalTokenBalance.lt(priceTotal)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Portfolio does not have enough balance for this investment',
      data: { priceTotal },
    });
  }

  if (tiersRemaining.lt(purchaseAmount)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `The STO does not have enough remaining tokens${
        maxPrice ? ' below the stipulated max price' : ''
      }`,
    });
  }

  this.addTransaction(
    txSto.invest,
    {},
    portfolioIdToMeshPortfolioId(investmentPortfolioId, context),
    portfolioIdToMeshPortfolioId(fundingPortfolioId, context),
    stringToTicker(ticker, context),
    numberToU64(id, context),
    numberToBalance(purchaseAmount, context),
    maxPrice ? numberToBalance(maxPrice, context) : null,
    null
  );
}

/**
 * @hidden
 */
export function getAuthorization(this: Procedure<Params, void, Storage>): ProcedureAuthorization {
  const {
    storage: { investmentPortfolioId, fundingPortfolioId },
    context,
  } = this;

  return {
    identityRoles: [
      { type: RoleType.PortfolioCustodian, portfolioId: investmentPortfolioId },
      { type: RoleType.PortfolioCustodian, portfolioId: fundingPortfolioId },
    ],
    signerPermissions: {
      transactions: [TxTags.sto.Invest],
      tokens: [],
      portfolios: [
        portfolioIdToPortfolio(investmentPortfolioId, context),
        portfolioIdToPortfolio(fundingPortfolioId, context),
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
    investmentPortfolioId: portfolioLikeToPortfolioId(investmentPortfolio),
    fundingPortfolioId: portfolioLikeToPortfolioId(fundingPortfolio),
  };
}

/**
 * @hidden
 */
export const investInSto = new Procedure(prepareInvestInSto, getAuthorization, prepareStorage);
