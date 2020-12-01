import BigNumber from 'bignumber.js';

import { Entity, Identity } from '~/api/entities';
import { consumeAuthorizationRequests, consumeJoinIdentityAuthorization } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import { Authorization, AuthorizationType, Signer } from '~/types';

export interface UniqueIdentifiers {
  authId: BigNumber;
}

export interface Params {
  target: Signer;
  issuer: Identity;
  expiry: Date | null;
  data: Authorization;
}

/**
 * Represents a request made by an Identity to another Identity (or account) for some sort of authorization. This has multiple uses. For example, if Alice
 *   wants to transfer ownership of her asset ALICETOKEN to Bob, an authorization request gets emitted to Bob,
 *   who then has to accept it in order for the ownership transfer to be complete
 */
export class AuthorizationRequest extends Entity<UniqueIdentifiers> {
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
   * authorization request data corresponding to type of authorization
   *
   * | Type                        | Data      |
   * |-----------------------------|-----------|
   * | Attest Primary Key Rotation | DID       |
   * | Rotate Primary Key          | DID       |
   * | Transfer Ticker             | Ticker    |
   * | Add MultiSig Signer         | Account   |
   * | Transfer Token Ownership    | Ticker    |
   * | Join Identity               | DID       |
   * | Portfolio Custody           | Portfolio |
   * | Custom                      | Custom    |
   * | No Data                     | N/A       |
   */
  public data: Authorization;

  /**
   * date at which the authorization request expires and can no longer be accepted.
   *   At this point, a new authorization request must be emitted. Null if the request never expires
   */
  public expiry: Date | null;

  /**
   * internal identifier for the request (used to accept/reject/cancel)
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
  }

  /**
   * Accept the authorization request. You must be the target of the request to be able to accept it
   */
  public accept(): Promise<TransactionQueue> {
    const {
      context,
      data: { type },
    } = this;

    if (type === AuthorizationType.JoinIdentity) {
      return consumeJoinIdentityAuthorization.prepare({ authRequest: this, accept: true }, context);
    }

    return consumeAuthorizationRequests.prepare({ authRequests: [this], accept: true }, context);
  }

  /**
   * Remove the authorization request
   *
   * - If you are the request issuer, this will cancel the authorization
   * - If you are the request target, this will reject the authorization
   */
  public remove(): Promise<TransactionQueue> {
    const {
      context,
      data: { type },
    } = this;

    if (type === AuthorizationType.JoinIdentity) {
      return consumeJoinIdentityAuthorization.prepare(
        { authRequest: this, accept: false },
        context
      );
    }

    return consumeAuthorizationRequests.prepare(
      { authRequests: [this], accept: false },
      this.context
    );
  }

  /**
   * Returns whether the Authorization Request has expired
   */
  public isExpired(): boolean {
    const { expiry } = this;

    return expiry !== null && expiry < new Date();
  }
}
