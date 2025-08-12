import { PalletStoFundingMethod } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { Offering, PolymeshError, Procedure } from '~/internal';
import {
  ErrorCode,
  FungibleAsset,
  InvestInOfferingParams,
  OffChainFundingReceipt,
  OfferingSaleStatus,
  OfferingTimingStatus,
  PortfolioId,
  Role,
  RoleType,
  Tier,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  bigNumberToBalance,
  bigNumberToU64,
  fundingToRawFunding,
  offChainFundingReceiptDetailsToMeshReceiptDetails,
  portfolioIdToMeshPortfolioId,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
} from '~/utils/conversion';
import { optionize } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = InvestInOfferingParams & {
  id: BigNumber;
  asset: FungibleAsset;
};

/**
 * @hidden
 */
export type Storage = {
  purchasePortfolioId: PortfolioId;
} & (
  | {
      fundingPortfolioId: PortfolioId;
    }
  | {
      offChainFundingReceipt: OffChainFundingReceipt;
      offChainTicker: string;
    }
);

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
): Promise<TransactionSpec<void, ExtrinsicParams<'txSto', 'invest'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { sto: txSto },
      },
    },
    context,
    storage: { purchasePortfolioId },
    storage,
  } = this;
  const {
    asset: { id: assetId },
    asset,
    id,
    purchaseAmount,
    maxPrice,
  } = args;

  const offering = new Offering({ id, assetId }, context);

  const {
    status: { sale, timing },
    minInvestment,
    tiers,
    raisingCurrency,
  } = await offering.details();

  if (sale !== OfferingSaleStatus.Live || timing !== OfferingTimingStatus.Started) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Offering is not accepting investments at the moment',
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

  const portfolio = portfolioIdToPortfolio(purchasePortfolioId, context);

  const [{ free: freeAssetBalance }] = await portfolio.getAssetBalances({
    assets: [raisingCurrency],
  });

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
      message: `The Offering does not have enough remaining tokens${
        maxPrice ? ' below the stipulated max price' : ''
      }`,
    });
  }

  const rawAssetId = assetToMeshAssetId(asset, context);

  let rawFunding: PalletStoFundingMethod;
  if ('fundingPortfolioId' in storage) {
    const { fundingPortfolioId } = storage;
    const rawFundingPortfolioId = portfolioIdToMeshPortfolioId(fundingPortfolioId, context);

    rawFunding = fundingToRawFunding(context, {
      portfolioId: rawFundingPortfolioId,
    });
  } else {
    const { offChainFundingReceipt, offChainTicker } = storage;

    const details = await offering.offChainFundingDetails();
    if (!details.enabled) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Offchain funding is not enabled for this Offering',
      });
    }

    if (details.offChainTicker !== offChainTicker) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Offchain funding is not enabled for the given ticker',
        data: {
          offChainTicker: details.offChainTicker,
        },
      });
    }

    rawFunding = fundingToRawFunding(context, {
      receiptDetails: offChainFundingReceiptDetailsToMeshReceiptDetails(
        offChainFundingReceipt,
        context
      ),
    });
  }

  return {
    transaction: txSto.invest,
    args: [
      rawAssetId,
      bigNumberToU64(id, context),
      portfolioIdToMeshPortfolioId(purchasePortfolioId, context),
      rawFunding,
      bigNumberToBalance(purchaseAmount, context),
      optionize(bigNumberToBalance)(maxPrice, context),
    ],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(this: Procedure<Params, void, Storage>): ProcedureAuthorization {
  const { storage, context } = this;

  const { purchasePortfolioId } = storage;

  const roles: Role[] = [{ type: RoleType.PortfolioCustodian, portfolioId: purchasePortfolioId }];
  const portfolios = [portfolioIdToPortfolio(purchasePortfolioId, context)];

  if ('fundingPortfolioId' in storage) {
    portfolios.push(portfolioIdToPortfolio(storage.fundingPortfolioId, context));
    roles.push({ type: RoleType.PortfolioCustodian, portfolioId: storage.fundingPortfolioId });
  }

  return {
    roles,
    permissions: {
      transactions: [TxTags.sto.Invest],
      assets: [],
      portfolios,
    },
  };
}

/**
 * @hidden
 */
export function prepareStorage(this: Procedure<Params, void, Storage>, params: Params): Storage {
  const { purchasePortfolio } = params;

  if ('offChainFundingReceipt' in params) {
    return {
      purchasePortfolioId: portfolioLikeToPortfolioId(purchasePortfolio),
      offChainFundingReceipt: params.offChainFundingReceipt,
      offChainTicker: params.offChainTicker,
    };
  }

  return {
    purchasePortfolioId: portfolioLikeToPortfolioId(purchasePortfolio),
    fundingPortfolioId: portfolioLikeToPortfolioId(params.fundingPortfolio),
  };
}

/**
 * @hidden
 */
export const investInOffering = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareInvestInSto, getAuthorization, prepareStorage);
