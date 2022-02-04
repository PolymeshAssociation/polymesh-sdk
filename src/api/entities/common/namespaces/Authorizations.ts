import BigNumber from 'bignumber.js';
import { Authorization } from 'polymesh-types/types';

import { AuthorizationRequest, Identity, Namespace, PolymeshError } from '~/internal';
import { AuthorizationType, ErrorCode, Signer, SignerValue } from '~/types';
import {
  authorizationDataToAuthorization,
  authorizationTypeToMeshAuthorizationType,
  bigNumberToU64,
  booleanToBool,
  identityIdToString,
  momentToDate,
  signerToSignerValue,
  signerValueToSignatory,
  signerValueToSigner,
  u64ToBigNumber,
} from '~/utils/conversion';

/**
 * Handles all Authorization related functionality
 */
export class Authorizations<Parent extends Signer> extends Namespace<Parent> {
  /**
   * Fetch all pending Authorization Requests for which this Signer is the target
   *
   * @param opts.type - fetch only authorizations of this type. Fetches all types if not passed
   * @param opts.includeExpired - whether to include expired authorizations. Defaults to true
   */
  public async getReceived(opts?: {
    type?: AuthorizationType;
    includeExpired?: boolean;
  }): Promise<AuthorizationRequest[]> {
    const {
      context,
      parent,
      context: {
        polymeshApi: { rpc },
      },
    } = this;

    const signerValue = signerToSignerValue(parent);
    const signatory = signerValueToSignatory(signerValue, context);
    const rawBoolean = booleanToBool(opts?.includeExpired ?? true, context);

    let result: Authorization[];

    if (opts?.type) {
      result = await rpc.identity.getFilteredAuthorizations(
        signatory,
        rawBoolean,
        authorizationTypeToMeshAuthorizationType(opts.type, context)
      );
    } else {
      result = await rpc.identity.getFilteredAuthorizations(signatory, rawBoolean);
    }

    return this.createAuthorizationRequests(result.map(auth => ({ auth, target: signerValue })));
  }

  /**
   * Retrieve a single Authorization Request targeting this Signer by its ID
   *
   * @throws if there is no Authorization Request with the passed ID targeting this Signer
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

    return this.createAuthorizationRequests([{ auth: auth.unwrap(), target: signerValue }])[0];
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
          data: authorizationDataToAuthorization(data, context),
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
