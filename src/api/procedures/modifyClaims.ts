import { Moment } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesIdentityClaimClaim,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';

import { Context, Identity, PolymeshError, Procedure } from '~/internal';
import {
  CddClaim,
  Claim,
  ClaimData,
  ClaimOperation,
  ClaimTarget,
  ClaimType,
  ErrorCode,
  ModifyClaimsParams,
  RoleType,
  TxTags,
} from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import { tuple } from '~/types/utils';
import { DEFAULT_CDD_ID } from '~/utils/constants';
import {
  claimToMeshClaim,
  dateToMoment,
  meshClaimToClaimKeys,
  signerToString,
  stringToIdentityId,
} from '~/utils/conversion';
import { asIdentity, assembleBatchTransactions } from '~/utils/internal';

/**
 * @hidden
 *
 * Return the claims the signing Identity has not issued to their targets. Each is looked up on
 * chain under the keys it is stored by, so a claim by another issuer, or no claim at all, is missing
 */
const findClaimsNotIssuedBySigner = async (
  claims: ClaimTarget[],
  modifyClaimArgs: [PolymeshPrimitivesIdentityId, PolymeshPrimitivesIdentityClaimClaim, unknown][],
  context: Context
): Promise<Claim[]> => {
  const {
    polymeshApi: {
      query: { identity },
    },
  } = context;

  const { did: signerDid } = await context.getSigningIdentity();
  const rawSignerDid = stringToIdentityId(signerDid, context);

  const keys = modifyClaimArgs.map(([rawTarget, rawClaim]) =>
    meshClaimToClaimKeys(rawTarget, rawClaim, rawSignerDid, context)
  );

  const issuedClaims = await identity.claims.multi(keys);

  return claims.filter((_, index) => issuedClaims[index]!.isNone).map(({ claim }) => claim);
};

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
        const [issuedClaimForTarget] = issuedClaimsForTarget;
        const { claim: issuedClaim } = issuedClaimForTarget as ClaimData;

        const { id: currentCddId } = issuedClaim as CddClaim;
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

  for (const claimValue of claims) {
    const { target, expiry, claim } = claimValue as ClaimTarget;
    const rawExpiry = expiry ? dateToMoment(expiry, context) : null;

    allTargets.push(signerToString(target));

    modifyClaimArgs.push(
      tuple(
        stringToIdentityId(signerToString(target), context),
        await claimToMeshClaim(claim, context),
        rawExpiry
      )
    );
  }

  allTargets = [...new Set(allTargets)];

  const nonExistentDids = await context.getInvalidDids(allTargets);

  if (nonExistentDids.length) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Some of the supplied Identity IDs do not exist',
      data: {
        nonExistentDids,
      },
    });
  }

  // only the issuer of a claim can edit or revoke it
  if (operation !== ClaimOperation.Add) {
    const claimsNotIssuedBySigner = await findClaimsNotIssuedBySigner(
      claims,
      modifyClaimArgs,
      context
    );

    if (claimsNotIssuedBySigner.length) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: `Attempt to ${operation.toLowerCase()} claims that weren't issued by the signing Identity`,
        data: {
          claimsNotIssuedBySigner,
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
  /*
   * only issuing a CDD claim is registrar gated. Revoking one requires being the Identity that
   * issued it, which cannot be checked here
   */
  if (
    operation !== ClaimOperation.Revoke &&
    claims.some(({ claim: { type } }) => type === ClaimType.CustomerDueDiligence)
  ) {
    return {
      roles: [{ type: RoleType.DidRegistrar }],
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
