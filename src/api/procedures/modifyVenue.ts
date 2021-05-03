import BigNumber from 'bignumber.js';

import { Venue } from '~/api/entities/Venue';
import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RoleType, TxTags, VenueType } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { numberToU64, stringToVenueDetails, venueTypeToMeshVenueType } from '~/utils/conversion';

export type ModifyVenueParams =
  | {
      details?: string;
      type: VenueType;
    }
  | {
      details: string;
      type?: VenueType;
    }
  | {
      details: string;
      type: VenueType;
    };

/**
 * @hidden
 */
export type Params = { venueId: BigNumber } & ModifyVenueParams;

/**
 * @hidden
 */
export async function prepareModifyVenue(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { venueId, details, type } = args;

  const venue = new Venue({ id: venueId }, context);

  const { description, type: currentType } = await venue.details();

  if (details && description === details) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'New detail is the same as current one',
    });
  }

  if (type && currentType === type) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'New type is the same as current one',
    });
  }

  this.addTransaction(
    tx.settlement.updateVenue,
    {},
    numberToU64(venueId, context),
    details ? stringToVenueDetails(details, context) : null,
    type ? venueTypeToMeshVenueType(type, context) : null
  );
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { venueId }: Params
): ProcedureAuthorization {
  return {
    identityRoles: [{ type: RoleType.VenueOwner, venueId }],
    signerPermissions: {
      tokens: [],
      portfolios: [],
      transactions: [TxTags.settlement.UpdateVenue],
    },
  };
}

/**
 * @hidden
 */
export const modifyVenue = (): Procedure<Params, void> =>
  new Procedure(prepareModifyVenue, getAuthorization);
