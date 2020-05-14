import { chunk } from 'lodash';
import { Claim as MeshClaim } from 'polymesh-types/types';

import { PolymeshError, Procedure } from '~/base';
import { IdentityId } from '~/polkadot';
import { ClaimTargets, ErrorCode } from '~/types';
import { claimToMeshClaim, identityIdToString, stringToIdentityId } from '~/utils';

interface RevokeClaimItem {
  target: IdentityId;
  claim: MeshClaim;
}

export interface RevokeClaimsParams {
  claims: Omit<ClaimTargets, 'expiry'>[];
}

/**
 * @hidden
 */
export async function prepareRevokeClaims(
  this: Procedure<RevokeClaimsParams, void>,
  args: RevokeClaimsParams
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

  const revokeClaimItems: RevokeClaimItem[] = [];

  claims.forEach(({ targets, claim }) => {
    targets.forEach(target =>
      revokeClaimItems.push({
        target: stringToIdentityId(target, context),
        claim: claimToMeshClaim(claim, context),
      })
    );
  });

  const revokeClaimItemsChunks = chunk(revokeClaimItems, 10);

  const nonExistentDids: IdentityId[] = [];

  await Promise.all(
    revokeClaimItemsChunks.map(async revokeClaimItemsChunk => {
      // TODO: queryMulti
      const sizes = await Promise.all(
        revokeClaimItemsChunk.map(({ target }) => didRecords.size(target))
      );

      sizes.forEach((size, index) => {
        if (size.isZero()) {
          nonExistentDids.push(revokeClaimItemsChunk[index].target);
        }
      });
    })
  );

  // TODO @monitz87: check if the claim exists when the harvester is done

  if (nonExistentDids.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `Some of the supplied identity IDs do not exist: ${nonExistentDids
        .map(identityIdToString)
        .join(', ')}`,
    });
  }

  this.addTransaction(tx.identity.revokeClaimsBatch, {}, revokeClaimItems);
}

export const revokeClaims = new Procedure(prepareRevokeClaims);
