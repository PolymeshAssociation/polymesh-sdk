import { chunk, difference } from 'lodash';

import { SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { IdentityId } from '~/polkadot';
import { ErrorCode, Role, RoleType } from '~/types';
import { identityIdToString, stringToIdentityId, stringToTicker } from '~/utils';

export interface SetTokenTrustedClaimIssuersParams {
  claimIssuerDids: string[];
}

export type Params = SetTokenTrustedClaimIssuersParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareSetTokenTrustedClaimIssuers(
  this: Procedure<Params, SecurityToken>,
  args: Params
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: { query, tx },
    },
    context,
  } = this;
  const { ticker, claimIssuerDids } = args;

  const rawTicker = stringToTicker(ticker, context);

  const rawCurrentClaimIssuers = await query.generalTm.trustedClaimIssuer(rawTicker);
  const currentClaimIssuers = rawCurrentClaimIssuers.map(issuer => identityIdToString(issuer));

  if (
    !difference(currentClaimIssuers, claimIssuerDids).length &&
    currentClaimIssuers.length === claimIssuerDids.length
  ) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The supplied claim issuer list is equal to the current one',
    });
  }

  const rawNewClaimIssuers = claimIssuerDids.map(did => stringToIdentityId(did, context));

  const newClaimIssuerChunks = chunk(rawNewClaimIssuers, 10);

  const nonExistentDids: IdentityId[] = [];

  await Promise.all(
    newClaimIssuerChunks.map(async newClaimIssuerChunk => {
      // TODO: queryMulti
      const sizes = await Promise.all(
        newClaimIssuerChunk.map(claimIssuer => query.identity.didRecords.size(claimIssuer))
      );

      sizes.forEach((size, index) => {
        if (size.isZero()) {
          nonExistentDids.push(newClaimIssuerChunk[index]);
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

  if (rawCurrentClaimIssuers.length) {
    this.addTransaction(
      tx.generalTm.removeDefaultTrustedClaimIssuersBatch,
      {},
      rawTicker,
      rawCurrentClaimIssuers
    );
  }

  if (rawNewClaimIssuers.length) {
    this.addTransaction(
      tx.generalTm.addDefaultTrustedClaimIssuersBatch,
      {},
      rawTicker,
      rawNewClaimIssuers
    );
  }

  return new SecurityToken({ ticker }, context);
}

/**
 * @hidden
 */
export function getRequiredRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TokenOwner, ticker }];
}

export const setTokenTrustedClaimIssuers = new Procedure(
  prepareSetTokenTrustedClaimIssuers,
  getRequiredRoles
);
