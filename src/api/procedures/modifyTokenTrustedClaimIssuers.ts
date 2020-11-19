import { difference, intersection } from 'lodash';
import { IdentityId, Ticker } from 'polymesh-types/types';

import { Identity, PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, Role, RoleType } from '~/types';
import { TrustedClaimIssuerOperation } from '~/types/internal';
import { tuple } from '~/types/utils';
import { identityIdToString, signerToString, stringToIdentityId, stringToTicker } from '~/utils';

export interface ModifyTokenTrustedClaimIssuersParams {
  claimIssuerIdentities: (string | Identity)[];
}

/**
 * @hidden
 */
export type Params = ModifyTokenTrustedClaimIssuersParams & {
  ticker: string;
  operation: TrustedClaimIssuerOperation;
};

/**
 * @hidden
 */
export async function prepareModifyTokenTrustedClaimIssuers(
  this: Procedure<Params, SecurityToken>,
  args: Params
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: { query, tx },
    },
    context,
  } = this;
  const { ticker, claimIssuerIdentities, operation } = args;

  const rawTicker = stringToTicker(ticker, context);

  let claimIssuersToDelete: [IdentityId, Ticker][] = [];
  let claimIssuersToAdd: [IdentityId, Ticker][] = [];

  const inputDids = claimIssuerIdentities.map(signerToString);

  const rawCurrentClaimIssuers = await query.complianceManager.trustedClaimIssuer(rawTicker);
  const currentClaimIssuers = rawCurrentClaimIssuers.map(issuer => identityIdToString(issuer));

  const rawInput = inputDids
    .map(did => stringToIdentityId(did, context))
    .map(issuer => tuple(issuer, rawTicker));

  if (operation === TrustedClaimIssuerOperation.Set) {
    claimIssuersToDelete = rawCurrentClaimIssuers.map(issuer => [issuer, rawTicker]);

    if (
      !difference(currentClaimIssuers, inputDids).length &&
      currentClaimIssuers.length === inputDids.length
    ) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The supplied claim issuer list is equal to the current one',
      });
    }
  }

  if (operation === TrustedClaimIssuerOperation.Remove) {
    claimIssuersToDelete = rawInput;

    const notPresent = difference(inputDids, currentClaimIssuers);

    if (notPresent.length) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'One or more of the supplied Identities are not Trusted Claim Issuers',
        data: {
          notPresent,
        },
      });
    }
  } else {
    claimIssuersToAdd = rawInput;
  }

  if (operation === TrustedClaimIssuerOperation.Add) {
    const present = intersection(inputDids, currentClaimIssuers);

    if (present.length) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'One or more of the supplied Identities already are Trusted Claim Issuers',
        data: {
          present,
        },
      });
    }
  }

  const nonExistentDids: string[] = await context.getInvalidDids(claimIssuerIdentities);

  if (nonExistentDids.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Some of the supplied Identity IDs do not exist',
      data: {
        nonExistentDids,
      },
    });
  }

  if (claimIssuersToDelete.length) {
    this.addBatchTransaction(
      tx.complianceManager.removeDefaultTrustedClaimIssuer,
      {},
      claimIssuersToDelete
    );
  }

  if (claimIssuersToAdd.length) {
    this.addBatchTransaction(
      tx.complianceManager.addDefaultTrustedClaimIssuer,
      {},
      claimIssuersToAdd
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

/**
 * @hidden
 */
export const modifyTokenTrustedClaimIssuers = new Procedure(
  prepareModifyTokenTrustedClaimIssuers,
  getRequiredRoles
);
