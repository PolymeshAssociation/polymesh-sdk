import { SetVenueFilteringParams } from '@polymeshassociation/polymesh-sdk/types';
import { BatchTransactionSpec } from '@polymeshassociation/polymesh-sdk/types/internal';
import { bigNumberToU64, booleanToBool } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import { checkTxType } from '@polymeshassociation/polymesh-sdk/utils/internal';

import { ConfidentialProcedure } from '~/base/ConfidentialProcedure';
import { ConfidentialProcedureAuthorization, RoleType, TxTags } from '~/types';
import { serializeConfidentialAssetId } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = {
  assetId: string;
} & SetVenueFilteringParams;

/**
 * @hidden
 */
export async function prepareConfidentialVenueFiltering(
  this: ConfidentialProcedure<Params, void>,
  args: Params
): Promise<BatchTransactionSpec<void, unknown[][]>> {
  const {
    context: {
      polymeshApi: { tx, query },
    },
    context,
  } = this;

  const { assetId, enabled, allowedVenues, disallowedVenues } = args;
  const rawAssetId = serializeConfidentialAssetId(assetId);
  const transactions = [];

  const isEnabled = await query.confidentialAsset.venueFiltering(rawAssetId);

  if (enabled !== undefined && isEnabled.valueOf() !== enabled) {
    transactions.push(
      checkTxType({
        transaction: tx.confidentialAsset.setVenueFiltering,
        args: [rawAssetId, booleanToBool(enabled, context)],
      })
    );
  }

  if (allowedVenues?.length) {
    transactions.push(
      checkTxType({
        transaction: tx.confidentialAsset.allowVenues,
        args: [rawAssetId, allowedVenues.map(venue => bigNumberToU64(venue, context))],
      })
    );
  }

  if (disallowedVenues?.length) {
    transactions.push(
      checkTxType({
        transaction: tx.confidentialAsset.disallowVenues,
        args: [rawAssetId, disallowedVenues.map(venue => bigNumberToU64(venue, context))],
      })
    );
  }

  return { transactions, resolver: undefined };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: ConfidentialProcedure<Params, void>,
  { assetId, enabled, disallowedVenues, allowedVenues }: Params
): ConfidentialProcedureAuthorization {
  const transactions = [];

  if (enabled !== undefined) {
    transactions.push(TxTags.confidentialAsset.SetVenueFiltering);
  }

  if (allowedVenues?.length) {
    transactions.push(TxTags.confidentialAsset.AllowVenues);
  }

  if (disallowedVenues?.length) {
    transactions.push(TxTags.confidentialAsset.DisallowVenues);
  }

  return {
    roles: [{ type: RoleType.ConfidentialAssetOwner, assetId }],
    permissions: {
      transactions,
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const setConfidentialVenueFiltering = (): ConfidentialProcedure<Params, void> =>
  new ConfidentialProcedure(prepareConfidentialVenueFiltering, getAuthorization);
