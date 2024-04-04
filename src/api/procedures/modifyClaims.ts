import { Moment } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesIdentityClaimClaim,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';
import { groupBy, uniq } from 'lodash';

import { Context, Identity, PolymeshError, Procedure } from '~/internal';
import { claimsQuery } from '~/middleware/queries';
import { Claim as MiddlewareClaim, Query } from '~/middleware/types';
import {
  CddClaim,
  Claim,
  ClaimOperation,
  ClaimTarget,
  ClaimType,
  ErrorCode,
  ModifyClaimsParams,
  RoleType,
  TxTags,
} from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import { Ensured, tuple } from '~/types/utils';
import { DEFAULT_CDD_ID } from '~/utils/constants';
import {
  claimToMeshClaim,
  dateToMoment,
  signerToString,
  stringToIdentityId,
} from '~/utils/conversion';
import { areSameClaims, asIdentity, assembleBatchTransactions } from '~/utils/internal';

const findClaimsByOtherIssuers = (
  claims: ClaimTarget[],
  claimsByDid: Record<string, MiddlewareClaim[]>,
  signerDid: string
): Claim[] =>
  claims.reduce<Claim[]>((prev, { target, claim }) => {
    const targetClaims = claimsByDid[signerToString(target)] ?? [];

    const claimIssuedByOtherDids = targetClaims.some(
      targetClaim => areSameClaims(claim, targetClaim) && targetClaim.issuerId !== signerDid
    );

    if (claimIssuedByOtherDids) {
      return [...prev, claim];
    }

    return prev;
  }, []);

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
      const targetIdentity = asIdentity(target, context);
      const issuedClaimsForTarget = issuedCddClaims.data.filter(({ target: issuedTarget }) =>
        targetIdentity.isEqual(issuedTarget)
      );

      if (issuedClaimsForTarget.length) {
        // we know both claims are CDD claims
        const { id: currentCddId } = issuedClaimsForTarget[0].claim as CddClaim;
        const { id: newCddId } = claim as CddClaim;

        if (newCddId !== currentCddId && ![currentCddId, newCddId].includes(DEFAULT_CDD_ID)) {
          invalidCddClaims.push({
            target: targetIdentity,
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
): Promise<BatchTransactionSpec<void, unknown[][]>> {
  const { claims, operation } = args;

  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    context,
  } = this;

  const modifyClaimArgs: [
    PolymeshPrimitivesIdentityId,
    PolymeshPrimitivesIdentityClaimClaim,
    Moment | null
  ][] = [];
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

    const result = await context.queryMiddleware<Ensured<Query, 'claims'>>(
      claimsQuery({
        dids: allTargets,
        trustedClaimIssuers: [currentDid],
        includeExpired: true,
      })
    );

    const {
      data: {
        claims: { nodes: claimsData },
      },
    } = result;

    const claimsByDid = groupBy(claimsData, 'targetId');

    const claimsByOtherIssuers: Claim[] = findClaimsByOtherIssuers(claims, claimsByDid, currentDid);

    if (claimsByOtherIssuers.length) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: `Attempt to ${operation.toLowerCase()} claims that weren't issued by the signing Identity`,
        data: {
          claimsByOtherIssuers,
        },
      });
    }
  }

  if (operation === ClaimOperation.Revoke) {
    const argsArray: [PolymeshPrimitivesIdentityId, PolymeshPrimitivesIdentityClaimClaim][] =
      modifyClaimArgs.map(([identityId, claim]) => [identityId, claim]);

    const transactions = assembleBatchTransactions([
      {
        transaction: identity.revokeClaim,
        argsArray,
      },
    ]);

    return { transactions, resolver: undefined };
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

  const txs = assembleBatchTransactions([
    {
      transaction: identity.addClaim,
      argsArray: modifyClaimArgs,
    },
  ]);

  return { transactions: txs, resolver: undefined };
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
