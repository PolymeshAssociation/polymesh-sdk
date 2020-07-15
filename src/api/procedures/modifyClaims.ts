import { Moment } from '@polkadot/types/interfaces';
import { cloneDeep, uniq } from 'lodash';
import { Claim as MeshClaim, IdentityId, TxTags } from 'polymesh-types/types';

import { PolymeshError, Procedure } from '~/base';
import { didsWithClaims } from '~/middleware/queries';
import { Claim as MiddlewareClaim, Query } from '~/middleware/types';
import {
  Claim,
  ClaimTargets,
  ClaimType,
  Ensured,
  ErrorCode,
  isScopedClaim,
  Role,
  RoleType,
} from '~/types';
import { ClaimOperation } from '~/types/internal';
import {
  batchArguments,
  claimToMeshClaim,
  dateToMoment,
  identityIdToString,
  stringToIdentityId,
  valueToDid,
} from '~/utils';

interface AddClaimItem {
  target: IdentityId;
  claim: MeshClaim;
  expiry: Moment | null;
}

interface AddClaimsParams {
  claims: ClaimTargets[];
  operation: ClaimOperation.Add;
}

interface EditClaimsParams {
  claims: ClaimTargets[];
  operation: ClaimOperation.Edit;
}

interface RevokeClaimsParams {
  claims: Omit<ClaimTargets, 'expiry'>[];
  operation: ClaimOperation.Revoke;
}

export type ModifyClaimsParams = AddClaimsParams | EditClaimsParams | RevokeClaimsParams;

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
      middlewareApi,
    },
    context,
  } = this;

  const modifyClaimItems: AddClaimItem[] = [];
  let allTargets: string[] = [];

  claims.forEach(({ targets, expiry, claim }: ClaimTargets) => {
    targets.forEach(target => {
      allTargets.push(valueToDid(target));
      modifyClaimItems.push({
        target: stringToIdentityId(valueToDid(target), context),
        claim: claimToMeshClaim(claim, context),
        expiry: expiry ? dateToMoment(expiry, context) : null,
      });
    });
  });

  allTargets = uniq(allTargets);

  const nonExistentDids: string[] = await context.getInvalidDids(allTargets);

  if (nonExistentDids.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Some of the supplied identity IDs do not exist',
      data: {
        nonExistentDids,
      },
    });
  }

  if (operation !== ClaimOperation.Add) {
    const {
      data: { didsWithClaims: currentClaims },
    } = await middlewareApi.query<Ensured<Query, 'didsWithClaims'>>(
      didsWithClaims({ dids: allTargets, trustedClaimIssuers: [context.getCurrentIdentity().did] })
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
    claims.forEach(({ targets, claim }) => {
      targets.forEach(target => {
        const targetClaims = claimsByDid[valueToDid(target)] ?? [];

        const claimExists = !!targetClaims.find(({ scope, type }) => {
          let isSameScope = true;

          if (isScopedClaim(claim)) {
            isSameScope = claim.scope === scope;
          }

          return isSameScope && type === claim.type;
        });

        if (!claimExists) {
          nonExistentClaims.push(claim);
        }
      });
    });

    if (nonExistentClaims.length) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: `Attempt to ${
          operation === ClaimOperation.Edit ? 'edit' : 'revoke'
        } claims that weren't issued by the current identity`,
        data: {
          nonExistentClaims,
        },
      });
    }
  }

  const transaction =
    operation === ClaimOperation.Revoke ? identity.revokeClaimsBatch : identity.addClaimsBatch;

  batchArguments(modifyClaimItems, TxTags.identity.AddClaimsBatch, ({ target }) =>
    identityIdToString(target)
  ).forEach(itemBatch => {
    this.addTransaction(transaction, { batchSize: itemBatch.length }, itemBatch);
  });
}

/**
 * @hidden
 */
export function getRequiredRoles({ claims }: ModifyClaimsParams): Role[] {
  if (claims.some(({ claim: { type } }) => type === ClaimType.CustomerDueDiligence)) {
    return [{ type: RoleType.CddProvider }];
  }
  return [];
}

export const modifyClaims = new Procedure(prepareModifyClaims, getRequiredRoles);
