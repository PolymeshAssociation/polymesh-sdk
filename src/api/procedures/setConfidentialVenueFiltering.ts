import { Procedure } from '~/internal';
import { RoleType, SetVenueFilteringParams, TxTags } from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import { bigNumberToU64, booleanToBool, serializeConfidentialAssetId } from '~/utils/conversion';
import { checkTxType } from '~/utils/internal';

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
  this: Procedure<Params, void>,
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
  this: Procedure<Params, void>,
  { assetId, enabled, disallowedVenues, allowedVenues }: Params
): ProcedureAuthorization {
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
export const setConfidentialVenueFiltering = (): Procedure<Params, void> =>
  new Procedure(prepareConfidentialVenueFiltering, getAuthorization);
