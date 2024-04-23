import { Identity as PublicIdentity } from '@polymeshassociation/polymesh-sdk/internal';
import {
  boolToBoolean,
  stringToIdentityId,
  u64ToBigNumber,
} from '@polymeshassociation/polymesh-sdk/utils/conversion';
import { requestPaginated } from '@polymeshassociation/polymesh-sdk/utils/internal';

import { ConfidentialTransaction, ConfidentialVenue } from '~/internal';
import { ConfidentialAffirmation, PaginationOptions, ResultSet } from '~/types';
import {
  confidentialLegPartyToRole,
  confidentialTransactionIdToBigNumber,
  confidentialTransactionLegIdToBigNumber,
} from '~/utils/conversion';

/**
 * Properties that uniquely identify an Identity
 */
export interface UniqueIdentifiers {
  did: string;
}

/**
 * Represents an Identity in the Polymesh blockchain
 */
export class Identity extends PublicIdentity {
  /**
   * @hidden
   * Checks if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { did } = identifier as UniqueIdentifiers;

    return typeof did === 'string';
  }

  /**
   * Get Confidential Transactions affirmations involving this identity
   *
   * @note supports pagination
   */
  public async getInvolvedConfidentialTransactions(
    paginationOpts?: PaginationOptions
  ): Promise<ResultSet<ConfidentialAffirmation>> {
    const {
      did,
      context,
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
    } = this;

    const { entries, lastKey: next } = await requestPaginated(confidentialAsset.userAffirmations, {
      arg: did,
      paginationOpts,
    });

    const data = entries.map(entry => {
      const [key, value] = entry;
      const affirmed = boolToBoolean(value.unwrap());
      const [rawTransactionId, rawLegId, rawLegParty] = key.args[1];

      const transactionId = confidentialTransactionIdToBigNumber(rawTransactionId);
      const legId = confidentialTransactionLegIdToBigNumber(rawLegId);
      const role = confidentialLegPartyToRole(rawLegParty);

      const transaction = new ConfidentialTransaction({ id: transactionId }, context);

      return {
        affirmed,
        legId,
        transaction,
        role,
      };
    });

    return {
      data,
      next,
    };
  }

  /**
   * Retrieve all Confidential Venues created by this Identity
   */
  public async getConfidentialVenues(): Promise<ConfidentialVenue[]> {
    const {
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
      did,
      context,
    } = this;

    const rawDid = stringToIdentityId(did, context);

    const venueIdsKeys = await confidentialAsset.identityVenues.keys(rawDid);

    return venueIdsKeys.map(key => {
      const rawVenueId = key.args[1];

      return new ConfidentialVenue({ id: u64ToBigNumber(rawVenueId) }, context);
    });
  }
}
