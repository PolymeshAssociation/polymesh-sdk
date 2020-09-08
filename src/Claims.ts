import { Identity } from '~/api/entities';
import { modifyClaims, ModifyClaimsParams } from '~/api/procedures';
import { TransactionQueue } from '~/base';
import { Context } from '~/context';
import {
  didsWithClaims,
  issuerDidsWithClaimsByTarget,
  scopesByIdentity,
} from '~/middleware/queries';
import { ClaimTypeEnum, Query } from '~/middleware/types';
import { ClaimData, ClaimScope, ClaimType, Ensured, IdentityWithClaims, ResultSet } from '~/types';
import { ClaimOperation } from '~/types/internal';
import {
  calculateNextKey,
  createClaim,
  removePadding,
  toIdentityWithClaimsArray,
  valueToDid,
} from '~/utils';

/**
 * Handles all Claims related functionality
 */
export class Claims {
  private context: Context;

  /**
   * @hidden
   */
  constructor(context: Context) {
    this.context = context;
  }

  /**
   * Add claims to identities
   *
   * @param args.claims - array of claims to be added
   */
  public addClaims(args: Omit<ModifyClaimsParams, 'operation'>): Promise<TransactionQueue<void>> {
    return modifyClaims.prepare({ ...args, operation: ClaimOperation.Add }, this.context);
  }

  /**
   * Edit claims associated to identities (only the expiry date can be modified)
   *
   * * @param args.claims - array of claims to be edited
   */
  public editClaims(args: Omit<ModifyClaimsParams, 'operation'>): Promise<TransactionQueue<void>> {
    return modifyClaims.prepare({ ...args, operation: ClaimOperation.Edit }, this.context);
  }

  /**
   * Revoke claims from identities
   *
   * @param args.claims - array of claims to be revoked
   */
  public revokeClaims(
    args: Omit<ModifyClaimsParams, 'operation'>
  ): Promise<TransactionQueue<void>> {
    return modifyClaims.prepare({ ...args, operation: ClaimOperation.Revoke }, this.context);
  }

  /**
   * Retrieve all claims issued by an Identity
   *
   * @param opts.target - identity (optional, defaults to the current identity)
   *
   * @note uses the middleware
   */
  public async getIssuedClaims(
    opts: {
      target?: string | Identity;
      size?: number;
      start?: number;
    } = {}
  ): Promise<ResultSet<ClaimData>> {
    const { context } = this;

    const { target, size, start } = opts;

    let did;
    if (target) {
      did = valueToDid(target);
    } else {
      const { did: identityId } = await context.getCurrentIdentity();
      did = identityId;
    }

    const result = await context.issuedClaims({
      trustedClaimIssuers: [did],
      size,
      start,
    });

    return result;
  }

