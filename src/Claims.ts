import { filter, uniqBy } from 'lodash';

import {
  addInvestorUniquenessClaim,
  AddInvestorUniquenessClaimParams,
  Context,
  Identity,
  modifyClaims,
  ModifyClaimsParams,
} from '~/internal';
import { didsWithClaims, issuerDidsWithClaimsByTarget } from '~/middleware/queries';
import { ClaimTypeEnum, Query } from '~/middleware/types';
import {
  ClaimData,
  ClaimScope,
  ClaimType,
  Ensured,
  IdentityWithClaims,
  ResultSet,
  Scope,
  ScopedClaim,
  ScopeType,
} from '~/types';
import { ClaimOperation, ProcedureMethod } from '~/types/internal';
import {
  scopeToMiddlewareScope,
  signerToString,
  toIdentityWithClaimsArray,
} from '~/utils/conversion';
import { calculateNextKey, createProcedureMethod, getDid, removePadding } from '~/utils/internal';

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

    this.addClaims = createProcedureMethod<
      Omit<ModifyClaimsParams, 'operation'>,
      ModifyClaimsParams,
      void
    >(
      args => [
        modifyClaims,
        {
          ...args,
          operation: ClaimOperation.Add,
        } as ModifyClaimsParams,
      ],
      context
    );

    this.editClaims = createProcedureMethod<
      Omit<ModifyClaimsParams, 'operation'>,
      ModifyClaimsParams,
      void
    >(
      args => [
        modifyClaims,
        {
          ...args,
          operation: ClaimOperation.Edit,
        } as ModifyClaimsParams,
      ],
      context
    );

    this.revokeClaims = createProcedureMethod<
      Omit<ModifyClaimsParams, 'operation'>,
      ModifyClaimsParams,
      void
    >(
      args => [
        modifyClaims,
        {
          ...args,
          operation: ClaimOperation.Revoke,
        } as ModifyClaimsParams,
      ],
      context
    );

    this.addInvestorUniquenessClaim = createProcedureMethod(
      args => [addInvestorUniquenessClaim, args],
      context
    );
  }

  /**
   * Add an Investor Uniqueness Claim to the current Identity
   *
   * @param args
   */
  public addInvestorUniquenessClaim: ProcedureMethod<AddInvestorUniquenessClaimParams, void>;

  /**
   * Add claims to Identities
   *
   * @param args.claims - array of claims to be added
   */
  public addClaims: ProcedureMethod<Pick<ModifyClaimsParams, 'claims'>, void>;

  /**
   * Edit claims associated to Identities (only the expiry date can be modified)
   *
   * * @param args.claims - array of claims to be edited
   */

  public editClaims: ProcedureMethod<Pick<ModifyClaimsParams, 'claims'>, void>;

  /**
   * Revoke claims from Identities
   *
   * @param args.claims - array of claims to be revoked
   */
  public revokeClaims: ProcedureMethod<Pick<ModifyClaimsParams, 'claims'>, void>;

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
    } = {}
  ): Promise<ResultSet<ClaimData>> {
    const { context } = this;
    const { target, includeExpired = true, size, start } = opts;

    const did = await getDid(target, context);

    const result = await context.getIdentityClaimsFromMiddleware({
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
    } = {}
  ): Promise<ResultSet<IdentityWithClaims>> {
    const { context } = this;

    const {
      targets,
      trustedClaimIssuers,
      scope,
      claimTypes,
      includeExpired = true,
      size,
      start,
    } = opts;

    const result = await context.queryMiddleware<Ensured<Query, 'didsWithClaims'>>(
      didsWithClaims({
        dids: targets?.map(target => signerToString(target)),
        scope: scope ? scopeToMiddlewareScope(scope) : undefined,
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
   */
  public async getClaimScopes(opts: { target?: string | Identity } = {}): Promise<ClaimScope[]> {
    const { context } = this;
    const { target } = opts;

    const did = await getDid(target, context);

    const identityClaimsFromChain = await context.getIdentityClaimsFromChain({
      targets: [did],
      claimTypes: [
        ClaimType.Accredited,
        ClaimType.Affiliate,
        ClaimType.Blocked,
        ClaimType.BuyLockup,
        ClaimType.Exempted,
        ClaimType.InvestorUniqueness,
        ClaimType.Jurisdiction,
        ClaimType.KnowYourCustomer,
        ClaimType.SellLockup,
      ],
      trustedClaimIssuers: undefined,
      includeExpired: true,
    });

    return identityClaimsFromChain.map(({ claim }) => {
      const {
        scope: { type, value },
      } = claim as ScopedClaim;

      let ticker: string | undefined;

      if (type === ScopeType.Ticker) {
        ticker = removePadding(value);
      }

      return {
        scope: { type, value: ticker ?? value },
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
    } = {}
  ): Promise<ResultSet<ClaimData>> {
    const { context } = this;
    const { target, includeExpired = true, size, start } = opts;

    const did = await getDid(target, context);

    const result = await context.getIdentityClaimsFromMiddleware({
      targets: [did],
      claimTypes: [ClaimType.CustomerDueDiligence],
      includeExpired,
      size,
      start,
    });

    return result;
  }

  /**
   * Retrieve the list of InvestorUniqueness claims for a target Identity
   *
   * @param opts.target - identity for which to fetch CDD claims (optional, defaults to the current Identity)
   * @param opts.includeExpired - whether to include expired claims. Defaults to true
   */
  public async getInvestorUniquenessClaims(
    opts: {
      target?: string | Identity;
      includeExpired?: boolean;
    } = {}
  ): Promise<ClaimData[]> {
    const { context } = this;
    const { target, includeExpired = true } = opts;

    const did = await getDid(target, context);

    return context.getIdentityClaimsFromChain({
      targets: [did],
      claimTypes: [ClaimType.InvestorUniqueness],
      includeExpired,
    });
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
    } = {}
  ): Promise<ResultSet<IdentityWithClaims>> {
    const { context } = this;

    const { target, trustedClaimIssuers, scope, includeExpired = true, size, start } = opts;

    const did = await getDid(target, context);

    const isMiddlewareAvailable = await context.isMiddlewareAvailable();

    if (isMiddlewareAvailable) {
      const result = await context.queryMiddleware<Ensured<Query, 'issuerDidsWithClaimsByTarget'>>(
        issuerDidsWithClaimsByTarget({
          target: did,
          scope: scope ? scopeToMiddlewareScope(scope) : undefined,
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

    const identityClaimsFromChain = await context.getIdentityClaimsFromChain({
      targets: [did],
      claimTypes: [
        ClaimType.Accredited,
        ClaimType.Affiliate,
        ClaimType.Blocked,
        ClaimType.BuyLockup,
        ClaimType.Exempted,
        ClaimType.InvestorUniqueness,
        ClaimType.Jurisdiction,
        ClaimType.KnowYourCustomer,
        ClaimType.SellLockup,
        ClaimType.CustomerDueDiligence,
        ClaimType.NoData,
      ],
      trustedClaimIssuers: trustedClaimIssuers?.map(trustedClaimIssuer =>
        signerToString(trustedClaimIssuer)
      ),
      includeExpired,
    });

    const uniqIssuers = uniqBy(
      identityClaimsFromChain.map(i => i.issuer),
      identity => identity.did
    );

    const identityWithClaims: IdentityWithClaims[] = [];
    uniqIssuers.map(identity => {
      identityWithClaims.push({
        identity,
        claims: filter(
          identityClaimsFromChain,
          identityClaim => identityClaim.issuer.did === identity.did
        ),
      });
    });

    return {
      data: identityWithClaims,
      next: null,
      count: undefined,
    };
  }
}
