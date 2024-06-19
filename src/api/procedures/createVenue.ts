import { ISubmittableResult } from '@polkadot/types/types';

import { Context, PolymeshError, Procedure, Venue } from '~/internal';
import { CreateVenueParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import {
  stringToAccountId,
  stringToBytes,
  u32ToBigNumber,
  u64ToBigNumber,
  venueTypeToMeshVenueType,
} from '~/utils/conversion';
import { asAccount, filterEventRecords } from '~/utils/internal';

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
): Promise<TransactionSpec<Venue, ExtrinsicParams<'settlement', 'createVenue'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { settlement },
        consts: {
          settlement: { maxNumberOfVenueSigners },
        },
      },
    },
    context,
  } = this;
  const { description, type, signers = [] } = args;

  const rawDetails = stringToBytes(description, context);
  const rawType = venueTypeToMeshVenueType(type, context);

  const maxVenueSigners = u32ToBigNumber(maxNumberOfVenueSigners);

  if (maxVenueSigners.lt(signers.length)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Maximum number of venue signers exceeded',
      data: { maxVenueSigners },
    });
  }

  const rawSigners = signers.map(signer =>
    stringToAccountId(asAccount(signer, context).address, context)
  );

  return {
    transaction: settlement.createVenue,
    args: [rawDetails, rawSigners, rawType],
    resolver: createCreateVenueResolver(context),
  };
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
