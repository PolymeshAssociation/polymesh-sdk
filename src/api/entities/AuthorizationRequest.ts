import BigNumber from 'bignumber.js';

import { Identity } from '~/api/entities/Identity';
import { consumeAuthorizationRequests } from '~/api/procedures';
import { Entity, TransactionQueue } from '~/base';
import { Context } from '~/context';
import { Authorization } from '~/types';

export interface UniqueIdentifiers {
  authId: BigNumber;
}

export interface Params {
  targetDid: string;
  issuerDid: string;
  expiry: Date | null;
  data: Authorization;
}

/**
 * Represents a request made by an identity to another identity for some sort of authorization. This has multiple uses. For example, if Alice
 * wants to transfer ownership of her asset ALICETOKEN to Bob, an authorization request gets emitted to Bob,
 * who then has to accept it in order for the ownership transfer to be complete
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
   * Identity to which the request was emitted
   */
  public targetIdentity: Identity;

  /**
   * Identity that emitted the request
   */
  public issuerIdentity: Identity;

  /**
   * authorization request data corresponding to type of authorization
   *
   * | Type                       | Data   |
   * |----------------------------|--------|
   * | Attest Master Key Rotation | DID    |
   * | Rotate Master Key          | DID    |
   * | Transfer Ticker            | Ticker |
   * | Add MultiSig Signer        | N/A    |
   * | Transfer Token Ownership   | Ticker |
   * | Join Identity              | DID    |
   * | Custom                     | Custom |
   * | No Data                    | N/A    |
   */
  public data: Authorization;

  /**
   * date at which the authorization request expires and can no longer be accepted.
   * At this point, a new authorization request must be emitted. Null if the request never expires
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
    const { targetDid, issuerDid, expiry, data, ...identifiers } = args;

    super(identifiers, context);

    const { authId } = identifiers;

    this.targetIdentity = new Identity({ did: targetDid }, context);
    this.issuerIdentity = new Identity({ did: issuerDid }, context);
    this.authId = authId;
    this.expiry = expiry;
    this.data = data;
  }

  /**
   * Accept the authorization request. You must be the target of the request to be able to accept it
   */
  public accept(): Promise<TransactionQueue> {
    return consumeAuthorizationRequests.prepare(
      { authRequests: [this], accept: true },
      this.context
    );
  }

  /**
   * Remove the authorization request
   *
   * - If you are the request issuer, this will cancel the authorization
   * - If you are the request target, this will reject the authorization
   */
  public remove(): Promise<TransactionQueue> {
    return consumeAuthorizationRequests.prepare(
      { authRequests: [this], accept: false },
      this.context
    );
  }
}
