import { FungibleAsset, Procedure } from '~/internal';
import { SetVenueFilteringParams, TxTags } from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import { bigNumberToU64, booleanToBool, stringToTicker } from '~/utils/conversion';
import { checkTxType } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = {
  ticker: string;
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

  const { ticker, enabled, allowedVenues, disallowedVenues } = args;
  const rawTicker = stringToTicker(ticker, context);
  const transactions = [];

  const isEnabled = await query.settlement.venueFiltering(rawTicker);

  if (enabled !== undefined && isEnabled.valueOf() !== enabled) {
    transactions.push(
      checkTxType({
        transaction: tx.settlement.setVenueFiltering,
        args: [rawTicker, booleanToBool(enabled, context)],
      })
    );
  }

  if (allowedVenues?.length) {
    transactions.push(
      checkTxType({
        transaction: tx.settlement.allowVenues,
        args: [rawTicker, allowedVenues.map(venue => bigNumberToU64(venue, context))],
      })
    );
  }

  if (disallowedVenues?.length) {
    transactions.push(
      checkTxType({
        transaction: tx.settlement.disallowVenues,
        args: [rawTicker, disallowedVenues.map(venue => bigNumberToU64(venue, context))],
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
  { ticker, enabled, disallowedVenues, allowedVenues }: Params
): ProcedureAuthorization {
  const { context } = this;

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
      assets: [new FungibleAsset({ ticker }, context)],
    },
  };
}

/**
 * @hidden
 */
export const setVenueFiltering = (): Procedure<Params, void> =>
  new Procedure(prepareVenueFiltering, getAuthorization);
