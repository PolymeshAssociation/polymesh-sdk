import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure, Sto } from '~/internal';
import {
  ErrorCode,
  PortfolioLike,
  RoleType,
  StoSaleStatus,
  StoTimingStatus,
  Tier,
  TxTags,
} from '~/types';
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
  /**
   * portfolio in which the purchased Assets will be stored
   */
  purchasePortfolio: PortfolioLike;
  /**
   * portfolio from which funds will be withdrawn to pay for the Assets
   */
  fundingPortfolio: PortfolioLike;
  /**
   * amount of Assets to purchase
   */
  purchaseAmount: BigNumber;
  /**
   * maximum average price to pay per Asset (optional)
   */
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
      if (!prevRemainingToPurchase.isZero()) {
        const tierPurchaseAmount = BigNumber.minimum(remaining, prevRemainingToPurchase);
        const newRemainingTotal = prevRemainingTotal.plus(tierPurchaseAmount);
        const newPrice = prevPrice.plus(tierPurchaseAmount.multipliedBy(price));
        const newRemainingToPurchase = prevRemainingToPurchase.minus(tierPurchaseAmount);
        const newAvgPrice = newPrice.dividedBy(purchaseAmount.minus(newRemainingToPurchase));

        if (!maxPrice || newAvgPrice.lte(maxPrice)) {
          return {
            remainingTotal: newRemainingTotal,
            price: newPrice,
            remainingToPurchase: newRemainingToPurchase,
          };
        }
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

  const {
    status: { sale, timing },
    minInvestment,
    tiers,
    raisingCurrency,
  } = await sto.details();

  const [{ free: freeAssetBalance }] = await portfolio.getAssetBalances({
    assets: [raisingCurrency],
  });

  if (sale !== StoSaleStatus.Live || timing !== StoTimingStatus.Started) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The STO is not accepting investments at the moment',
    });
  }

  const { remainingTotal, price: priceTotal } = calculateTierStats(tiers, purchaseAmount, maxPrice);

  if (priceTotal.lt(minInvestment)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Minimum investment not reached',
      data: { priceTotal },
    });
  }

  if (freeAssetBalance.lt(priceTotal)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'The Portfolio does not have enough free balance for this investment',
      data: { free: freeAssetBalance, priceTotal },
    });
  }

  if (remainingTotal.lt(purchaseAmount)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: `The STO does not have enough remaining tokens${
        maxPrice ? ' below the stipulated max price' : ''
      }`,
    });
  }

  this.addTransaction({
    transaction: txSto.invest,
    args: [
      portfolioIdToMeshPortfolioId(purchasePortfolioId, context),
      portfolioIdToMeshPortfolioId(fundingPortfolioId, context),
      stringToTicker(ticker, context),
      numberToU64(id, context),
      numberToBalance(purchaseAmount, context),
      maxPrice ? numberToBalance(maxPrice, context) : null,
      null,
    ],
  });
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
    roles: [
      { type: RoleType.PortfolioCustodian, portfolioId: purchasePortfolioId },
      { type: RoleType.PortfolioCustodian, portfolioId: fundingPortfolioId },
    ],
    permissions: {
      transactions: [TxTags.sto.Invest],
      assets: [],
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
export const investInSto = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareInvestInSto, getAuthorization, prepareStorage);
