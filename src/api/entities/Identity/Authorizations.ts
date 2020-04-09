import { u64 } from '@polkadot/types';

import { AuthorizationRequest } from '~/api/entities';
import { Namespace } from '~/base';
import { Authorization } from '~/polkadot';
import { SignerType } from '~/types/internal';
import { tuple } from '~/types/utils';
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

    return this.createAuthorizationRequests(entries.map(([, auth]) => ({ auth, target: did })));
  }

  /**
   * Fetch all pending authorization requests issued by this identity
   */
  public async getSent(): Promise<AuthorizationRequest[]> {
    const {
      context: { polymeshApi },
      context,
      parent: { did },
    } = this;

    const givenAuthEntries = await polymeshApi.query.identity.authorizationsGiven.entries(
      signerToSignatory({ type: SignerType.Identity, value: did }, context)
    );

    const authQueryParams = givenAuthEntries.map(([storageKey, signatory]) =>
      tuple(signatory, storageKey.args[1] as u64)
    );

    const authorizations = await polymeshApi.query.identity.authorizations.multi<Authorization>(
      authQueryParams
    );

    return this.createAuthorizationRequests(
      authorizations.map((auth, index) => ({
        auth,
        target: signatoryToSigner(authQueryParams[index][0]).value,
      }))
    );
  }

  /**
   * @hidden
   *
   * Create an array of AuthorizationRequests from an array of on-chain Authorizations
   */
  private createAuthorizationRequests(
    auths: { auth: Authorization; target: string }[]
  ): AuthorizationRequest[] {
    const { context } = this;
    return auths
      .map(auth => {
        const {
          auth: { expiry, auth_id: authId, authorization_data: data, authorized_by: issuer },
          target,
        } = auth;

        return {
          authId: u64ToBigNumber(authId),
          expiry: expiry.isSome ? momentToDate(expiry.unwrap()) : null,
          data: authorizationDataToAuthorization(data),
          targetDid: target,
          issuerDid: signatoryToSigner(issuer).value,
        };
      })
      .filter(({ expiry }) => expiry === null || expiry > new Date())
      .map(args => {
        return new AuthorizationRequest(args, context);
      });
  }
}
