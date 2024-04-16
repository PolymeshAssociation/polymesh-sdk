import { ISubmittableResult } from '@polkadot/types/types';
import { TransactionSpec } from '@polymeshassociation/polymesh-sdk/types/internal';
import { u64ToBigNumber } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import { filterEventRecords } from '@polymeshassociation/polymesh-sdk/utils/internal';

import { ConfidentialProcedure } from '~/base/ConfidentialProcedure';
import { ConfidentialVenue, Context } from '~/internal';
import { ConfidentialProcedureAuthorization, TxTags } from '~/types';
import { ExtrinsicParams } from '~/types/internal';

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
  this: ConfidentialProcedure<void, ConfidentialVenue>
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
export function getAuthorization(
  this: ConfidentialProcedure<void, ConfidentialVenue>
): ConfidentialProcedureAuthorization {
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
export const createConfidentialVenue = (): ConfidentialProcedure<void, ConfidentialVenue> =>
  new ConfidentialProcedure(prepareCreateConfidentialVenue, getAuthorization);
