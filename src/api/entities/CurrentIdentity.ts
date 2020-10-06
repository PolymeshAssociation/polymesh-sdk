import { u64 } from '@polkadot/types';

import { Identity, Venue } from '~/api/entities';
import {
  createVenue,
  CreateVenueParams,
  inviteAccount,
  InviteAccountParams,
  removeSecondaryKeys,
} from '~/api/procedures';
import { TransactionQueue } from '~/base';
import { SecondaryKey, Signer, SubCallback, UnsubCallback } from '~/types';
import { stringToIdentityId, u64ToBigNumber } from '~/utils';

/**
 * Represents the Identity associated to the current [[Account]]
 */
export class CurrentIdentity extends Identity {
  /**
   * Get the list of secondary keys related to the Identity
   *
   * @note can be subscribed to
   */
  public async getSecondaryKeys(): Promise<SecondaryKey[]>;
  public async getSecondaryKeys(callback: SubCallback<SecondaryKey[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getSecondaryKeys(
    callback?: SubCallback<SecondaryKey[]>
  ): Promise<SecondaryKey[] | UnsubCallback> {
    const { context } = this;

    if (callback) {
      return context.getSecondaryKeys(callback);
    }

    return context.getSecondaryKeys();
  }

  /**
   * Retrieve all Venues created by this Identity
   *
   * @note can be subscribed to
   */
  public async getVenues(): Promise<Venue[]>;
  public async getVenues(callback: SubCallback<Venue[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getVenues(callback?: SubCallback<Venue[]>): Promise<Venue[] | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      did,
      context,
    } = this;

    const assembleResult = (ids: u64[]): Venue[] =>
      ids.map(id => new Venue({ id: u64ToBigNumber(id) }, context));

    const rawDid = stringToIdentityId(did, context);

    if (callback) {
      return settlement.userVenues(rawDid, ids => callback(assembleResult(ids)));
    }

    const venueIds = await context.polymeshApi.query.settlement.userVenues(rawDid);

    return assembleResult(venueIds);
  }

  /**
   * Remove a list of secondary keys associated with the Identity
   */
  public removeSecondaryKeys(args: { signers: Signer[] }): Promise<TransactionQueue<void>> {
    return removeSecondaryKeys.prepare(args, this.context);
  }

  /**
   * Send an invitation to an Account to join to your Identity
   *
   * @note this may create AuthorizationRequest which have to be accepted by
   *   the corresponding Account. An Account or Identity can
   *   fetch its pending Authorization Requests by calling `authorizations.getReceived`
   */
  public inviteAccount(args: InviteAccountParams): Promise<TransactionQueue<void>> {
    return inviteAccount.prepare(args, this.context);
  }

  /**
   * Create a Venue
   */
  public createVenue(args: CreateVenueParams): Promise<TransactionQueue<Venue>> {
    return createVenue.prepare(args, this.context);
  }
}
