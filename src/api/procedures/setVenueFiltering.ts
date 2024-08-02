import { BaseAsset, Procedure } from '~/internal';
import { SetVenueFilteringParams, TxTags } from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import { assetToMeshAssetId, bigNumberToU64, booleanToBool } from '~/utils/conversion';
import { checkTxType } from '~/utils/internal';
/**
 * @hidden
 */
export type Params = {
  asset: BaseAsset;
} & SetVenueFilteringParams;

/**
 * @hidden
 */
export async function prepareVenueFiltering(
  this: Procedure<Params, void>,
  args: Params
): Promise<BatchTransactionSpec<void, unknown[][]>> {
  const {
    context: {
      polymeshApi: { tx, query },
    },
    context,
  } = this;

  const { asset, enabled, allowedVenues, disallowedVenues } = args;
  const rawAssetId = assetToMeshAssetId(asset, context);
  const transactions = [];

  const isEnabled = await query.settlement.venueFiltering(rawAssetId);

  if (enabled !== undefined && isEnabled.valueOf() !== enabled) {
    transactions.push(
      checkTxType({
        transaction: tx.settlement.setVenueFiltering,
        args: [rawAssetId, booleanToBool(enabled, context)],
      })
    );
  }

  if (allowedVenues?.length) {
    transactions.push(
      checkTxType({
        transaction: tx.settlement.allowVenues,
        args: [rawAssetId, allowedVenues.map(venue => bigNumberToU64(venue, context))],
      })
    );
  }

  if (disallowedVenues?.length) {
    transactions.push(
      checkTxType({
        transaction: tx.settlement.disallowVenues,
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
  { asset, enabled, disallowedVenues, allowedVenues }: Params
): ProcedureAuthorization {
  const transactions = [];

  if (enabled !== undefined) {
    transactions.push(TxTags.settlement.SetVenueFiltering);
  }

  if (allowedVenues?.length) {
    transactions.push(TxTags.settlement.AllowVenues);
  }

  if (disallowedVenues?.length) {
    transactions.push(TxTags.settlement.DisallowVenues);
  }

  return {
    permissions: {
      transactions,
      assets: [asset],
    },
  };
}

/**
 * @hidden
 */
export const setVenueFiltering = (): Procedure<Params, void> =>
  new Procedure(prepareVenueFiltering, getAuthorization);
