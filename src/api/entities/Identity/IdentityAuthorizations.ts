import { Authorization } from 'polymesh-types/types';

import { AuthorizationRequest, Authorizations, Identity } from '~/internal';
import { PaginationOptions, ResultSet } from '~/types';
import { tuple } from '~/types/utils';
import { signatoryToSignerValue, stringToIdentityId } from '~/utils/conversion';
import { requestPaginated } from '~/utils/internal';

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
      tuple(signatory, storageKey.args[1])
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
