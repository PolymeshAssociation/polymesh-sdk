import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import BigNumber from 'bignumber.js';

import {
  ConfidentialAccount,
  ConfidentialAsset,
  ConfidentialVenue,
  Context,
  PolymeshError,
} from '~/internal';
import { asConfidentialAsset } from '~/utils/internal';

/**
 * @hidden
 */
export async function assertConfidentialVenueExists(
  venueId: BigNumber,
  context: Context
): Promise<ConfidentialVenue> {
  const venue = new ConfidentialVenue({ id: venueId }, context);
  const exists = await venue.exists();

  if (!exists) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: "The Confidential Venue doesn't exist",
      data: {
        venueId,
      },
    });
  }

  return venue;
}

/**
 * @hidden
 */
export async function assertConfidentialAccountExists(account: ConfidentialAccount): Promise<void> {
  const exists = await account.exists();

  if (!exists) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: "The Confidential Account doesn't exist",
      data: { publicKey: account.publicKey },
    });
  }
}

/**
 * @hidden
 * */
export async function assertConfidentialAssetsEnabledForVenue(
  venueId: BigNumber,
  assets: ConfidentialAsset[]
): Promise<void> {
  const filterDetails = await Promise.all(
    assets.map(async asset => {
      const details = await asset.getVenueFilteringDetails();

      return {
        details,
        assetId: asset.id,
      };
    })
  );

  filterDetails.forEach(({ assetId, details }) => {
    if (details.enabled) {
      const ids = details.allowedConfidentialVenues.map(({ id }) => id);

      const isVenueNotAllowed = !ids.find(id => id.eq(venueId));

      if (isVenueNotAllowed) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'A confidential asset is not allowed to be exchanged at the corresponding venue',
          data: { assetId, venueId },
        });
      }
    }
  });
}

/**
 * @hidden
 */
export async function assertConfidentialAssetExists(
  asset: ConfidentialAsset | string,
  context: Context
): Promise<void> {
  const parsedAsset = asConfidentialAsset(asset, context);
  const exists = await parsedAsset.exists();

  if (!exists) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: "The Confidential Asset doesn't exist",
      data: { assetId: parsedAsset.id },
    });
  }
}
