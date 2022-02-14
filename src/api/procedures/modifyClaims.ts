import { Moment } from '@polkadot/types/interfaces';
import P from 'bluebird';
import { cloneDeep, isEqual, uniq } from 'lodash';
import { Claim as MeshClaim, IdentityId, TxTags } from 'polymesh-types/types';

import { Context, Identity, PolymeshError, Procedure } from '~/internal';
import { didsWithClaims } from '~/middleware/queries';
import { Claim as MiddlewareClaim, Query } from '~/middleware/types';
import { CddClaim, Claim, ClaimTarget, ClaimType, ErrorCode, RoleType } from '~/types';
import {
  ClaimOperation,
  Extrinsics,
  MapMaybePostTransactionValue,
  ProcedureAuthorization,
} from '~/types/internal';
import { Ensured, tuple } from '~/types/utils';
import {
  balanceToBigNumber,
  claimToMeshClaim,
  dateToMoment,
  identityIdToString,
  middlewareScopeToScope,
  signerToString,
  stringToIdentityId,
  stringToScopeId,
  stringToTicker,
} from '~/utils/conversion';
import { assembleBatchTransactions } from '~/utils/internal';
import { isInvestorUniquenessClaim, isScopedClaim } from '~/utils/typeguards';

interface AddClaimsParams {
  /**
   * array of claims to be added
   */
  claims: ClaimTarget[];
  operation: ClaimOperation.Add;
}

interface EditClaimsParams {
  /**
   * array of claims to be edited
   */
  claims: ClaimTarget[];
  operation: ClaimOperation.Edit;
}

interface RevokeClaimsParams {
  /**
   * array of claims to be revoked
   */
  claims: Omit<ClaimTarget, 'expiry'>[];
  operation: ClaimOperation.Revoke;
}

export type ModifyClaimsParams = AddClaimsParams | EditClaimsParams | RevokeClaimsParams;

/**
 * @hidden
 */
export function groupByDid([target]: MapMaybePostTransactionValue<
  Parameters<Extrinsics['identity']['revokeClaim']> | Parameters<Extrinsics['identity']['addClaim']>
>): string {
  return identityIdToString(target as IdentityId);
}

const areSameClaims = (claim: Claim, { scope, type }: MiddlewareClaim): boolean => {
  let isSameScope = true;

  if (isScopedClaim(claim)) {
    isSameScope = scope ? isEqual(middlewareScopeToScope(scope), claim.scope) : false;
  }

  return isSameScope && ClaimType[type] === claim.type;
};

const findClaimsByOtherIssuers = (
  claims: ClaimTarget[],
  claimsByDid: Record<string, MiddlewareClaim[]>
): Claim[] =>
  claims.reduce<Claim[]>((prev, { target, claim }) => {
    const targetClaims = claimsByDid[signerToString(target)] ?? [];

    const claimExists = !!targetClaims.find(targetClaim => areSameClaims(claim, targetClaim));

    if (!claimExists) {
      return [...prev, claim];
    }

    return [...prev];
  }, []);

const findPositiveBalanceIuClaims = (claims: ClaimTarget[], context: Context): Promise<Claim[]> =>
  P.reduce<ClaimTarget, Claim[]>(
    claims,
    async (prev, { claim }) => {
      if (isInvestorUniquenessClaim(claim)) {
        const {
          scope: { value },
          scopeId,
        } = claim;

        const balance = await context.polymeshApi.query.asset.aggregateBalance(
          stringToTicker(value, context),
          stringToScopeId(scopeId, context)
        );

        if (!balanceToBigNumber(balance).isZero()) {
          return [...prev, claim];
        }
      }
      return [...prev];
    },
    []
  );

/**
 * @hidden
 *
 * Return all new CDD claims for Identities that have an existing CDD claim with a different ID
 */
const findInvalidCddClaims = async (
  claims: ClaimTarget[],
  context: Context
): Promise<{ target: Identity; currentCddId: string; newCddId: string }[]> => {
  const invalidCddClaims: { target: Identity; currentCddId: string; newCddId: string }[] = [];

  const newCddClaims = claims.filter(
    ({ claim: { type } }) => type === ClaimType.CustomerDueDiligence
  );

  if (newCddClaims.length) {
    const issuedCddClaims = await context.issuedClaims({
      targets: newCddClaims.map(({ target }) => target),
      claimTypes: [ClaimType.CustomerDueDiligence],
      includeExpired: false,
    });

    newCddClaims.forEach(({ target, claim }) => {
      const did = signerToString(target);
      const issuedClaimsForTarget = issuedCddClaims.data.filter(
        ({ target: issuedTarget }) => issuedTarget.did === did
      );

      if (issuedClaimsForTarget.length) {
        // we know both claims are CDD claims
        const { id: newCddId } = issuedClaimsForTarget[0].claim as CddClaim;
        const { id: currentCddId } = claim as CddClaim;

        if (newCddId !== currentCddId) {
          invalidCddClaims.push({
            target: typeof target === 'string' ? new Identity({ did: target }, context) : target,
            currentCddId,
            newCddId,
          });
        }
      }
    });
  }

  return invalidCddClaims;
};

