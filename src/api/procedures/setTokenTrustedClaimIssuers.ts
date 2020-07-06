import { chunk, difference } from 'lodash';

import { Identity, SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { TxTags } from '~/polkadot';
import { ErrorCode, Role, RoleType } from '~/types';
import { identityIdToString, stringToIdentityId, stringToTicker, valueToDid } from '~/utils';
import { MAX_BATCH_ELEMENTS } from '~/utils/constants';

export interface SetTokenTrustedClaimIssuersParams {
  claimIssuerIdentities: (string | Identity)[];
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
  const { ticker, claimIssuerIdentities } = args;

  const rawTicker = stringToTicker(ticker, context);

  const rawCurrentClaimIssuers = await query.complianceManager.trustedClaimIssuer(rawTicker);
  const currentClaimIssuers = rawCurrentClaimIssuers.map(issuer => identityIdToString(issuer));

  if (
    !difference(currentClaimIssuers, claimIssuerIdentities).length &&
    currentClaimIssuers.length === claimIssuerIdentities.length
  ) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The supplied claim issuer list is equal to the current one',
    });
  }

  const rawNewClaimIssuers = claimIssuerIdentities.map(identity =>
    stringToIdentityId(valueToDid(identity), context)
  );

  const nonExistentDids: string[] = await context.getInvalidDids(claimIssuerIdentities);

  if (nonExistentDids.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Some of the supplied identity IDs do not exist',
      data: {
        nonExistentDids,
      },
    });
  }

  if (rawCurrentClaimIssuers.length) {
    chunk(
      rawCurrentClaimIssuers,
      MAX_BATCH_ELEMENTS[TxTags.complianceManager.RemoveDefaultTrustedClaimIssuersBatch]
    ).forEach(issuersChunk => {
      this.addTransaction(
        tx.complianceManager.removeDefaultTrustedClaimIssuersBatch,
        { batchSize: issuersChunk.length },
        rawTicker,
        issuersChunk
      );
    });
  }

  if (rawNewClaimIssuers.length) {
    chunk(
      rawNewClaimIssuers,
      MAX_BATCH_ELEMENTS[TxTags.complianceManager.AddDefaultTrustedClaimIssuersBatch]
    ).forEach(issuersChunk => {
      this.addTransaction(
        tx.complianceManager.addDefaultTrustedClaimIssuersBatch,
        { batchSize: issuersChunk.length },
        rawTicker,
        issuersChunk
      );
    });
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
