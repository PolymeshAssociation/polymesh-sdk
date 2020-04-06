import { AuthorizationRequest } from '~/api/entities';
import { Namespace } from '~/base';
import { SignerType } from '~/types/internal';
import {
  authorizationDataToAuthorization,
  momentToDate,
  signatoryToSigner,
  signerToSignatory,
  u64ToBigNumber,
} from '~/utils';

import { Identity } from './';

/**
 * Handles all Identity Authorization related functionality
 */
export class Authorizations extends Namespace<Identity> {
  /**
   * Fetch all pending authorization requests for which this identity is the target
   */
  public async getReceived(): Promise<AuthorizationRequest[]> {
    const {
      context: { polymeshApi },
      context,
      parent: { did },
    } = this;

    const entries = await polymeshApi.query.identity.authorizations.entries(
      signerToSignatory({ type: SignerType.Identity, value: did }, context)
    );

    return entries
      .map(([, auth]) => {
        const {
          expiry,
          auth_id: authId,
          authorization_data: data,
          authorized_by: issuerDid,
        } = auth;

        return {
          authId: u64ToBigNumber(authId),
          expiry: expiry.isSome ? momentToDate(expiry.unwrap()) : null,
          data: authorizationDataToAuthorization(data),
          targetDid: did,
          issuerDid: signatoryToSigner(issuerDid).value,
        };
      })
      .filter(({ expiry }) => expiry === null || expiry > new Date())
      .map(args => {
        return new AuthorizationRequest(args, context);
      });
  }
}
