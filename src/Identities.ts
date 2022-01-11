import { Context, Identity, registerIdentity, RegisterIdentityParams } from '~/internal';
import { ProcedureMethod } from '~/types';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Identity related functionality
 */
export class Identities {
  private context: Context;

  /**
   * @hidden
   */
  constructor(context: Context) {
    this.context = context;

    this.registerIdentity = createProcedureMethod(
      { getProcedureAndArgs: args => [registerIdentity, args] },
      context
    );
  }

  /**
   * Register an Identity
   *
   * @note must be a CDD provider
   * @note this may create [[AuthorizationRequest | Authorization Requests]] which have to be accepted by
   *   the corresponding [[Account | Accounts]] and/or [[Identity | Identities]]. An Account or Identity can
   *   fetch its pending Authorization Requests by calling `authorizations.getReceived`
   *
   * @note required role:
   *   - Customer Due Diligence Provider
   */
  public registerIdentity: ProcedureMethod<RegisterIdentityParams, Identity>;

  /**
   * Create an Identity instance from a DID
   *
   * @throws if there is no Identity with the passed DID
   */
  public async getIdentity(args: { did: string }): Promise<Identity> {
    return this.context.getIdentity(args.did);
  }

  /**
   * Return whether the supplied Identity/DID exists
   */
  public async isIdentityValid(args: { identity: Identity | string }): Promise<boolean> {
    const { identity: did } = args;
    const identity = did instanceof Identity ? did : new Identity({ did }, this.context);

    return identity.exists();
  }
}
