import { Asset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, SetVenueFilteringParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { booleanToBool, stringToTicker } from '~/utils/conversion';

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
): Promise<TransactionSpec<void, ExtrinsicParams<'settlement', 'setVenueFiltering'>>> {
  const { context } = this;
  const {
    polymeshApi: { tx, query },
  } = context;

  const { ticker, enabled } = args;

  const isEnabled = await query.settlement.venueFiltering(ticker);

  if (isEnabled.valueOf() === enabled) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: `Venue filtering is already ${enabled ? 'enabled' : 'disabled'}`,
    });
  }

  return {
    transaction: tx.settlement.setVenueFiltering,
    args: [stringToTicker(ticker, context), booleanToBool(enabled, context)],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker }: Params
): ProcedureAuthorization {
  const { context } = this;

  return {
    permissions: {
      transactions: [TxTags.settlement.SetVenueFiltering],
      assets: [new Asset({ ticker }, context)],
    },
  };
}

/**
 * @hidden
 */
export const setVenueFiltering = (): Procedure<Params, void> =>
  new Procedure(prepareVenueFiltering, getAuthorization);
