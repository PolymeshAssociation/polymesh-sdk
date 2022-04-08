import BigNumber from 'bignumber.js';

import { AuthorizationRequest, Authorizations, Identity } from '~/internal';
import { PaginationOptions, ResultSet } from '~/types';
import { QueryReturnType, tuple } from '~/types/utils';
import { bigNumberToU64, signatoryToSignerValue, stringToIdentityId } from '~/utils/conversion';
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
      context: {
        polymeshApi: {
          query: { identity },
        },
      },
      context,
      parent: { did },
    } = this;

    const { entries, lastKey: next } = await requestPaginated(identity.authorizationsGiven, {
      arg: stringToIdentityId(did, context),
      paginationOpts,
    });

    const authQueryParams = entries.map(([storageKey, signatory]) =>
      tuple(signatory, storageKey.args[1])
    );

    const authorizations = await identity.authorizations.multi<
      QueryReturnType<typeof identity.authorizations>
    >(authQueryParams);

    const data = this.createAuthorizationRequests(
      authorizations.map((auth, index) => ({
        auth: auth.unwrap(),
        target: signatoryToSignerValue(authQueryParams[index][0]),
      }))
    );

    return {
      data,
      next,
    };
  }

  /**
   * Retrieve a single Authorization Request targeting or issued by this Identity by its ID
   *
   * @throws if there is no Authorization Request with the passed ID targeting or issued by this Identity
   */
  public override async getOne(args: { id: BigNumber }): Promise<AuthorizationRequest> {
    const {
      context,
      parent: { did },
      context: {
        polymeshApi: {
          query: { identity },
        },
      },
    } = this;

    const { id } = args;

    const rawId = bigNumberToU64(id, context);

    const targetSignatory = await identity.authorizationsGiven(
      stringToIdentityId(did, context),
      rawId
    );

    if (!targetSignatory.isEmpty) {
      const auth = await identity.authorizations(targetSignatory, rawId);
      const signerValue = signatoryToSignerValue(targetSignatory);

      return this.createAuthorizationRequests([{ auth: auth.unwrap(), target: signerValue }])[0];
    }

    return super.getOne({ id });
  }
}
