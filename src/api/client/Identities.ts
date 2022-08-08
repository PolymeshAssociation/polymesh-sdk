import { createPortfolioTransformer } from '~/api/entities/Venue';
import {
  Context,
  createPortfolios,
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

    this.createPortfolio = createProcedureMethod<
      { name: string },
      { names: string[] },
      NumberedPortfolio[],
      NumberedPortfolio
    >(
      {
        getProcedureAndArgs: args => [
          createPortfolios,
          {
            names: [args.name],
          },
        ],
        transformer: createPortfolioTransformer,
      },
      context
    );

    this.createPortfolios = createProcedureMethod(
      {
        getProcedureAndArgs: args => [createPortfolios, args],
      },
      context
    );
  }

  /**
   * Register an Identity
   *
   * @note must be a CDD provider
   * @note this may create {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Requests} which have to be accepted by the `targetAccount`.
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
   *
   * @note required role:
   *   - Customer Due Diligence Provider
   */
  public registerIdentity: ProcedureMethod<RegisterIdentityParams, Identity>;

  /**
   * Create a new Portfolio under the ownership of the signing Identity
   */
  public createPortfolio: ProcedureMethod<{ name: string }, NumberedPortfolio[], NumberedPortfolio>;

  /**
   * Creates a set of new Portfolios under the ownership of the signing Identity
   */
  public createPortfolios: ProcedureMethod<{ names: string[] }, NumberedPortfolio[]>;

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
