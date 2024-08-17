import { Vec } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { filter, flatten, isEqual, uniqBy, uniqWith } from 'lodash';

import {
  Context,
  Identity,
  modifyClaims,
  PolymeshError,
  registerCustomClaimType,
} from '~/internal';
import {
  claimsGroupingQuery,
  claimsQuery,
  customClaimTypeQuery,
} from '~/middleware/queries/claims';
import { ClaimsGroupBy, ClaimsOrderBy, ClaimTypeEnum, Query } from '~/middleware/types';
import { IdentityClaim } from '~/polkadot/polymesh';
import {
  CddClaim,
  ClaimData,
  ClaimOperation,
  ClaimScope,
  ClaimType,
  CustomClaimType,
  CustomClaimTypeWithDid,
  ErrorCode,
  IdentityWithClaims,
  ModifyClaimsParams,
  ProcedureMethod,
  RegisterCustomClaimTypeParams,
  ResultSet,
  Scope,
  ScopedClaim,
  ScopeType,
} from '~/types';
import { Ensured } from '~/types/utils';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';
import {
  bigNumberToU32,
  bytesToString,
  identityIdToString,
  meshClaimToClaim,
  momentToDate,
  scopeToMiddlewareScope,
  signerToString,
  stringToIdentityId,
  toCustomClaimTypeWithIdentity,
  toIdentityWithClaimsArray,
  u32ToBigNumber,
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
      {
        getProcedureAndArgs: args => [
          modifyClaims,
          {
            ...args,
            operation: ClaimOperation.Add,
          } as ModifyClaimsParams,
        ],
      },
      context
    );

    this.editClaims = createProcedureMethod<
      Omit<ModifyClaimsParams, 'operation'>,
      ModifyClaimsParams,
      void
    >(
      {
        getProcedureAndArgs: args => [
          modifyClaims,
          {
            ...args,
            operation: ClaimOperation.Edit,
          } as ModifyClaimsParams,
        ],
      },
      context
    );

    this.revokeClaims = createProcedureMethod<
      Omit<ModifyClaimsParams, 'operation'>,
      ModifyClaimsParams,
      void
    >(
      {
        getProcedureAndArgs: args => [
          modifyClaims,
          {
            ...args,
            operation: ClaimOperation.Revoke,
          } as ModifyClaimsParams,
        ],
      },
      context
    );

    this.registerCustomClaimType = createProcedureMethod(
      { getProcedureAndArgs: args => [registerCustomClaimType, args] },
      context
    );
  }

  /**
   * Add claims to Identities
   *
   * @note required roles:
   *   - Customer Due Diligence Provider: if there is at least one CDD claim in the arguments
   */
  public addClaims: ProcedureMethod<Pick<ModifyClaimsParams, 'claims'>, void>;

  /**
   * Edit claims associated to Identities (only the expiry date can be modified)
   *
   * @note required roles:
   *   - Customer Due Diligence Provider: if there is at least one CDD claim in the arguments
   */

  public editClaims: ProcedureMethod<Pick<ModifyClaimsParams, 'claims'>, void>;

  /**
   * Revoke claims from Identities
   *
   * @note required roles:
   *   - Customer Due Diligence Provider: if there is at least one CDD claim in the arguments
   */
  public revokeClaims: ProcedureMethod<Pick<ModifyClaimsParams, 'claims'>, void>;

  /**
   * Retrieve all claims issued by an Identity
   *
   * @param opts.target - Identity (optional, defaults to the signing Identity)
   * @param opts.includeExpired - whether to include expired claims. Defaults to true
   *
   * @note supports pagination
   * @note uses the middlewareV2
   */
  public async getIssuedClaims(
    opts: {
      target?: string | Identity;
      includeExpired?: boolean;
      size?: BigNumber;
      start?: BigNumber;
    } = {}
  ): Promise<ResultSet<ClaimData>> {
    const { context } = this;
    const { target, includeExpired = true, size, start } = opts;

    const did = await getDid(target, context);

    return context.getIdentityClaimsFromMiddleware({
      trustedClaimIssuers: [did],
      includeExpired,
      size,
      start,
    });
  }

  /**
   * Retrieve a list of Identities with claims associated to them. Can be filtered using parameters
   *
   * @param opts.targets - Identities (or Identity IDs) for which to fetch targeting claims. Defaults to all targets
   * @param opts.trustedClaimIssuers - Identity IDs of claim issuers. Defaults to all claim issuers
   * @param opts.scope - scope of the claims to fetch. Defaults to any scope
   * @param opts.claimTypes - types of the claims to fetch. Defaults to any type
   * @param opts.includeExpired - whether to include expired claims. Defaults to true
   * @param opts.size - page size
   * @param opts.start - page offset
   *
   * @note supports pagination
   * @note uses the middleware V2
   */
  public async getIdentitiesWithClaims(
    opts: {
      targets?: (string | Identity)[];
      trustedClaimIssuers?: (string | Identity)[];
      scope?: Scope;
      claimTypes?: ClaimType[];
      includeExpired?: boolean;
      size?: BigNumber;
      start?: BigNumber;
    } = {}
  ): Promise<ResultSet<IdentityWithClaims>> {
    const { context } = this;

    const {
      targets,
      trustedClaimIssuers,
      scope,
      claimTypes,
      includeExpired = true,
      size = new BigNumber(DEFAULT_GQL_PAGE_SIZE),
      start = new BigNumber(0),
    } = opts;

    let targetIssuers;

    const filters = {
      scope: scope ? await scopeToMiddlewareScope(scope, context) : undefined,
      trustedClaimIssuers: trustedClaimIssuers?.map(trustedClaimIssuer =>
        signerToString(trustedClaimIssuer)
      ),
      claimTypes: Array.isArray(claimTypes) ? claimTypes.map(ct => ClaimTypeEnum[ct]) : undefined,
      includeExpired,
    };

    if (!targets) {
      const {
        data: {
          claims: { groupedAggregates: groupedTargets },
        },
      } = await context.queryMiddleware<Ensured<Query, 'claims'>>(
        claimsGroupingQuery({
          ...filters,
        })
      );

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      targetIssuers = flatten(groupedTargets!.map(groupedTarget => groupedTarget.keys!));
    } else {
      targetIssuers = targets.map(target => signerToString(target));
    }

    // note: pagination count is based on the target issuers and not the claims count
    const count = new BigNumber(targetIssuers.length);

    // tooling-gql does pagination based on sorted target issuers, hence the explicit `sort()` function (as graphql doesn't sort the final data)
    targetIssuers.sort();
    targetIssuers = targetIssuers.slice(start.toNumber(), size.plus(start).toNumber());

    const {
      data: {
        claims: { nodes },
      },
    } = await context.queryMiddleware<Ensured<Query, 'claims'>>(
      claimsQuery({
        dids: targetIssuers,
        ...filters,
      })
    );

    const data = toIdentityWithClaimsArray(nodes, context, 'targetId');
    const next = calculateNextKey(count, data.length, start);

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
   * @param opts.target - Identity for which to fetch claim scopes (optional, defaults to the signing Identity)
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
        ClaimType.Jurisdiction,
        ClaimType.KnowYourCustomer,
        ClaimType.SellLockup,
      ],
      trustedClaimIssuers: undefined,
      includeExpired: true,
    });

    const claimScopeList = identityClaimsFromChain.map(({ claim }) => {
      // only Scoped Claims were fetched so this assertion is reasonable
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

    return uniqWith(claimScopeList, isEqual);
  }

  /**
   * Retrieve the list of CDD claims for a target Identity
   *
   * @param opts.target - Identity for which to fetch CDD claims (optional, defaults to the signing Identity)
   * @param opts.includeExpired - whether to include expired claims. Defaults to true
   */
  public async getCddClaims(
    opts: {
      target?: string | Identity;
      includeExpired?: boolean;
    } = {}
  ): Promise<ClaimData<CddClaim>[]> {
    const {
      context,
      context: {
        polymeshApi: { call },
      },
    } = this;

    const { identityApi: identity } = call;

    const { target, includeExpired = true } = opts;

    const did = await getDid(target, context);

    const rawDid = stringToIdentityId(did, context);

    const result: Vec<IdentityClaim> = await identity.validCddClaims(rawDid, null);

    const data: ClaimData<CddClaim>[] = [];

    result.forEach(optClaim => {
      const { claimIssuer, issuanceDate, lastUpdateDate, expiry: rawExpiry, claim } = optClaim;

      const expiry = !rawExpiry.isEmpty ? momentToDate(rawExpiry.unwrap()) : null;

      if ((!includeExpired && (expiry === null || expiry > new Date())) || includeExpired) {
        data.push({
          target: new Identity({ did }, context),
          issuer: new Identity({ did: identityIdToString(claimIssuer) }, context),
          issuedAt: momentToDate(issuanceDate),
          lastUpdatedAt: momentToDate(lastUpdateDate),
          expiry,
          claim: meshClaimToClaim(claim, context) as CddClaim,
        });
      }
    });

    return data;
  }

  /**
   * @hidden
   */
  private async getClaimsFromChain(
    context: Context,
    did: string,
    trustedClaimIssuers: (string | Identity)[] | undefined,
    includeExpired: boolean
  ): Promise<ResultSet<IdentityWithClaims>> {
    const identityClaimsFromChain = await context.getIdentityClaimsFromChain({
      targets: [did],
      trustedClaimIssuers: trustedClaimIssuers?.map(signerToString),
      includeExpired,
    });

    const issuers = uniqBy(
      identityClaimsFromChain.map(i => i.issuer),
      identity => identity.did
    );

    const identitiesWithClaims = issuers.map(identity => ({
      identity,
      claims: filter(identityClaimsFromChain, ({ issuer }) => issuer.isEqual(identity)),
    }));

    return {
      data: identitiesWithClaims,
      next: null,
      count: new BigNumber(identitiesWithClaims.length),
    };
  }

  /**
   * Retrieve all claims issued about an Identity, grouped by claim issuer
   *
   * @param opts.target - Identity for which to fetch targeting claims (optional, defaults to the signing Identity)
   * @param opts.includeExpired - whether to include expired claims. Defaults to true
   *
   * @note supports pagination
   * @note uses the middlewareV2 (optional)
   */
  public async getTargetingClaims(
    opts: {
      target?: string | Identity;
      scope?: Scope;
      trustedClaimIssuers?: (string | Identity)[];
      includeExpired?: boolean;
      size?: BigNumber;
      start?: BigNumber;
    } = {}
  ): Promise<ResultSet<IdentityWithClaims>> {
    const { context } = this;

    const {
      target,
      trustedClaimIssuers,
      scope,
      includeExpired = true,
      size = new BigNumber(DEFAULT_GQL_PAGE_SIZE),
      start = new BigNumber(0),
    } = opts;

    const did = await getDid(target, context);

    const isMiddlewareAvailable = await context.isMiddlewareAvailable();

    if (isMiddlewareAvailable) {
      const filters = {
        dids: [did],
        scope: scope ? await scopeToMiddlewareScope(scope, context) : undefined,
        includeExpired,
      };

      let claimIssuers;
      if (!trustedClaimIssuers) {
        const {
          data: {
            claims: { groupedAggregates: groupedIssuers },
          },
        } = await context.queryMiddleware<Ensured<Query, 'claims'>>(
          claimsGroupingQuery(filters, ClaimsOrderBy.IssuerIdAsc, ClaimsGroupBy.IssuerId)
        );

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        claimIssuers = flatten(groupedIssuers!.map(groupedAggregate => groupedAggregate.keys!));
      } else {
        claimIssuers = trustedClaimIssuers.map(signerToString);
      }

      // note: pagination count is based on the claim issuers and not the claims count
      const count = new BigNumber(claimIssuers.length);

      claimIssuers.sort();
      claimIssuers = claimIssuers.slice(start.toNumber(), size.plus(start).toNumber());

      const {
        data: {
          claims: { nodes },
        },
      } = await context.queryMiddleware<Ensured<Query, 'claims'>>(
        claimsQuery({
          trustedClaimIssuers: claimIssuers,
          ...filters,
        })
      );

      const data = toIdentityWithClaimsArray(nodes, context, 'issuerId');
      const next = calculateNextKey(count, data.length, start);

      return {
        data,
        next,
        count,
      };
    }

    return this.getClaimsFromChain(context, did, trustedClaimIssuers, includeExpired);
  }

  /**
   * Creates a custom claim type using the `name` and returns the `id` of the created claim type
   *
   * @throws if
   *  - the `name` is longer than allowed
   *  - a custom claim type with the same `name` already exists
   */
  public registerCustomClaimType: ProcedureMethod<RegisterCustomClaimTypeParams, BigNumber>;

  /**
   * Retrieves a custom claim type based on its name
   *
   * @param name - The name of the custom claim type to retrieve
   */
  public async getCustomClaimTypeByName(name: string): Promise<CustomClaimType | null> {
    const {
      context: {
        polymeshApi: {
          query: { identity },
        },
      },
    } = this;

    const customClaimTypeIdOpt = await identity.customClaimsInverse(name);

    if (customClaimTypeIdOpt.isEmpty) {
      return null;
    }

    return { id: u32ToBigNumber(customClaimTypeIdOpt.value), name };
  }

  /**
   * Retrieves a custom claim type based on its ID
   *
   * @param id - The ID of the custom claim type to retrieve
   */
  public async getCustomClaimTypeById(id: BigNumber): Promise<CustomClaimType | null> {
    const { context } = this;
    const {
      polymeshApi: {
        query: { identity },
      },
    } = context;

    const customClaimTypeIdOpt = await identity.customClaims(bigNumberToU32(id, context));

    if (customClaimTypeIdOpt.isEmpty) {
      return null;
    }

    return { id, name: bytesToString(customClaimTypeIdOpt.value) };
  }

  /**
   * Retrieve registered CustomClaimTypes
   *
   * @param opts.dids - Fetch CustomClaimTypes issued by the given `dids`
   *
   * @note supports pagination
   * @note uses the middlewareV2 (Required)
   */
  public async getAllCustomClaimTypes(
    opts: {
      size?: BigNumber;
      start?: BigNumber;
      dids?: string[];
    } = {}
  ): Promise<ResultSet<CustomClaimTypeWithDid>> {
    const { context } = this;

    const isMiddlewareAvailable = await context.isMiddlewareAvailable();

    if (!isMiddlewareAvailable) {
      throw new PolymeshError({
        code: ErrorCode.MiddlewareError,
        message: 'Cannot perform this action without an active middleware V2 connection',
      });
    }

    const { size = new BigNumber(DEFAULT_GQL_PAGE_SIZE), start = new BigNumber(0), dids } = opts;

    const {
      data: {
        customClaimTypes: { nodes, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'customClaimTypes'>>(
      customClaimTypeQuery(size, start, dids)
    );

    const count = new BigNumber(totalCount);
    const next = calculateNextKey(new BigNumber(totalCount), nodes.length, start);

    return {
      data: toCustomClaimTypeWithIdentity(nodes),
      next,
      count,
    };
  }
}
