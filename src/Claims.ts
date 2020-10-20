import { Identity } from '~/api/entities';
import { modifyClaims, ModifyClaimsParams } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import {
  didsWithClaims,
  issuerDidsWithClaimsByTarget,
  scopesByIdentity,
} from '~/middleware/queries';
import { ClaimScopeTypeEnum, ClaimTypeEnum, Query } from '~/middleware/types';
import {
  ClaimData,
  ClaimScope,
  ClaimType,
  Ensured,
  IdentityWithClaims,
  ResultSet,
  Scope,
} from '~/types';
import { ClaimOperation } from '~/types/internal';
import {
  calculateNextKey,
  getDid,
  middlewareScopeToScope,
  removePadding,
  signerToString,
  toIdentityWithClaimsArray,
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
   * Add claims to Identities
   *
   * @param args.claims - array of claims to be added
   */
  public addClaims(args: Omit<ModifyClaimsParams, 'operation'>): Promise<TransactionQueue<void>> {
    return modifyClaims.prepare({ ...args, operation: ClaimOperation.Add }, this.context);
  }

  /**
   * Edit claims associated to Identities (only the expiry date can be modified)
   *
   * * @param args.claims - array of claims to be edited
   */
  public editClaims(args: Omit<ModifyClaimsParams, 'operation'>): Promise<TransactionQueue<void>> {
    return modifyClaims.prepare({ ...args, operation: ClaimOperation.Edit }, this.context);
  }

  /**
   * Revoke claims from Identities
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
   * @param opts.target - identity (optional, defaults to the current Identity)
   * @param opts.includeExpired - whether to include expired claims. Defaults to true
   *
   * @note supports pagination
   * @note uses the middleware
   */
  public async getIssuedClaims(
    opts: {
      target?: string | Identity;
      includeExpired?: boolean;
      size?: number;
      start?: number;
    } = { includeExpired: true }
  ): Promise<ResultSet<ClaimData>> {
    const { context } = this;
    const { target, includeExpired, size, start } = opts;

    const did = await getDid(target, context);

    const result = await context.issuedClaims({
      trustedClaimIssuers: [did],
      includeExpired,
      size,
      start,
    });

    return result;
  }

  /**
   * Retrieve a list of Identities with claims associated to them. Can be filtered using parameters
   *
   * @param opts.targets - identities (or Identity IDs) for which to fetch claims (targets). Defaults to all targets
   * @param opts.trustedClaimIssuers - identity IDs of claim issuers. Defaults to all claim issuers
   * @param opts.scope - scope of the claims to fetch. Defaults to any scope
   * @param opts.claimTypes - types of the claims to fetch. Defaults to any type
   * @param opts.includeExpired - whether to include expired claims. Defaults to true
   * @param opts.size - page size
   * @param opts.start - page offset
   *
   * @note supports pagination
   * @note uses the middleware
   */
  public async getIdentitiesWithClaims(
    opts: {
      targets?: (string | Identity)[];
      trustedClaimIssuers?: (string | Identity)[];
      scope?: Scope;
      claimTypes?: ClaimType[];
      includeExpired?: boolean;
      size?: number;
      start?: number;
    } = { includeExpired: true }
  ): Promise<ResultSet<IdentityWithClaims>> {
    const { context } = this;

    const { targets, trustedClaimIssuers, scope, claimTypes, includeExpired, size, start } = opts;

    const result = await context.queryMiddleware<Ensured<Query, 'didsWithClaims'>>(
      didsWithClaims({
        dids: targets?.map(target => signerToString(target)),
        scope: scope ? { type: ClaimScopeTypeEnum[scope.type], value: scope.value } : undefined,
        trustedClaimIssuers: trustedClaimIssuers?.map(trustedClaimIssuer =>
          signerToString(trustedClaimIssuer)
        ),
        claimTypes: claimTypes?.map(ct => ClaimTypeEnum[ct]),
        includeExpired,
        count: size,
        skip: start,
      })
    );

    const {
      data: {
        didsWithClaims: { items: didsWithClaimsList, totalCount: count },
      },
    } = result;

    const data = toIdentityWithClaimsArray(didsWithClaimsList, context);

    const next = calculateNextKey(count, size, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Retrieve all scopes in which claims have been made for the target Identity.
   *   If the scope is an asset DID, the corresponding ticker is returned as well
   *
   * @param opts.target - identity for which to fetch claim scopes (optional, defaults to the current Identity)
   *
   * @note a null scope means the Identity has scopeless claims (like CDD for example)
   * @note uses the middleware
   */
  public async getClaimScopes(opts: { target?: string | Identity } = {}): Promise<ClaimScope[]> {
    const { context } = this;
    const { target } = opts;

    const did = await getDid(target, context);

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
        scope: scope ? middlewareScopeToScope(scope) : null,
        ticker,
      };
    });
  }

  /**
   * Retrieve the list of CDD claims for a target Identity
   *
   * @param opts.target - identity for which to fetch CDD claims (optional, defaults to the current Identity)
   * @param opts.includeExpired - whether to include expired claims. Defaults to true
   * @param opts.size - page size
   * @param opts.start - page offset
   *
   * @note supports pagination
   * @note uses the middleware
   */
  public async getCddClaims(
    opts: {
      target?: string | Identity;
      includeExpired?: boolean;
      size?: number;
      start?: number;
    } = { includeExpired: true }
  ): Promise<ResultSet<ClaimData>> {
    const { context } = this;
    const { target, includeExpired, size, start } = opts;

    const did = await getDid(target, context);

    const result = await context.issuedClaims({
      targets: [did],
      claimTypes: [ClaimType.CustomerDueDiligence],
      includeExpired,
      size,
      start,
    });

    return result;
  }

  /**
   * Retrieve all claims issued about an Identity, grouped by claim issuer
   *
   * @param opts.target - identity for which to fetch targeting claims (optional, defaults to the current Identity)
   * @param opts.includeExpired - whether to include expired claims. Defaults to true
   *
   * @note supports pagination
   * @note uses the middleware
   */
  public async getTargetingClaims(
    opts: {
      target?: string | Identity;
      scope?: Scope;
      trustedClaimIssuers?: (string | Identity)[];
      includeExpired?: boolean;
      size?: number;
      start?: number;
    } = { includeExpired: true }
  ): Promise<ResultSet<IdentityWithClaims>> {
    const { context } = this;

    const { target, trustedClaimIssuers, scope, includeExpired, size, start } = opts;

    const did = await getDid(target, context);

    const result = await context.queryMiddleware<Ensured<Query, 'issuerDidsWithClaimsByTarget'>>(
      issuerDidsWithClaimsByTarget({
        target: did,
        scope: scope ? { type: ClaimScopeTypeEnum[scope.type], value: scope.value } : undefined,
        trustedClaimIssuers: trustedClaimIssuers?.map(trustedClaimIssuer =>
          signerToString(trustedClaimIssuer)
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
