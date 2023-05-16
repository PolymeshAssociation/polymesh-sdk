import { Asset, Procedure } from '~/internal';
import { ManageAllowedVenuesParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';

/**
 * @hidden
 */
export type Params = ManageAllowedVenuesParams;

/**
 * @hidden
 */
export async function prepareManageAllowedVenues(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'settlement', 'allowVenues'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
  } = this;

  const { ticker, venues, action } = args;

  return {
    transaction: action === 'allow' ? tx.settlement.allowVenues : tx.settlement.disallowVenues,
    args: [ticker, venues],
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
        action === 'allow' ? TxTags.settlement.AllowVenues : TxTags.settlement.DisallowVenues,
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
