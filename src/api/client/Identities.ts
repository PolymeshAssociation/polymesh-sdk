import { createPortfolioTransformer } from '~/api/entities/Venue';
import {
  Context,
  createPortfolios,
  Identity,
  NumberedPortfolio,
  registerIdentity,
  registerIdentityWithCdd,
} from '~/internal';
import { ProcedureMethod, RegisterIdentityParams, RegisterIdentityWithCddParams } from '~/types';
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

    this.registerIdentityWithCdd = createProcedureMethod(
      { getProcedureAndArgs: args => [registerIdentityWithCdd, args] },
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
   * This creates an DID for an Identity, without a CDD claim the Identity will not be fully onboarded. Generally {@link api/client/Identities!registerIdentityWithCdd}
   * is preferred, unless having an on chain Identity that will later later complete the CDD process is explicitly desired.
   *
   * @note this signer must be a CDD provider
   * @note this may create {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Requests} which have to be accepted by the `targetAccount`.
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
   *
   * @note required role:
   *   - Customer Due Diligence Provider
   */
  public registerIdentity: ProcedureMethod<RegisterIdentityParams, Identity>;

  /**
   * Register an Identity and create a CDD claim for it. This allows for an Account to receive POLYX and interact with the chain.
   *
   * Functions like {@link api/client/Identities!registerIdentity | registerIdentity} followed by a CDD claim being added, except in a single transaction.
   *
   * @note this may create {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Requests} which have to be accepted by the `targetAccount`.
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
   *
   * @note required role:
   *   - Customer Due Diligence Provider
   */
  public registerIdentityWithCdd: ProcedureMethod<RegisterIdentityWithCddParams, Identity>;

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
