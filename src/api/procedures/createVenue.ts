import { ISubmittableResult } from '@polkadot/types/types';

import { Context, PostTransactionValue, Procedure, Venue } from '~/internal';
import { TxTags, VenueType } from '~/types';
import { stringToVenueDetails, u64ToBigNumber, venueTypeToMeshVenueType } from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

export interface CreateVenueParams {
  description: string;
  type: VenueType;
}

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

  const rawDetails = stringToVenueDetails(description, context);
  const rawType = venueTypeToMeshVenueType(type, context);

  // NOTE @monitz87: we're sending an empty signer array for the moment
  const [newVenue] = this.addTransaction(
    settlement.createVenue,
    {
      resolvers: [createCreateVenueResolver(context)],
    },
    rawDetails,
    [],
    rawType
  );

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
