import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';

import { assertPortfolioExists } from '~/api/procedures/utils';
import {
  Context,
  Identity,
  PolymeshError,
  PostTransactionValue,
  Procedure,
  SecurityToken,
  Sto,
  Venue,
} from '~/internal';
import { ErrorCode, PortfolioLike, RoleType, StoTier, TxTags, VenueType } from '~/types';
import { PortfolioId, ProcedureAuthorization } from '~/types/internal';
import {
  dateToMoment,
  numberToBalance,
  numberToU64,
  portfolioIdToMeshPortfolioId,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
  stoTierToPriceTier,
  stringToText,
  stringToTicker,
  u64ToBigNumber,
} from '~/utils/conversion';
import { findEventRecord } from '~/utils/internal';

/**
 * @hidden
 */
export interface LaunchStoParams {
  offeringPortfolio?: PortfolioLike;
  raisingPortfolio: PortfolioLike;
  raisingCurrency: string;
  venue?: Venue;
  name: string;
  start?: Date;
  end?: Date;
  tiers: StoTier[];
  minInvestment: BigNumber;
}

/**
 * @hidden
 */
export type Params = LaunchStoParams & {
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
export const createStoResolver = (ticker: string, context: Context) => (
  receipt: ISubmittableResult
): Sto => {
  const { data } = findEventRecord(receipt, 'sto', 'FundraiserCreated');
  const newFundraiserId = u64ToBigNumber(data[1]);

  return new Sto({ id: newFundraiserId, ticker }, context);
};

/**
 * @hidden
 */
export async function prepareLaunchSto(
  this: Procedure<Params, Sto, Storage>,
  args: Params
): Promise<PostTransactionValue<Sto>> {
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
    portfolio.getTokenBalances({
      tokens: [ticker],
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
      const details = await ownedVenue.details();

      return details.type === VenueType.Sto;
    });

    if (offeringVenues.length) {
      [{ id: venueId }] = offeringVenues;
    }
  }

  if (!venueId) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'A valid Venue for the Offering was neither supplied nor found',
    });
  }

  const totalTierBalance = tiers.reduce<BigNumber>(
    (total, { amount }) => total.plus(amount),
    new BigNumber(0)
  );

  if (totalTierBalance.gt(free)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "There isn't enough free balance in the offering Portfolio",
      data: {
        free,
      },
    });
  }

  const [sto] = this.addTransaction(
    tx.sto.createFundraiser,
    {
      resolvers: [createStoResolver(ticker, context)],
    },
    portfolioIdToMeshPortfolioId(offeringPortfolioId, context),
    stringToTicker(ticker, context),
    portfolioIdToMeshPortfolioId(raisingPortfolioId, context),
    stringToTicker(raisingCurrency, context),
    tiers.map(tier => stoTierToPriceTier(tier, context)),
    numberToU64(venueId, context),
    start ? dateToMoment(start, context) : null,
    end ? dateToMoment(end, context) : null,
    numberToBalance(minInvestment, context),
    stringToText(name, context)
  );

  return sto;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, Sto, Storage>,
  { ticker }: Params
): ProcedureAuthorization {
  const {
    storage: { offeringPortfolioId, raisingPortfolioId },
    context,
  } = this;

  return {
    identityRoles: [
      { type: RoleType.TokenPia, ticker },
      { type: RoleType.PortfolioCustodian, portfolioId: offeringPortfolioId },
      { type: RoleType.PortfolioCustodian, portfolioId: raisingPortfolioId },
    ],
    signerPermissions: {
      transactions: [TxTags.sto.CreateFundraiser],
      tokens: [new SecurityToken({ ticker }, context)],
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
  this: Procedure<Params, Sto, Storage>,
  { offeringPortfolio, ticker, raisingPortfolio }: Params
): Promise<Storage> {
  const { context } = this;

  let offeringPortfolioId: PortfolioId;

  if (offeringPortfolio) {
    offeringPortfolioId = portfolioLikeToPortfolioId(offeringPortfolio);
  } else {
    const token = new SecurityToken({ ticker }, context);
    const {
      primaryIssuanceAgent: { did },
    } = await token.details();
    offeringPortfolioId = { did };
  }

  return {
    offeringPortfolioId,
    raisingPortfolioId: portfolioLikeToPortfolioId(raisingPortfolio),
  };
}

/**
 * @hidden
 */
export const launchSto = new Procedure(prepareLaunchSto, getAuthorization, prepareStorage);
