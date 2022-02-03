import { PolymeshError, Procedure, Venue } from '~/internal';
import { ErrorCode, RoleType, TxTags, VenueType } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { numberToU64, stringToVenueDetails, venueTypeToMeshVenueType } from '~/utils/conversion';

export type ModifyVenueParams =
  | {
      description?: string;
      type: VenueType;
    }
  | {
      description: string;
      type?: VenueType;
    }
  | {
      description: string;
      type: VenueType;
    };

/**
 * @hidden
 */
export type Params = { venue: Venue } & ModifyVenueParams;

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

  const { venue, description, type } = args;

  const { id: venueId } = venue;

  const { description: currentDescription, type: currentType } = await venue.details();

  if (currentDescription === description) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'New description is the same as the current one',
    });
  }

  if (currentType === type) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'New type is the same as the current one',
    });
  }

  if (description) {
    this.addTransaction({
      transaction: tx.settlement.updateVenueDetails,
      args: [numberToU64(venueId, context), stringToVenueDetails(description, context)],
    });
  }

  if (type) {
    this.addTransaction({
      transaction: tx.settlement.updateVenueType,
      args: [numberToU64(venueId, context), venueTypeToMeshVenueType(type, context)],
    });
  }
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { venue: { id: venueId }, description, type }: Params
): ProcedureAuthorization {
  const transactions = [];

  if (description) {
    transactions.push(TxTags.settlement.UpdateVenueDetails);
  }

  if (type) {
    transactions.push(TxTags.settlement.UpdateVenueType);
  }

  return {
    roles: [{ type: RoleType.VenueOwner, venueId }],
    permissions: {
      assets: [],
      portfolios: [],
      transactions,
    },
  };
}

/**
 * @hidden
 */
export const modifyVenue = (): Procedure<Params, void> =>
  new Procedure(prepareModifyVenue, getAuthorization);
