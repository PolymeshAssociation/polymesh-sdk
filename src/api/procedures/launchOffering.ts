import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';

import { assertPortfolioExists } from '~/api/procedures/utils';
import {
  Asset,
  Context,
  Identity,
  Offering,
  PolymeshError,
  PostTransactionValue,
  Procedure,
} from '~/internal';
import { ErrorCode, LaunchOfferingParams, PortfolioId, RoleType, TxTags, VenueType } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  bigNumberToBalance,
  bigNumberToU64,
  dateToMoment,
  offeringTierToPriceTier,
  portfolioIdToMeshPortfolioId,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
  stringToBytes,
  stringToTicker,
  u64ToBigNumber,
} from '~/utils/conversion';
import { filterEventRecords, optionize } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = LaunchOfferingParams & {
  ticker: string;
};

/**
 * @hidden
 */
export interface Storage {
  offeringPortfolioId: PortfolioId;
  raisingPortfolioId: PortfolioId;
}

/**
 * @hidden
 */
export const createOfferingResolver =
  (ticker: string, context: Context) =>
  (receipt: ISubmittableResult): Offering => {
    const [{ data }] = filterEventRecords(receipt, 'sto', 'FundraiserCreated');
    const newFundraiserId = u64ToBigNumber(data[1]);

    return new Offering({ id: newFundraiserId, ticker }, context);
  };

/**
 * @hidden
 */
export async function prepareLaunchOffering(
  this: Procedure<Params, Offering, Storage>,
  args: Params
): Promise<PostTransactionValue<Offering>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: { offeringPortfolioId, raisingPortfolioId },
  } = this;
  const { ticker, raisingCurrency, venue, name, tiers, start, end, minInvestment } = args;

  const portfolio = portfolioIdToPortfolio(offeringPortfolioId, context);

  const [, , [{ free }]] = await Promise.all([
    assertPortfolioExists(offeringPortfolioId, context),
    assertPortfolioExists(raisingPortfolioId, context),
    portfolio.getAssetBalances({
      assets: [ticker],
    }),
  ]);

  let venueId: BigNumber | undefined;

  if (venue) {
    const venueExists = await venue.exists();

    if (venueExists) {
      ({ id: venueId } = venue);
    }
  } else {
    const offeringPortfolioOwner = new Identity({ did: offeringPortfolioId.did }, context);
    const venues = await offeringPortfolioOwner.getVenues();

    const offeringVenues = await P.filter(venues, async ownedVenue => {
      const { type } = await ownedVenue.details();

      return type === VenueType.Sto;
    });

    if (offeringVenues.length) {
      [{ id: venueId }] = offeringVenues;
    }
  }

  if (!venueId) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'A valid Venue for the Offering was neither supplied nor found',
    });
  }

  const totalTierBalance = tiers.reduce<BigNumber>(
    (total, { amount }) => total.plus(amount),
    new BigNumber(0)
  );

  if (totalTierBalance.gt(free)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: "There isn't enough free balance in the offering Portfolio",
      data: {
        free,
      },
    });
  }

  const [offering] = this.addTransaction({
    transaction: tx.sto.createFundraiser,
    resolvers: [createOfferingResolver(ticker, context)],
    args: [
      portfolioIdToMeshPortfolioId(offeringPortfolioId, context),
      stringToTicker(ticker, context),
      portfolioIdToMeshPortfolioId(raisingPortfolioId, context),
      stringToTicker(raisingCurrency, context),
      tiers.map(tier => offeringTierToPriceTier(tier, context)),
      bigNumberToU64(venueId, context),
      optionize(dateToMoment)(start, context),
      optionize(dateToMoment)(end, context),
      bigNumberToBalance(minInvestment, context),
      stringToBytes(name, context),
    ],
  });

  return offering;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, Offering, Storage>,
  { ticker }: Params
): ProcedureAuthorization {
  const {
    storage: { offeringPortfolioId, raisingPortfolioId },
    context,
  } = this;

  return {
    roles: [
      { type: RoleType.PortfolioCustodian, portfolioId: offeringPortfolioId },
      { type: RoleType.PortfolioCustodian, portfolioId: raisingPortfolioId },
    ],
    permissions: {
      transactions: [TxTags.sto.CreateFundraiser],
      assets: [new Asset({ ticker }, context)],
      portfolios: [
        portfolioIdToPortfolio(offeringPortfolioId, context),
        portfolioIdToPortfolio(raisingPortfolioId, context),
      ],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, Offering, Storage>,
  { offeringPortfolio, raisingPortfolio }: Params
): Promise<Storage> {
  return {
    offeringPortfolioId: portfolioLikeToPortfolioId(offeringPortfolio),
    raisingPortfolioId: portfolioLikeToPortfolioId(raisingPortfolio),
  };
}

/**
 * @hidden
 */
export const launchOffering = (): Procedure<Params, Offering, Storage> =>
  new Procedure(prepareLaunchOffering, getAuthorization, prepareStorage);
