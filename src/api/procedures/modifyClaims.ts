import { Moment } from '@polkadot/types/interfaces';
import { cloneDeep, isEqual, uniq } from 'lodash';
import { Claim as MeshClaim, IdentityId, TxTags } from 'polymesh-types/types';

import { PolymeshError, Procedure } from '~/internal';
import { didsWithClaims } from '~/middleware/queries';
import { Claim as MiddlewareClaim, Query } from '~/middleware/types';
import {
  Claim,
  ClaimTarget,
  ClaimType,
  Ensured,
  ErrorCode,
  isScopedClaim,
  RoleType,
} from '~/types';
import {
  ClaimOperation,
  Extrinsics,
  MapMaybePostTransactionValue,
  ProcedureAuthorization,
} from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  claimToMeshClaim,
  dateToMoment,
  identityIdToString,
  middlewareScopeToScope,
  signerToString,
  stringToIdentityId,
} from '~/utils/conversion';

interface AddClaimsParams {
  claims: ClaimTarget[];
  operation: ClaimOperation.Add;
}

interface EditClaimsParams {
  claims: ClaimTarget[];
  operation: ClaimOperation.Edit;
}

interface RevokeClaimsParams {
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
    allTargets.push(signerToString(target));
    modifyClaimArgs.push(
      tuple(
        stringToIdentityId(signerToString(target), context),
        claimToMeshClaim(claim, context),
        expiry ? dateToMoment(expiry, context) : null
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
      code: ErrorCode.ValidationError,
      message: 'Some of the supplied Identity IDs do not exist',
      data: {
        nonExistentDids,
      },
    });
  }

  // skip validation if the middleware is unavailable
  if (operation !== ClaimOperation.Add && middlewareAvailable) {
    const { did: currentDid } = await context.getCurrentIdentity();
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

    const nonExistentClaims: Claim[] = [];
    claims.forEach(({ target, claim }) => {
      const targetClaims = claimsByDid[signerToString(target)] ?? [];

      const claimExists = !!targetClaims.find(({ scope, type }) => {
        let isSameScope = true;

        if (isScopedClaim(claim)) {
          isSameScope = scope ? isEqual(middlewareScopeToScope(scope), claim.scope) : false;
        }

        return isSameScope && ClaimType[type] === claim.type;
      });

      if (!claimExists) {
        nonExistentClaims.push(claim);
      }
    });

    if (nonExistentClaims.length) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: `Attempt to ${
          operation === ClaimOperation.Edit ? 'edit' : 'revoke'
        } claims that weren't issued by the current Identity`,
        data: {
          nonExistentClaims,
        },
      });
    }
  }

  if (operation === ClaimOperation.Revoke) {
    this.addBatchTransaction(
      identity.revokeClaim,
      { groupByFn: groupByDid },
      modifyClaimArgs.map(([identityId, claim]) => tuple(identityId, claim))
    );
  } else {
    if (operation === ClaimOperation.Add) {
      const existingCddId: string[] = [];

      const claimTargets = claims.filter(
        ({ claim: { type } }) => type === ClaimType.CustomerDueDiligence
      );
      const issuedCddClaims = await context.issuedClaims({
        targets: claimTargets.map(({ target }) => target),
        claimTypes: [ClaimType.CustomerDueDiligence],
        includeExpired: false,
      });

      claimTargets.map(({ target, claim }) => {
        const did = signerToString(target);
        const filterCdds = issuedCddClaims.data.filter(
          ({ target: issuedTarget }) => issuedTarget.did === did
        );

        // we know the claim is a CDD claim, so it must have an id property
        const { id } = filterCdds[0].claim as { id: string };
        const { id: cddId } = claim as { id: string };

        if (id !== cddId) {
          existingCddId.push(id);
        }
      });

      if (existingCddId.length) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'This Identity already has CDD claims with a different ID',
          data: {
            existingCddId: uniq(existingCddId),
          },
        });
      }
    }

    this.addBatchTransaction(identity.addClaim, { groupByFn: groupByDid }, modifyClaimArgs);
  }
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
    tokens: [],
    portfolios: [],
  };
  if (claims.some(({ claim: { type } }) => type === ClaimType.CustomerDueDiligence)) {
    return {
      identityRoles: [{ type: RoleType.CddProvider }],
      signerPermissions: permissions,
    };
  }
  return {
    signerPermissions: permissions,
  };
}

/**
 * @hidden
 */
export const modifyClaims = new Procedure(prepareModifyClaims, getAuthorization);
