import { Asset, Procedure } from '~/internal';
import { ManageAllowedVenuesParams, ManageVenuesAction, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToU64, stringToTicker } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = ManageAllowedVenuesParams & {
  action: ManageVenuesAction;
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareManageAllowedVenues(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'settlement', 'allowVenues'>>> {
  const { context } = this;
  const {
    polymeshApi: { tx },
  } = context;

  const { ticker, venues, action } = args;

  const rawTicker = stringToTicker(ticker, context);
  const rawVenues = venues.map(v => bigNumberToU64(v, context));

  return {
    transaction:
      action === ManageVenuesAction.Allow
        ? tx.settlement.allowVenues
        : tx.settlement.disallowVenues,
    args: [rawTicker, rawVenues],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker, action }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [
        action === ManageVenuesAction.Allow
          ? TxTags.settlement.AllowVenues
          : TxTags.settlement.DisallowVenues,
      ],
      assets: [new Asset({ ticker }, this.context)],
    },
  };
}

/**
 * @hidden
 */
export const manageAllowedVenues = (): Procedure<Params, void> =>
  new Procedure(prepareManageAllowedVenues, getAuthorization);
