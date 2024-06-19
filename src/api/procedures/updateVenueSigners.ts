import { difference, intersection } from 'lodash';

import { PolymeshError, Procedure, Venue } from '~/internal';
import { ErrorCode, RoleType, TxTags, UpdateVenueSignersParams } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  bigNumberToU64,
  booleanToBool,
  stringToAccountId,
  u32ToBigNumber,
} from '~/utils/conversion';
import { asAccount } from '~/utils/internal';

export type Params = UpdateVenueSignersParams & {
  addSigners: boolean;
  venue: Venue;
};

/**
 * @hidden
 */
export async function prepareUpdateVenueSigners(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'settlement', 'updateVenueSigners'>>> {
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
  const { signers, addSigners, venue } = args;

  const allowedSigners = await venue.getAllowedSigners();

  const allowedSignerAddresses = allowedSigners.map(({ address }) => address);

  const signerParams = signers.map(signer => asAccount(signer, context).address);

  if (addSigners) {
    const present = intersection(signerParams, allowedSignerAddresses);
    if (present.length) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'One or more of the supplied signers are already added to the Venue',
        data: {
          present,
        },
      });
    }

    const maxVenueSigners = u32ToBigNumber(maxNumberOfVenueSigners);

    if (maxVenueSigners.lt(allowedSignerAddresses.length + signerParams.length)) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Maximum number of venue signers exceeded',
        data: { maxVenueSigners },
      });
    }
  } else {
    const absent = difference(signerParams, allowedSignerAddresses);
    if (absent.length) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'One or more of the supplied signers are not added to the Venue',
        data: {
          absent,
        },
      });
    }
  }

  return {
    transaction: settlement.updateVenueSigners,
    args: [
      bigNumberToU64(venue.id, context),
      signerParams.map(signer => stringToAccountId(signer, context)),
      booleanToBool(addSigners, context),
    ],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { venue: { id: venueId } }: Params
): ProcedureAuthorization {
  return {
    roles: [{ type: RoleType.VenueOwner, venueId }],
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [TxTags.settlement.UpdateVenueSigners],
    },
  };
}

/**
 * @hidden
 */
export const updateVenueSigners = (): Procedure<Params, void> =>
  new Procedure(prepareUpdateVenueSigners, getAuthorization);
