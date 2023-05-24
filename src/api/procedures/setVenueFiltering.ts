import { Asset, Procedure } from '~/internal';
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
  const { context } = this;
  const {
    polymeshApi: { tx, query },
  } = context;
  const { ticker, enabled, allowedVenues, disallowedVenues } = args;
  const rawTicker = stringToTicker(ticker, context);
  const transactions = [];

  const isEnabled = await query.settlement.venueFiltering(ticker);

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
        args: [rawTicker, allowedVenues.map(v => bigNumberToU64(v, context))],
      })
    );
  }

  if (disallowedVenues?.length) {
    transactions.push(
      checkTxType({
        transaction: tx.settlement.disallowVenues,
        args: [rawTicker, disallowedVenues.map(v => bigNumberToU64(v, context))],
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
      assets: [new Asset({ ticker }, context)],
    },
  };
}

/**
 * @hidden
 */
export const setVenueFiltering = (): Procedure<Params, void> =>
  new Procedure(prepareVenueFiltering, getAuthorization);