  /**
   * Retrieve a list of identities with claims associated to them. Can be filtered using parameters
   *
   * @param opts.targets - identities (or identity IDs) for which to fetch claims (targets). Defaults to all targets
   * @param opts.trustedClaimIssuers - identity IDs of claim issuers. Defaults to all claim issuers
   * @param opts.scope - scope of the claims to fetch. Defaults to any scope
   * @param opts.claimTypes - types of the claims to fetch. Defaults to any type
   * @param opts.size - page size
   * @param opts.start - page offset
   *
   * @note uses the middleware
   */
  public async getIdentitiesWithClaims(
    opts: {
      targets?: (string | Identity)[];
      trustedClaimIssuers?: (string | Identity)[];
      scope?: string;
      claimTypes?: ClaimType[];
      size?: number;
      start?: number;
    } = {}
  ): Promise<ResultSet<IdentityWithClaims>> {
    const { context } = this;

    const { targets, trustedClaimIssuers, scope, claimTypes, size, start } = opts;

    const result = await context.queryMiddleware<Ensured<Query, 'didsWithClaims'>>(
      didsWithClaims({
        dids: targets?.map(target => valueToDid(target)),
        scope,
        trustedClaimIssuers: trustedClaimIssuers?.map(trustedClaimIssuer =>
          valueToDid(trustedClaimIssuer)
        ),
        claimTypes: claimTypes?.map(ct => ClaimTypeEnum[ct]),
        count: size,
        skip: start,
      })
    );

    const {
      data: {
        didsWithClaims: { items: didsWithClaimsList, totalCount: count },
      },
    } = result;

    const data = didsWithClaimsList.map(({ did, claims }) => ({
      identity: new Identity({ did }, context),
      claims: claims.map(
        ({
          targetDID,
          issuer,
          issuance_date: issuanceDate,
          expiry,
          type,
          jurisdiction,
          scope: claimScope,
        }) => ({
          target: new Identity({ did: targetDID }, context),
          issuer: new Identity({ did: issuer }, context),
          issuedAt: new Date(issuanceDate),
          expiry: expiry ? new Date(expiry) : null,
          claim: createClaim(type, jurisdiction, claimScope),
        })
      ),
    }));

    const next = calculateNextKey(count, size, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Retrieve all scopes in which claims have been made for the target identity.
   *   If the scope is an asset DID, the corresponding ticker is returned as well
   *
   * @param opts.target - identity for which to fetch claim scopes (optional, defaults to the current identity)
   *
   * @note a null scope means the identity has scopeless claims (like CDD for example)
   * @note uses the middleware
   */
  public async getClaimScopes(opts: { target?: string | Identity } = {}): Promise<ClaimScope[]> {
    const { context } = this;
    const { target } = opts;

    let did;
    if (target) {
      did = valueToDid(target);
    } else {
      const { did: identityId } = await context.getCurrentIdentity();
      did = identityId;
    }

    const {
      data: { scopesByIdentity: scopes },
    } = await context.queryMiddleware<Ensured<Query, 'scopesByIdentity'>>(
      scopesByIdentity({ did })
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return scopes.map(({ scope, ticker: symbol }) => {
      let ticker: string | undefined;

      if (symbol) {
        ticker = removePadding(symbol);
      }

      return {
        scope: scope ?? null,
        ticker,
      };
    });
  }

  /**
   * Retrieve the list of CDD claims for a target Identity
   *
   * @param opts.target - identity for which to fetch CDD claims (optional, defaults to the current identity)
   * @param opts.size - page size
   * @param opts.start - page offset
   *
   * @note supports pagination
   * @note uses the middleware
   */
  public async getCddClaims(
    opts: {
      target?: string | Identity;
      size?: number;
      start?: number;
    } = {}
  ): Promise<ResultSet<ClaimData>> {
    const { context } = this;
    const { target, size, start } = opts;

    let did;
    if (target) {
      did = valueToDid(target);
    } else {
      ({ did } = await context.getCurrentIdentity());
    }

    const result = await context.issuedClaims({
      targets: [did],
      claimTypes: [ClaimType.CustomerDueDiligence],
      size,
      start,
    });

    return result;
  }

  /**
   * Retrieve all claims issued about an identity, grouped by claim issuer
   *
   * @param opts.target - identity for which to fetch targeting claims (optional, defaults to the current identity)
   * @param opts.includeExpired - whether to include expired claims. Defaults to true
   *
   * @note supports pagination
   */
  public async getTargetingClaims(
    opts: {
      target?: string | Identity;
      scope?: string;
      trustedClaimIssuers?: (string | Identity)[];
      includeExpired?: boolean;
      size?: number;
      start?: number;
    } = { includeExpired: true }
  ): Promise<ResultSet<IdentityWithClaims>> {
    const { context } = this;

    const { target, trustedClaimIssuers, scope, includeExpired, size, start } = opts;

    let did;
    if (target) {
      did = valueToDid(target);
    } else {
      const { did: identityId } = await context.getCurrentIdentity();
      did = identityId;
    }

    const result = await context.queryMiddleware<Ensured<Query, 'issuerDidsWithClaimsByTarget'>>(
      issuerDidsWithClaimsByTarget({
        target: did,
        scope,
        trustedClaimIssuers: trustedClaimIssuers?.map(trustedClaimIssuer =>
          valueToDid(trustedClaimIssuer)
        ),
        includeExpired,
        count: size,
        skip: start,
      })
    );

    const {
      data: {
        issuerDidsWithClaimsByTarget: {
          items: issuerDidsWithClaimsByTargetList,
          totalCount: count,
        },
      },
    } = result;

    const data = toIdentityWithClaimsArray(issuerDidsWithClaimsByTargetList, context);

    const next = calculateNextKey(count, size, start);

    return {
      data,
      next,
      count,
    };
  }
}
