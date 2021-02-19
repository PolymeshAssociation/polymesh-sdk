import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure, Sto } from '~/internal';
import { ErrorCode, PortfolioLike, RoleType, StoStatus, Tier, TxTags } from '~/types';
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
  purchasePortfolio: PortfolioLike;
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
  purchasePortfolioId: PortfolioId;
  fundingPortfolioId: PortfolioId;
}

/**
 * @hidden
 */
interface TierStats {
  remainingTotal: BigNumber;
  price: BigNumber;
  remainingToPurchase: BigNumber;
}

/**
 * @hidden
 */
export const calculateTierStats = (
  tiers: Tier[],
  purchaseAmount: BigNumber,
  maxPrice?: BigNumber
): Omit<TierStats, 'remainingToPurchase'> => {
  const { remainingTotal, price: calculatedPrice } = tiers.reduce<TierStats>(
    (
      {
        remainingToPurchase: prevRemainingToPurchase,
        remainingTotal: prevRemainingTotal,
        price: prevPrice,
      },
      { remaining, price }
    ) => {
      if ((!maxPrice || price.lte(maxPrice)) && !prevRemainingToPurchase.isZero()) {
        const tierPurchaseAmount = remaining.gte(prevRemainingToPurchase)
          ? prevRemainingToPurchase
          : remaining;
        return {
          remainingTotal: prevRemainingTotal.plus(tierPurchaseAmount),
          price: prevPrice.plus(tierPurchaseAmount.multipliedBy(price)),
          remainingToPurchase: new BigNumber(0),
        };
      }
      return {
        remainingTotal: prevRemainingTotal,
        price: prevPrice,
        remainingToPurchase: prevRemainingToPurchase,
      };
    },
    {
      remainingTotal: new BigNumber(0),
      price: new BigNumber(0),
      remainingToPurchase: purchaseAmount,
    }
  );

  return {
    remainingTotal,
    price: calculatedPrice,
  };
};

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
    storage: { purchasePortfolioId, fundingPortfolioId },
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

  const { remainingTotal, price: priceTotal } = calculateTierStats(tiers, purchaseAmount, maxPrice);

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

  if (remainingTotal.lt(purchaseAmount)) {
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
    portfolioIdToMeshPortfolioId(purchasePortfolioId, context),
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
    storage: { purchasePortfolioId, fundingPortfolioId },
    context,
  } = this;

  return {
    identityRoles: [
      { type: RoleType.PortfolioCustodian, portfolioId: purchasePortfolioId },
      { type: RoleType.PortfolioCustodian, portfolioId: fundingPortfolioId },
    ],
    signerPermissions: {
      transactions: [TxTags.sto.Invest],
      tokens: [],
      portfolios: [
        portfolioIdToPortfolio(purchasePortfolioId, context),
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
  { purchasePortfolio, fundingPortfolio }: Params
): Storage {
  return {
    purchasePortfolioId: portfolioLikeToPortfolioId(purchasePortfolio),
    fundingPortfolioId: portfolioLikeToPortfolioId(fundingPortfolio),
  };
}

/**
 * @hidden
 */
export const investInSto = new Procedure(prepareInvestInSto, getAuthorization, prepareStorage);
