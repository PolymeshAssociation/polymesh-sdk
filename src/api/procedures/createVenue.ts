import { ISubmittableResult } from '@polkadot/types/types';

import { Context, PostTransactionValue, Procedure, Venue } from '~/internal';
import { TxTags, VenueType } from '~/types';
import { stringToVenueDetails, u64ToBigNumber, venueTypeToMeshVenueType } from '~/utils/conversion';
import { findEventRecord } from '~/utils/internal';

export interface CreateVenueParams {
  details: string;
  type: VenueType;
}

/**
 * @hidden
 */
export const createCreateVenueResolver = (context: Context) => (
  receipt: ISubmittableResult
): Venue => {
  const { data } = findEventRecord(receipt, 'settlement', 'VenueCreated');
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
  const { details, type } = args;

  const rawDetails = stringToVenueDetails(details, context);
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
export const createVenue = new Procedure(prepareCreateVenue, {
  signerPermissions: {
    transactions: [TxTags.settlement.CreateVenue],
    tokens: [],
    portfolios: [],
  },
});
