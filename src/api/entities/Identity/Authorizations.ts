import { u64 } from '@polkadot/types';

import { AuthorizationRequest } from '~/api/entities';
import { Namespace } from '~/base';
import { Authorization } from '~/polkadot';
import { AuthorizationType, PaginationOptions, ResultSet } from '~/types';
import { SignerType } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  authorizationDataToAuthorization,
  momentToDate,
  requestPaginated,
  signatoryToSigner,
  signerToSignatory,
  u64ToBigNumber,
} from '~/utils';

import { Identity } from './';

/**
 * Handles all Identity Authorization related functionality
 */
export class Authorizations extends Namespace<Identity> {
  public async getReceived(opts: {
    pagination: PaginationOptions;
  }): Promise<ResultSet<AuthorizationRequest>>;

  public async getReceived(opts: {
    filterByType: AuthorizationType;
  }): Promise<ResultSet<AuthorizationRequest>>;

  public async getReceived(opts?: {
    pagination: PaginationOptions;
    filterByType: AuthorizationType;
  }): Promise<ResultSet<AuthorizationRequest>>;

  /**
   * Fetch all pending authorization requests for which this identity is the target
   *
   * @note supports pagination
   */
  public async getReceived(opts?: {
    pagination?: PaginationOptions;
    filterByType?: AuthorizationType;
  }): Promise<ResultSet<AuthorizationRequest>> {
    const {
      context: { polymeshApi },
      context,
      parent: { did },
    } = this;

    const signatory = signerToSignatory({ type: SignerType.Identity, value: did }, context);

    const { entries, lastKey: next } = await requestPaginated(
      polymeshApi.query.identity.authorizations,
      {
        arg: signatory,
        paginationOpts: opts?.pagination || undefined,
      }
    );

    const data = this.createAuthorizationRequests(
      entries.map(([, auth]) => ({ auth, target: did })),
      opts?.filterByType
    );

    return {
      data,
      next,
    };
  }

  public async getSent(opts: {
    pagination: PaginationOptions;
  }): Promise<ResultSet<AuthorizationRequest>>;

  public async getSent(opts: {
    filterByType: AuthorizationType;
  }): Promise<ResultSet<AuthorizationRequest>>;

  public async getSent(opts?: {
    pagination: PaginationOptions;
    filterByType: AuthorizationType;
  }): Promise<ResultSet<AuthorizationRequest>>;

  /**
   * Fetch all pending authorization requests issued by this identity
   */
  public async getSent(opts?: {
    pagination?: PaginationOptions;
    filterByType?: AuthorizationType;
  }): Promise<ResultSet<AuthorizationRequest>> {
    const {
      context: { polymeshApi },
      context,
      parent: { did },
    } = this;

    const sig = signerToSignatory({ type: SignerType.Identity, value: did }, context);

    const { entries, lastKey: next } = await requestPaginated(
      polymeshApi.query.identity.authorizationsGiven,
      {
        arg: sig,
        paginationOpts: opts?.pagination,
      }
    );

    const authQueryParams = entries.map(([storageKey, signatory]) =>
      tuple(signatory, storageKey.args[1] as u64)
    );

    const authorizations = await polymeshApi.query.identity.authorizations.multi<Authorization>(
      authQueryParams
    );

    const data = this.createAuthorizationRequests(
      authorizations.map((auth, index) => ({
        auth,
        target: signatoryToSigner(authQueryParams[index][0]).value,
      })),
      opts?.filterByType
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
  private createAuthorizationRequests(
    auths: { auth: Authorization; target: string }[],
    filterByType?: AuthorizationType
  ): AuthorizationRequest[] {
    const { context } = this;
    let result = auths
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
      .filter(({ expiry }) => expiry === null || expiry > new Date());

    if (filterByType) {
      result = result.filter(({ data }) => data.type === filterByType);
    }

    return result.map(args => {
      return new AuthorizationRequest(args, context);
    });
  }
}
