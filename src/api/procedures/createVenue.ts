import { ISubmittableResult } from '@polkadot/types/types';

import { Context, PostTransactionValue, Procedure, Venue } from '~/internal';
import { CreateVenueParams, TxTags } from '~/types';
import { stringToBytes, u64ToBigNumber, venueTypeToMeshVenueType } from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

/**
 * @hidden
 */
export const createCreateVenueResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): Venue => {
    const [{ data }] = filterEventRecords(receipt, 'settlement', 'VenueCreated');
    const id = u64ToBigNumber(data[1]);

    return new Venue({ id }, context);
  };

/**
 * @hidden
 */
export async function prepareCreateVenue(
  this: Procedure<CreateVenueParams, Venue>,
  args: CreateVenueParams
): Promise<PostTransactionValue<Venue>> {
  const {
    context: {
      polymeshApi: {
        tx: { settlement },
      },
    },
    context,
  } = this;
  const { description, type } = args;

  const rawDetails = stringToBytes(description, context);
  const rawType = venueTypeToMeshVenueType(type, context);

  // NOTE @monitz87: we're sending an empty signer array for the moment
  const [newVenue] = this.addTransaction({
    transaction: settlement.createVenue,
    resolvers: [createCreateVenueResolver(context)],
    args: [rawDetails, [], rawType],
  });

  return newVenue;
}

/**
 * @hidden
 */
export const createVenue = (): Procedure<CreateVenueParams, Venue> =>
  new Procedure(prepareCreateVenue, {
    permissions: {
      transactions: [TxTags.settlement.CreateVenue],
      assets: [],
      portfolios: [],
    },
  });
