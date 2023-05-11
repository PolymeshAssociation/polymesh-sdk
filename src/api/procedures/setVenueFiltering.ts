import { Asset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, SetVenueFilteringParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';

/**
 * @hidden
 */
export type Params = SetVenueFilteringParams;

/**
 * @hidden
 */
export async function prepareVenueFiltering(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'settlement', 'setVenueFiltering'>>> {
  const {
    context: {
      polymeshApi: { tx, query },
    },
  } = this;

  const { ticker, enabled: setEnabled } = args;

  const isEnabled = await query.settlement.venueFiltering(ticker);

  console.log({ isEnabled, setEnabled });

  if (isEnabled.valueOf() === setEnabled) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: `Venue filtering is already ${setEnabled ? 'enabled' : 'disabled'}`,
    });
  }

  return {
    transaction: tx.settlement.setVenueFiltering,
    args: [ticker, setEnabled],
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
  return {
    permissions: {
      transactions: [TxTags.settlement.SetVenueFiltering],
      assets: [new Asset({ ticker }, this.context)],
    },
  };
}

/**
 * @hidden
 */
export const setVenueFiltering = (): Procedure<Params, void> =>
  new Procedure(prepareVenueFiltering, getAuthorization);
