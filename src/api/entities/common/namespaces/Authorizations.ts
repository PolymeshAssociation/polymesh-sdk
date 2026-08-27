import { Vec } from '@polkadot/types/codec';
import { PolymeshPrimitivesAuthorization } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { Account, AuthorizationRequest, Identity, Namespace, PolymeshError } from '~/internal';
import { AuthorizationArgs, authorizationsQuery } from '~/middleware/queries/authorizations';
import {
  Authorization as MiddlewareAuthorization,
  AuthorizationsOrderBy,
  AuthorizationStatusEnum,
  AuthTypeEnum,
  Query,
} from '~/middleware/types';
import { AuthorizationType, ErrorCode, ResultSet, Signer, SignerType, SignerValue } from '~/types';
import { Ensured, QueryArgs } from '~/types/utils';
import {
  addressToKey,
  authorizationDataToAuthorization,
  authorizationTypeToMeshAuthorizationType,
  bigNumberToU64,
  booleanToBool,
  identityIdToString,
  keyToAddress,
  middlewareAuthorizationDataToAuthorization,
  momentToDate,
  signerToSignerValue,
  signerValueToSignatory,
  signerValueToSigner,
  u64ToBigNumber,
} from '~/utils/conversion';
import { calculateNextKey } from '~/utils/internal';

/**
 * Handles all Authorization related functionality
 */
export class Authorizations<Parent extends Signer> extends Namespace<Parent> {
  /**
   * Fetch all pending Authorization Requests for which this Signer is the target
   *
   * @param opts.type - fetch only authorizations of this type. Fetches all types if not passed
   * @param opts.includeExpired - whether to include expired authorizations. Defaults to true.
   *   The chain applies this filter, against the timestamp of the last block
   *
   * @note expired Authorization Requests can be told apart with {@link api/entities/AuthorizationRequest!AuthorizationRequest.isExpired | isExpired}
   */
  public async getReceived(opts?: {
    type?: AuthorizationType;
    includeExpired?: boolean;
  }): Promise<AuthorizationRequest[]> {
    const {
      context,
      parent,
      context: {
        polymeshApi: { call },
      },
    } = this;

    const { identityApi } = call;

    const signerValue = signerToSignerValue(parent);
    const signatory = signerValueToSignatory(signerValue, context);
    const rawBoolean = booleanToBool(opts?.includeExpired ?? true, context);

    let result: Vec<PolymeshPrimitivesAuthorization>;

    if (opts?.type) {
      result = await identityApi.getFilteredAuthorizations(
        signatory,
        rawBoolean,
        authorizationTypeToMeshAuthorizationType(opts.type, context)
      );
    } else {
      result = await identityApi.getFilteredAuthorizations(signatory, rawBoolean, null);
    }

    return this.createAuthorizationRequests(result.map(auth => ({ auth, target: signerValue })));
  }

  /**
   * Retrieve a single Authorization Request targeting this Signer by its ID
   *
   * @throws if there is no Authorization Request with the passed ID targeting this Signer
   *
   * @note an expired Authorization Request is still returned — it exists on chain until it is
   *   consumed or removed. Check {@link api/entities/AuthorizationRequest!AuthorizationRequest.isExpired | isExpired} before acting on it
   */
  public async getOne(args: { id: BigNumber }): Promise<AuthorizationRequest> {
    const {
      context,
      parent,
      context: {
        polymeshApi: { query },
      },
    } = this;
    const { id } = args;

    const signerValue = signerToSignerValue(parent);
    const signatory = signerValueToSignatory(signerValue, context);
    const rawId = bigNumberToU64(id, context);

    const auth = await query.identity.authorizations(signatory, rawId);

    if (auth.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Authorization Request does not exist',
      });
    }

    return this.createAuthorizationRequests([{ auth: auth.unwrap(), target: signerValue }])[0]!;
  }

  /**
   * @hidden
   *
   * Create an array of AuthorizationRequests from an array of on-chain Authorizations
   *
   * @note expired Authorizations are **not** filtered out here. Filtering made `getReceived`'s
   *   `includeExpired` inert (the chain already applies it), turned an expired `getOne` into an
   *   `undefined` behind a non-null assertion, and made `getSent` return short pages with a live cursor
   */
  protected createAuthorizationRequests(
    auths: { auth: PolymeshPrimitivesAuthorization; target: SignerValue }[]
  ): AuthorizationRequest[] {
    const { context } = this;

    return auths
      .map(auth => {
        const {
          auth: { expiry, authId, authorizationData: data, authorizedBy: issuer },
          target: rawTarget,
        } = auth;

        const target = signerValueToSigner(rawTarget, context);

        return {
          authId: u64ToBigNumber(authId),
          expiry: expiry.isSome ? momentToDate(expiry.unwrap()) : null,
          data: authorizationDataToAuthorization(data, context),
          target,
          issuer: new Identity({ did: identityIdToString(issuer) }, context),
        };
      })
      .map(args => {
        return new AuthorizationRequest(args, context);
      });
  }

  /**
   * Fetch all historical Authorization Requests for which this Signer is the target
   *
   * @param opts.type - fetch only authorizations of this type. Fetches all types if not passed
   * @param opts.status - fetch only authorizations with this status. Fetches all statuses if not passed
   * @param opts.size - page size
   * @param opts.start - page offset
   * @param opts.orderBy - how to order the results: one key, or several to decide the rows a
   *   single key leaves tied. The read's own unique key is appended to whatever is passed, so
   *   that paging cannot repeat or skip a row
   *
   * @note supports pagination
   * @note uses the middlewareV2
   */
  public async getHistoricalAuthorizations(
    opts: {
      status?: AuthorizationStatusEnum;
      type?: AuthTypeEnum;
      size?: BigNumber;
      start?: BigNumber;
      orderBy?: AuthorizationsOrderBy | AuthorizationsOrderBy[];
    } = {}
  ): Promise<ResultSet<AuthorizationRequest>> {
    const { context, parent } = this;

    const signerValue = signerToSignerValue(parent);

    const { status, type, start, size, orderBy } = opts;

    const filters: QueryArgs<MiddlewareAuthorization, AuthorizationArgs> = {
      type,
      status,
    };
    if (signerValue.type === SignerType.Identity) {
      filters.toId = signerValue.value;
    } else {
      filters.toKey = addressToKey(signerValue.value, context);
    }

    const {
      data: {
        authorizations: { totalCount, nodes: authorizationResult },
      },
    } = await context.queryMiddleware<Ensured<Query, 'authorizations'>>(
      authorizationsQuery(filters, size, start, orderBy)
    );

    const data = authorizationResult.map(middlewareAuthorization => {
      const {
        id,
        type: authType,
        data: authData,
        fromId,
        toId,
        toKey,
        expiry,
      } = middlewareAuthorization;

      return new AuthorizationRequest(
        {
          authId: new BigNumber(id),
          expiry: expiry ? new Date(expiry) : null,
          data: middlewareAuthorizationDataToAuthorization(context, authType, authData),
          target: toId
            ? new Identity({ did: toId }, context)
            : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              new Account({ address: keyToAddress(toKey!, context) }, context),
          issuer: new Identity({ did: fromId }, context),
        },
        context
      );
    });

    const count = new BigNumber(totalCount);

    const next = calculateNextKey(count, data.length, start);

    return {
      data,
      next,
      count,
    };
  }
}
