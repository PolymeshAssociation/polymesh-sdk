import { createPortfolioTransformer } from '~/api/entities/Venue';
import {
  allowIdentityToCreatePortfolios,
  attestPrimaryKeyRotation,
  AuthorizationRequest,
  ChildIdentity,
  Context,
  createChildIdentities,
  createChildIdentity,
  createPortfolios,
  Identity,
  NumberedPortfolio,
  registerIdentity,
  revokeIdentityToCreatePortfolios,
  rotatePrimaryKey,
  rotatePrimaryKeyToSecondary,
} from '~/internal';
import {
  AllowIdentityToCreatePortfoliosParams,
  AttestPrimaryKeyRotationParams,
  CreateChildIdentitiesParams,
  CreateChildIdentityParams,
  ProcedureMethod,
  RegisterIdentityParams,
  RevokeIdentityToCreatePortfoliosParams,
  RotatePrimaryKeyParams,
  RotatePrimaryKeyToSecondaryParams,
} from '~/types';
import { identityIdToString } from '~/utils/conversion';
import { asIdentity, assertIdentityExists, createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Identity related functionality
 */
export class Identities {
  private readonly context: Context;

  /**
   * @hidden
   */
  constructor(context: Context) {
    this.context = context;

    this.registerIdentity = createProcedureMethod(
      { getProcedureAndArgs: args => [registerIdentity, args] },
      context
    );

    this.attestPrimaryKeyRotation = createProcedureMethod(
      { getProcedureAndArgs: args => [attestPrimaryKeyRotation, args] },
      context
    );

    this.rotatePrimaryKey = createProcedureMethod(
      { getProcedureAndArgs: args => [rotatePrimaryKey, args] },
      context
    );

    this.rotatePrimaryKeyToSecondary = createProcedureMethod(
      { getProcedureAndArgs: args => [rotatePrimaryKeyToSecondary, args] },
      context
    );

    this.createPortfolio = createProcedureMethod(
      {
        getProcedureAndArgs: args => [
          createPortfolios,
          {
            portfolios: [{ name: args.name, ownerDid: args.ownerDid }],
          },
        ],
        transformer: createPortfolioTransformer,
      },
      context
    );

    this.createPortfolios = createProcedureMethod(
      {
        getProcedureAndArgs: args => [
          createPortfolios,
          { portfolios: args.names.map(name => ({ name, ownerDid: args.ownerDid })) },
        ],
      },
      context
    );

    this.createChild = createProcedureMethod(
      {
        getProcedureAndArgs: args => [createChildIdentity, args],
      },
      context
    );

    this.createChildren = createProcedureMethod(
      {
        getProcedureAndArgs: args => [createChildIdentities, args],
      },
      context
    );

    this.allowIdentityToCreatePortfolios = createProcedureMethod(
      { getProcedureAndArgs: args => [allowIdentityToCreatePortfolios, args] },
      context
    );

    this.revokeIdentityToCreatePortfolios = createProcedureMethod(
      { getProcedureAndArgs: args => [revokeIdentityToCreatePortfolios, args] },
      context
    );
  }

  /**
   * Register an Identity, possibly with a CDD claim
   *
   * @note the transaction signer must be a CDD provider
   * @note this may create {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Requests} which have to be accepted by the `targetAccount`.
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
   *
   * @note required role:
   *   - Customer Due Diligence Provider
   */
  public registerIdentity: ProcedureMethod<RegisterIdentityParams, Identity>;

  /**
   * Get CDD Provider's attestation to change primary key
   *
   * @note the transaction signer must be a CDD provider
   * @note this creates an {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Requests} which have to be accepted by the `targetAccount` along with the authorization for `RotatingPrimaryKey`.
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
   *
   * @note required role:
   *   - Customer Due Diligence Provider
   */
  public attestPrimaryKeyRotation: ProcedureMethod<
    AttestPrimaryKeyRotationParams,
    AuthorizationRequest
  >;

  /**
   * Creates an Authorization to rotate primary key of the signing Identity by the `targetAccount`
   *
   * @note this creates an {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Requests} which have to be accepted by the `targetAccount` along with the optional CDD authorization generated by CDD provider attesting the rotation of primary key
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
   */
  public rotatePrimaryKey: ProcedureMethod<RotatePrimaryKeyParams, AuthorizationRequest>;

  /**
   * Creates an Authorization to rotate primary key of the signing Identity to an existing secondary key identified by the `targetAccount`
   *
   * @note the given `targetAccount` must be an existing secondaryKey or unlinked to any other Identity
   * @note this creates an {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Requests} which have to be accepted by the `targetAccount` along with the optional CDD authorization generated by CDD provider attesting the rotation of primary key
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
   * @throws if the given `targetAccount` is linked with another Identity
   * @throws if the given `targetAccount` is already the primary key of the signing Identity
   * @throws if the given `targetAccount` already has a pending invitation to become the primary key of the signing Identity
   */
  public rotatePrimaryKeyToSecondary: ProcedureMethod<
    RotatePrimaryKeyToSecondaryParams,
    AuthorizationRequest
  >;

  /**
   * Create a new Portfolio under the ownership of the signing Identity
   * @note the `ownerDid` is optional. If provided portfolios will be created as Custody Portfolios under the `ownerDid`
   */
  public createPortfolio: ProcedureMethod<
    { name: string; ownerDid?: string },
    NumberedPortfolio[],
    NumberedPortfolio
  >;

  /**
   * Creates a set of new Portfolios under the ownership of the signing Identity
   * @note the `ownerDid` is optional. If provided portfolios will be created as Custody Portfolios under the `ownerDid`
   */
  public createPortfolios: ProcedureMethod<
    { names: string[]; ownerDid?: string },
    NumberedPortfolio[]
  >;

  /**
   * Create an Identity instance from a DID
   *
   * @throws if there is no Identity with the passed DID
   */
  public getIdentity(args: { did: string }): Promise<Identity> {
    return this.context.getIdentity(args.did);
  }

  /**
   * Create a ChildIdentity instance from a DID
   *
   * @throws if there is no ChildIdentity with the passed DID
   */
  public getChildIdentity(args: { did: string }): Promise<ChildIdentity> {
    return this.context.getChildIdentity(args.did);
  }

  /**
   * Return whether the supplied Identity/DID exists
   */
  public isIdentityValid(args: { identity: Identity | string }): Promise<boolean> {
    return asIdentity(args.identity, this.context).exists();
  }

  /**
   * Creates a child identity and makes the `secondaryKey` as the primary key of the child identity
   *
   * @note the given `secondaryKey` is removed as secondary key from the signing Identity
   *
   * @throws if
   *  - the transaction signer is not the primary account of which the `secondaryKey` is a secondary key
   *  - the `secondaryKey` can't be unlinked (can happen when it's part of a multisig with some balance)
   *  - the signing account is not a primary key
   *  - the signing Identity is already a child of some other identity
   */
  public createChild: ProcedureMethod<CreateChildIdentityParams, ChildIdentity>;

  /**
   * Create child identities using off chain authorization
   *
   * @note the list of `key` provided in the params should not be linked to any other account
   *
   * @throws if
   *  - the signing account is not a primary key
   *  - the signing Identity is already a child of some other identity
   *  - `expiresAt` is not a future date
   *  - the any `key` in `childKeyAuths` is already linked to an Identity
   */
  public createChildren: ProcedureMethod<CreateChildIdentitiesParams, ChildIdentity[]>;

  /**
   * Gives permission to the Identity to create Portfolios on behalf of the signing Identity
   *
   * @throws if
   *  - the provided Identity already has permissions to create portfolios for signing Identity
   *  - the provided Identity does not exist
   */
  public allowIdentityToCreatePortfolios: ProcedureMethod<
    AllowIdentityToCreatePortfoliosParams,
    void
  >;

  /**
   * Revokes permission from the Identity to create Portfolios on behalf of the signing Identity
   *
   * @throws if
   *  - the provided Identity already does not have permissions to create portfolios for signing Identity
   *  - the provided Identity does not exist
   */
  public revokeIdentityToCreatePortfolios: ProcedureMethod<
    RevokeIdentityToCreatePortfoliosParams,
    void
  >;

  /**
   * Returns a list of allowed custodian did(s) for Identity
   * @throws if
   * - the provided Identity does not exist
   */
  public async getAllowedCustodians(did: string | Identity): Promise<string[]> {
    const {
      context: {
        polymeshApi: { query },
      },
    } = this;

    const identity = asIdentity(did, this.context);

    await assertIdentityExists(identity);

    const custodians = await query.portfolio.allowedCustodians.entries(did.toString());

    return custodians.map(([storageKey]) => {
      const {
        args: [, custodianIdentityId],
      } = storageKey;

      return identityIdToString(custodianIdentityId);
    });
  }
}