/**
 * @hidden
 */
export async function prepareModifyClaims(
  this: Procedure<ModifyClaimsParams, void>,
  args: ModifyClaimsParams
): Promise<void> {
  const { claims, operation } = args;

  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    context,
  } = this;

  const modifyClaimArgs: [IdentityId, MeshClaim, Moment | null][] = [];
  let allTargets: string[] = [];

  claims.forEach(({ target, expiry, claim }: ClaimTarget) => {
    const rawExpiry = expiry ? dateToMoment(expiry, context) : null;

    allTargets.push(signerToString(target));
    modifyClaimArgs.push(
      tuple(
        stringToIdentityId(signerToString(target), context),
        claimToMeshClaim(claim, context),
        rawExpiry
      )
    );
  });

  allTargets = uniq(allTargets);

  const [nonExistentDids, middlewareAvailable] = await Promise.all([
    context.getInvalidDids(allTargets),
    context.isMiddlewareAvailable(),
  ]);

  if (nonExistentDids.length) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Some of the supplied Identity IDs do not exist',
      data: {
        nonExistentDids,
      },
    });
  }

  const shouldValidateWithMiddleware = operation !== ClaimOperation.Add && middlewareAvailable;

  // skip validation if the middleware is unavailable
  if (shouldValidateWithMiddleware) {
    const { did: currentDid } = await context.getSigningIdentity();
    const {
      data: {
        didsWithClaims: { items: currentClaims },
      },
    } = await context.queryMiddleware<Ensured<Query, 'didsWithClaims'>>(
      didsWithClaims({
        dids: allTargets,
        trustedClaimIssuers: [currentDid],
        includeExpired: true,
        count: allTargets.length,
      })
    );
    const claimsByDid = currentClaims.reduce<Record<string, MiddlewareClaim[]>>(
      (prev, { did, claims: didClaims }) => {
        const copy = cloneDeep(prev);
        copy[did] = didClaims;

        return copy;
      },
      {}
    );

    const claimsByOtherIssuers: Claim[] = findClaimsByOtherIssuers(claims, claimsByDid);

    if (claimsByOtherIssuers.length) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: `Attempt to ${operation.toLowerCase()} claims that weren't issued by the current signing Identity`,
        data: {
          claimsByOtherIssuers,
        },
      });
    }
  }

  if (operation === ClaimOperation.Revoke) {
    const claimsWithBalance: Claim[] = await findPositiveBalanceIuClaims(claims, context);

    if (claimsWithBalance.length) {
      throw new PolymeshError({
        code: ErrorCode.EntityInUse,
        message:
          'Attempt to revoke Investor Uniqueness claims from investors with positive balance',
        data: {
          claimsWithBalance,
        },
      });
    }

    const transactions = assembleBatchTransactions(
      tuple({
        transaction: identity.revokeClaim,
        argsArray: modifyClaimArgs.map(([identityId, claim]) => tuple(identityId, claim)),
      })
    );

    this.addBatchTransaction({ transactions });

    return;
  }

  if (operation === ClaimOperation.Add) {
    const invalidCddClaims = await findInvalidCddClaims(claims, context);

    if (invalidCddClaims.length) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'A target Identity cannot have CDD claims with different IDs',
        data: {
          invalidCddClaims,
        },
      });
    }
  }

  const txs = assembleBatchTransactions(
    tuple({
      transaction: identity.addClaim,
      argsArray: modifyClaimArgs,
    })
  );

  this.addBatchTransaction({ transactions: txs });
}

/**
 * @hidden
 */
export function getAuthorization({
  claims,
  operation,
}: ModifyClaimsParams): ProcedureAuthorization {
  const permissions = {
    transactions: [
      operation === ClaimOperation.Revoke ? TxTags.identity.RevokeClaim : TxTags.identity.AddClaim,
    ],
    assets: [],
    portfolios: [],
  };
  if (claims.some(({ claim: { type } }) => type === ClaimType.CustomerDueDiligence)) {
    return {
      roles: [{ type: RoleType.CddProvider }],
      permissions,
    };
  }
  return {
    permissions,
  };
}

/**
 * @hidden
 */
export const modifyClaims = (): Procedure<ModifyClaimsParams, void> =>
  new Procedure(prepareModifyClaims, getAuthorization);
