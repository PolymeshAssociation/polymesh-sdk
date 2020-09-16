import { Authorization } from 'polymesh-types/types';

import { AuthorizationRequest, Identity, Namespace } from '~/api/entities';
import { PaginationOptions, ResultSet, Signer } from '~/types';
import { SignerValue } from '~/types/internal';
import {
  authorizationDataToAuthorization,
  identityIdToString,
  momentToDate,
  requestPaginated,
  signerToSignerValue,
  signerValueToSignatory,
  signerValueToSigner,
  u64ToBigNumber,
} from '~/utils';

/**
 * Handles all Authorization related functionality
 */
export class Authorizations<Parent extends Signer> extends Namespace<Parent> {
  /**
   * Fetch all pending authorization requests for which this identity is the target
   *
   * @note supports pagination
   */
  public async getReceived(
    paginationOpts?: PaginationOptions
  ): Promise<ResultSet<AuthorizationRequest>> {
    const {
      context: { polymeshApi },
      context,
      parent,
    } = this;

    const signer = signerToSignerValue(parent);

    const signatory = signerValueToSignatory(signer, context);

    const { entries, lastKey: next } = await requestPaginated(
      polymeshApi.query.identity.authorizations,
      {
        arg: signatory,
        paginationOpts,
      }
    );

    const data = this.createAuthorizationRequests(
      entries.map(([, auth]) => ({ auth, target: signer }))
    );

    return {
      data,
      next,
    };
  }

  /**
   * @hidden
   *
   * Create an array of AuthorizationRequests from an array of on-chain Authorizations
   */
  protected createAuthorizationRequests(
    auths: { auth: Authorization; target: SignerValue }[]
  ): AuthorizationRequest[] {
    const { context } = this;
    return auths
      .map(auth => {
        const {
          auth: { expiry, auth_id: authId, authorization_data: data, authorized_by: issuer },
          target: rawTarget,
        } = auth;

        const target = signerValueToSigner(rawTarget, context);

        return {
          authId: u64ToBigNumber(authId),
          expiry: expiry.isSome ? momentToDate(expiry.unwrap()) : null,
          data: authorizationDataToAuthorization(data),
          target,
          issuer: new Identity({ did: identityIdToString(issuer) }, context),
        };
      })
      .filter(({ expiry }) => expiry === null || expiry > new Date())
      .map(args => {
        return new AuthorizationRequest(args, context);
      });
  }
}
