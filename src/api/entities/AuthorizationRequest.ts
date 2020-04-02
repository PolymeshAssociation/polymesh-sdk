import BigNumber from 'bignumber.js';

import { Entity } from '~/base';
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
   * ID of the identity to which the request was emitted
   */
  public targetDid: string;

  /**
   * ID of the identity that emitted the request
   */
  public issuerDid: string;

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
   * @hidden
   * internal identifier for the request (used to accept/reject/cancel)
   */
  private authId: BigNumber;

  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers & Params, context: Context) {
    const { targetDid, issuerDid, expiry, data, ...identifiers } = args;

    super(identifiers, context);

    const { authId } = identifiers;

    this.targetDid = targetDid;
    this.issuerDid = issuerDid;
    this.authId = authId;
    this.expiry = expiry;
    this.data = data;
  }
}
