import { Authorization } from 'polymesh-types/types';

import { AuthorizationRequest, Identity, Namespace } from '~/api/entities';
import { AuthorizationType, Signer } from '~/types';
import { SignerValue } from '~/types/internal';
import {
  authorizationDataToAuthorization,
  authorizationTypeToMeshAuthorizationType,
  booleanToBool,
  identityIdToString,
  momentToDate,
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
    const rawAuthorizationType = opts?.type
      ? authorizationTypeToMeshAuthorizationType(opts.type, context)
      : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Authorization[] = await (rpc as any).identity.getFilteredAuthorizations(
      signatory,
      rawBoolean,
      rawAuthorizationType
    );

    const data = this.createAuthorizationRequests(
      result.map(auth => ({ auth, target: signerValue }))
    );

    return data;
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
