import { ISubmittableResult } from '@polkadot/types/types';

import { ConfidentialVenue, Context, Procedure } from '~/internal';
import { TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { u64ToBigNumber } from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

/**
 * @hidden
 */
export const createConfidentialVenueResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): ConfidentialVenue => {
    const [{ data }] = filterEventRecords(receipt, 'confidentialAsset', 'VenueCreated');

    const id = u64ToBigNumber(data[1]);

    return new ConfidentialVenue({ id }, context);
  };

/**
 * @hidden
 */
export async function prepareCreateConfidentialVenue(
  this: Procedure<void, ConfidentialVenue>
): Promise<
  TransactionSpec<ConfidentialVenue, ExtrinsicParams<'confidentialAsset', 'createVenue'>>
> {
  const {
    context: {
      polymeshApi: {
        tx: { confidentialAsset },
      },
    },
    context,
  } = this;

  return {
    transaction: confidentialAsset.createVenue,
    resolver: createConfidentialVenueResolver(context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(this: Procedure<void, ConfidentialVenue>): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.confidentialAsset.CreateVenue],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const createConfidentialVenue = (): Procedure<void, ConfidentialVenue> =>
  new Procedure(prepareCreateConfidentialVenue, getAuthorization);
