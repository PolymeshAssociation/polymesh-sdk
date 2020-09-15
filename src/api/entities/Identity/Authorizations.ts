import { u64 } from '@polkadot/types';
import { Authorization } from 'polymesh-types/types';

import { AuthorizationRequest } from '~/api/entities';
import { Namespace } from '~/base';
import { AuthorizationType, PaginationOptions, ResultSet, SignerType } from '~/types';
import { tuple } from '~/types/utils';
import {
  authorizationDataToAuthorization,
  authorizationTypeToMeshAuthorizationType,
  booleanToBool,
  identityIdToString,
  momentToDate,
  requestPaginated,
  signatoryToSigner,
  signerToSignatory,
  stringToIdentityId,
  u64ToBigNumber,
} from '~/utils';

import { Identity } from './';

/**
 * Handles all Identity Authorization related functionality
 */
export class Authorizations extends Namespace<Identity> {
  /**
   * Fetch all pending authorization requests for which this identity is the target
   *
   * @param opts.type - fetch only authorizations of this type. Fetches all types if not passed
   * @param opts.includeExpired - whether to include expired authorizations. Defaults to true
   */
  public async getReceived(opts: { type: AuthorizationType }): Promise<AuthorizationRequest[]>;

  public async getReceived(opts: { includeExpired: boolean }): Promise<AuthorizationRequest[]>;

  public async getReceived(opts?: {
    type: AuthorizationType;
    includeExpired: boolean;
  }): Promise<AuthorizationRequest[]>;

  // eslint-disable-next-line require-jsdoc
  public async getReceived(opts?: {
    type?: AuthorizationType;
    includeExpired?: boolean;
  }): Promise<AuthorizationRequest[]> {
    const {
      context,
      parent: { did },
      context: {
        polymeshApi: { rpc },
      },
    } = this;

    const signatory = signerToSignatory({ type: SignerType.Identity, value: did }, context);
    const rawBoolean = booleanToBool(opts?.includeExpired ?? true, context);
    const rawAuthorizationType = opts?.type
      ? authorizationTypeToMeshAuthorizationType(opts.type, context)
      : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Authorization[] = await (rpc as any).identity.getFilteredAuthorizations(
      signatory,
      rawBoolean,
      rawAuthorizationType
    );

    const data = this.createAuthorizationRequests(result.map(auth => ({ auth, target: did })));

    return data;
  }

  /**
   * Fetch all pending authorization requests issued by this identity
   *
   * @note supports pagination
   */
  public async getSent(
    paginationOpts?: PaginationOptions
  ): Promise<ResultSet<AuthorizationRequest>> {
    const {
      context,
      parent: { did },
      context: {
        polymeshApi: {
          query: { identity },
        },
      },
    } = this;

    const { entries, lastKey: next } = await requestPaginated(identity.authorizationsGiven, {
      arg: stringToIdentityId(did, context),
      paginationOpts,
    });

    const authQueryParams = entries.map(([storageKey, signatory]) =>
      tuple(signatory, storageKey.args[1] as u64)
    );

    const authorizations = await identity.authorizations.multi<Authorization>(authQueryParams);

    const data = this.createAuthorizationRequests(
      authorizations.map((auth, index) => ({
        auth,
        target: signatoryToSigner(authQueryParams[index][0]).value,
      }))
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
    auths: { auth: Authorization; target: string }[]
  ): AuthorizationRequest[] {
    const { context } = this;
    return auths.map(auth => {
      const {
        auth: { expiry, auth_id: authId, authorization_data: data, authorized_by: issuer },
        target,
      } = auth;

      return new AuthorizationRequest(
        {
          authId: u64ToBigNumber(authId),
          expiry: expiry.isSome ? momentToDate(expiry.unwrap()) : null,
          data: authorizationDataToAuthorization(data),
          targetDid: target,
          issuerDid: identityIdToString(issuer),
        },
        context
      );
    });
  }
}
