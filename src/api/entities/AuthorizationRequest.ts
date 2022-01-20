import BigNumber from 'bignumber.js';

import {
  consumeAddMultiSigSignerAuthorization,
  ConsumeAddMultiSigSignerAuthorizationParams,
  consumeAuthorizationRequests,
  ConsumeAuthorizationRequestsParams,
  consumeJoinIdentityAuthorization,
  ConsumeJoinIdentityAuthorizationParams,
  Context,
  Entity,
  Identity,
} from '~/internal';
import {
  Authorization,
  AuthorizationType,
  NoArgsProcedureMethod,
  Signer,
  SignerValue,
} from '~/types';
import { HumanReadableType } from '~/types/utils';
import { numberToU64, signerToSignerValue, signerValueToSignatory } from '~/utils/conversion';
import { createProcedureMethod, toHumanReadable } from '~/utils/internal';

export interface UniqueIdentifiers {
  authId: BigNumber;
}

interface HumanReadable {
  issuer: HumanReadableType<Identity>;
  expiry: string | null;
  target: SignerValue;
  data: HumanReadableType<Authorization>;
  id: string;
}

export interface Params {
  target: Signer;
  issuer: Identity;
  expiry: Date | null;
  data: Authorization;
}

/**
 * Represents a request made by an Identity to another Identity (or Account) for some sort of authorization. This has multiple uses. For example, if Alice
 *   wants to transfer ownership of her asset ALICETOKEN to Bob, an authorization request gets emitted to Bob,
 *   who then has to accept it in order for the ownership transfer to be complete
 */
export class AuthorizationRequest extends Entity<UniqueIdentifiers, HumanReadable> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { authId } = identifier as UniqueIdentifiers;

    return authId instanceof BigNumber;
  }

  /**
   * Identity or Account to which the request was emitted
   */
  public target: Signer;

  /**
   * Identity that emitted the request
   */
  public issuer: Identity;

  /**
   * Authorization Request data corresponding to type of Authorization
   *
   * | Type                        | Data                            |
   * |-----------------------------|---------------------------------|
   * | Add Relayer Paying Key      | Beneficiary, Relayer, Allowance |
   * | Become Agent                | Permission Group                |
   * | Attest Primary Key Rotation | DID                             |
   * | Rotate Primary Key          | DID                             |
   * | Transfer Ticker             | Ticker                          |
   * | Add MultiSig Signer         | Account                         |
   * | Transfer Token Ownership    | Ticker                          |
   * | Join Identity               | DID                             |
   * | Portfolio Custody           | Portfolio                       |
   */
  public data: Authorization;

  /**
   * date at which the Authorization Request expires and can no longer be accepted.
   *   At this point, a new Authorization Request must be emitted. Null if the Request never expires
   */
  public expiry: Date | null;

  /**
   * internal identifier for the Request (used to accept/reject/cancel)
   */
  public authId: BigNumber;

  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers & Params, context: Context) {
    const { target, issuer, expiry, data, ...identifiers } = args;

    super(identifiers, context);

    const { authId } = identifiers;

    this.target = target;
    this.issuer = issuer;
    this.authId = authId;
    this.expiry = expiry;
    this.data = data;

    this.accept = createProcedureMethod<
      | ConsumeAuthorizationRequestsParams
      | ConsumeJoinIdentityAuthorizationParams
      | ConsumeAddMultiSigSignerAuthorizationParams,
      void,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    >(
      {
        getProcedureAndArgs: () => {
          switch (this.data.type) {
            case AuthorizationType.JoinIdentity: {
              return [consumeJoinIdentityAuthorization, { authRequest: this, accept: true }];
            }
            case AuthorizationType.AddMultiSigSigner: {
              return [consumeAddMultiSigSignerAuthorization, { authRequest: this, accept: true }];
            }
            default: {
              return [consumeAuthorizationRequests, { authRequests: [this], accept: true }];
            }
          }
        },
        voidArgs: true,
      },
      context
    );

    this.remove = createProcedureMethod<
      | ConsumeAuthorizationRequestsParams
      | ConsumeJoinIdentityAuthorizationParams
      | ConsumeAddMultiSigSignerAuthorizationParams,
      void,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    >(
      {
        getProcedureAndArgs: () => {
          switch (this.data.type) {
            case AuthorizationType.JoinIdentity: {
              return [consumeJoinIdentityAuthorization, { authRequest: this, accept: false }];
            }
            case AuthorizationType.AddMultiSigSigner: {
              return [consumeAddMultiSigSignerAuthorization, { authRequest: this, accept: false }];
            }
            default: {
              return [consumeAuthorizationRequests, { authRequests: [this], accept: false }];
            }
          }
        },
        voidArgs: true,
      },
      context
    );
  }

  /**
   * Accept the Authorization Request. You must be the target of the Request to be able to accept it
   */
  public accept: NoArgsProcedureMethod<void>;

  /**
   * Remove the Authorization Request
   *
   * - If you are the Request issuer, this will cancel the Authorization
   * - If you are the Request target, this will reject the Authorization
   */
  public remove: NoArgsProcedureMethod<void>;

  /**
   * Returns whether the Authorization Request has expired
   */
  public isExpired(): boolean {
    const { expiry } = this;

    return expiry !== null && expiry < new Date();
  }

  /**
   * Determine whether this Authorization Request exists on chain
   */
  public async exists(): Promise<boolean> {
    const { authId, target, context } = this;

    const auth = await context.polymeshApi.query.identity.authorizations(
      signerValueToSignatory(signerToSignerValue(target), context),
      numberToU64(authId, context)
    );

    return auth.isSome;
  }

  /**
   * Return the Authorization's static data
   */
  public toJson(): HumanReadable {
    const { data, issuer, target, expiry, authId } = this;

    return toHumanReadable({
      id: authId,
      expiry,
      data,
      issuer,
      target: signerToSignerValue(target),
    });
  }
}
