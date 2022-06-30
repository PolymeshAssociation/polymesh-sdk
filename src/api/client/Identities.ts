import {
  Context,
  createPortfolio,
  Identity,
  NumberedPortfolio,
  registerIdentity,
} from '~/internal';
import { ProcedureMethod, RegisterIdentityParams } from '~/types';
import { asIdentity, createProcedureMethod } from '~/utils/internal';

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

    this.createPortfolio = createProcedureMethod(
      { getProcedureAndArgs: args => [createPortfolio, args] },
      context
    );
  }

  /**
   * Register an Identity
   *
   * @note must be a CDD provider
   * @note this may create {@link AuthorizationRequest | Authorization Requests} which have to be accepted by the `targetAccount`.
   *   An {@link Account} or {@link Identity} can fetch its pending Authorization Requests by calling {@link Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link Authorizations.getOne | authorizations.getOne}
   *
   * @note required role:
   *   - Customer Due Diligence Provider
   */
  public registerIdentity: ProcedureMethod<RegisterIdentityParams, Identity>;

  /**
   * Create a new Portfolio under the ownership of the signing Identity
   */
  public createPortfolio: ProcedureMethod<{ name: string }, NumberedPortfolio>;

  /**
   * Create an Identity instance from a DID
   *
   * @throws if there is no Identity with the passed DID
   */
  public getIdentity(args: { did: string }): Promise<Identity> {
    return this.context.getIdentity(args.did);
  }

  /**
   * Return whether the supplied Identity/DID exists
   */
  public isIdentityValid(args: { identity: Identity | string }): Promise<boolean> {
    return asIdentity(args.identity, this.context).exists();
  }
}
