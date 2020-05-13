import { Moment } from '@polkadot/types/interfaces';
import { chunk } from 'lodash';
import { Claim as MeshClaim } from 'polymesh-types/types';

import { PolymeshError, Procedure } from '~/base';
import { IdentityId } from '~/polkadot';
import { ClaimTargets, ClaimType, ErrorCode, Role, RoleType } from '~/types';
import { claimToMeshClaim, dateToMoment, identityIdToString, stringToIdentityId } from '~/utils';

interface AddClaimItem {
  target: IdentityId;
  claim: MeshClaim;
  expiry: Moment | null;
}

export interface AddClaimsParams {
  claims: ClaimTargets[];
}

/**
 * @hidden
 */
export async function prepareAddClaims(
  this: Procedure<AddClaimsParams, void>,
  args: AddClaimsParams
): Promise<void> {
  const { claims } = args;

  const {
    context: {
      polymeshApi: {
        tx,
        query: {
          identity: { didRecords },
        },
      },
    },
    context,
  } = this;

  const addClaimItems: AddClaimItem[] = [];

  claims.forEach(({ targets, claim, expiry }) => {
    targets.forEach(target =>
      addClaimItems.push({
        target: stringToIdentityId(target, context),
        claim: claimToMeshClaim(claim, context),
        expiry: expiry ? dateToMoment(expiry, context) : null,
      })
    );
  });

  const addClaimItemsChunks = chunk(addClaimItems, 10);

  const nonExistentDids: IdentityId[] = [];

  await Promise.all(
    addClaimItemsChunks.map(async addClaimItemsChunk => {
      // TODO: queryMulti
      const sizes = await Promise.all(
        addClaimItemsChunk.map(({ target }) => didRecords.size(target))
      );

      sizes.forEach((size, index) => {
        if (size.isZero()) {
          nonExistentDids.push(addClaimItemsChunk[index].target);
        }
      });
    })
  );

  if (nonExistentDids.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `Some of the supplied identity IDs do not exist: ${nonExistentDids
        .map(identityIdToString)
        .join(', ')}`,
    });
  }

  this.addTransaction(tx.identity.addClaimsBatch, {}, addClaimItems);
}

/**
 * @hidden
 */
export function getRequiredRoles({ claims }: AddClaimsParams): Role[] {
  if (claims.some(({ claim: { type } }) => type === ClaimType.CustomerDueDiligence)) {
    return [{ type: RoleType.CddProvider }];
  }
  return [];
}

export const addClaims = new Procedure(prepareAddClaims, getRequiredRoles);
