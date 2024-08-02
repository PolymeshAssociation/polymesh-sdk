import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';

import { assertPortfolioExists } from '~/api/procedures/utils';
import { Context, FungibleAsset, Identity, Offering, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, LaunchOfferingParams, PortfolioId, RoleType, TxTags, VenueType } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  bigNumberToBalance,
  bigNumberToU64,
  dateToMoment,
  offeringTierToPriceTier,
  portfolioIdToMeshPortfolioId,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
  stringToBytes,
  u64ToBigNumber,
} from '~/utils/conversion';
import { asBaseAssetV2, filterEventRecords, optionize } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = LaunchOfferingParams & {
  asset: FungibleAsset;
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
  (assetId: string, context: Context) =>
  (receipt: ISubmittableResult): Offering => {
    const [{ data }] = filterEventRecords(receipt, 'sto', 'FundraiserCreated');
    const newFundraiserId = u64ToBigNumber(data[1]);

    return new Offering({ id: newFundraiserId, assetId }, context);
  };

/**
 * @hidden
 */
export async function prepareLaunchOffering(
  this: Procedure<Params, Offering, Storage>,
  args: Params
): Promise<TransactionSpec<Offering, ExtrinsicParams<'sto', 'createFundraiser'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: { offeringPortfolioId, raisingPortfolioId },
  } = this;
  const { asset, raisingCurrency, venue, name, tiers, start, end, minInvestment } = args;

  const portfolio = portfolioIdToPortfolio(offeringPortfolioId, context);

  const [, , [{ free }]] = await Promise.all([
    assertPortfolioExists(offeringPortfolioId, context),
    assertPortfolioExists(raisingPortfolioId, context),
    portfolio.getAssetBalances({
      assets: [asset],
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

  const rawAssetId = assetToMeshAssetId(asset, context);
  const raisingAsset = await asBaseAssetV2(raisingCurrency, context);

  return {
    transaction: tx.sto.createFundraiser,
    args: [
      portfolioIdToMeshPortfolioId(offeringPortfolioId, context),
      rawAssetId,
      portfolioIdToMeshPortfolioId(raisingPortfolioId, context),
      assetToMeshAssetId(raisingAsset, context),
      tiers.map(tier => offeringTierToPriceTier(tier, context)),
      bigNumberToU64(venueId, context),
      optionize(dateToMoment)(start, context),
      optionize(dateToMoment)(end, context),
      bigNumberToBalance(minInvestment, context),
      stringToBytes(name, context),
    ],
    resolver: createOfferingResolver(asset.id, context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, Offering, Storage>,
  { asset }: Params
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
      assets: [asset],
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
