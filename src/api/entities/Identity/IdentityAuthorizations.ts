import { u64 } from '@polkadot/types';
import { Authorization } from 'polymesh-types/types';

import { AuthorizationRequest, Identity } from '~/api/entities';
import { PaginationOptions, ResultSet } from '~/types';
import { tuple } from '~/types/utils';
import { requestPaginated, signatoryToSignerValue, stringToIdentityId } from '~/utils';

import { Authorizations } from '../common/namespaces/Authorizations';

/**
 * Handles all Identity Authorization related functionality
 */
export class IdentityAuthorizations extends Authorizations<Identity> {
  /**
   * Fetch all pending authorization requests issued by this Identity
   *
   * @note supports pagination
   */
  public async getSent(
    paginationOpts?: PaginationOptions
  ): Promise<ResultSet<AuthorizationRequest>> {
    const {
      context: { polymeshApi },
      context,
      parent: { did },
    } = this;

    const { entries, lastKey: next } = await requestPaginated(
      polymeshApi.query.identity.authorizationsGiven,
      {
        arg: stringToIdentityId(did, context),
        paginationOpts,
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
        target: signatoryToSignerValue(authQueryParams[index][0]),
      }))
    );

    return {
      data,
      next,
    };
  }
}
