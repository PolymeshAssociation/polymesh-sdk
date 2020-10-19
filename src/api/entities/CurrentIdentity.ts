import { u64 } from '@polkadot/types';
import { Instruction as MeshInstruction } from 'polymesh-types/types';

import { Identity, Instruction, Venue } from '~/api/entities';
import {
  createVenue,
  CreateVenueParams,
  inviteAccount,
  InviteAccountParams,
  removeSecondaryKeys,
} from '~/api/procedures';
import { TransactionQueue } from '~/base';
import { SecondaryKey, Signer, SubCallback, UnsubCallback } from '~/types';
import { portfolioIdToMeshPortfolioId,stringToIdentityId, u64ToBigNumber } from '~/utils';

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

  /**
   * Retrieve all pending Instructions involving the Current Identity
   */
  public async getPendingInstructions(): Promise<Instruction[]> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      did,
      context,
    } = this;

    const auths = await settlement.userAuths.entries(
      portfolioIdToMeshPortfolioId({ did }, context)
    );

    const instructionIds = auths.map(([key]) => key.args[1] as u64);

    const meshInstructions = await settlement.instructionDetails.multi<MeshInstruction>(
      instructionIds
    );

    return meshInstructions
      .filter(({ status }) => status.isPending)
      .map(({ instruction_id: id }) => new Instruction({ id: u64ToBigNumber(id) }, context));
  }
}
