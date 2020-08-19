import { difference, intersection } from 'lodash';
import { IdentityId, TxTags } from 'polymesh-types/types';

import { Identity, SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, Role, RoleType } from '~/types';
import { TrustedClaimIssuerOperation } from '~/types/internal';
import {
  batchArguments,
  identityIdToString,
  stringToIdentityId,
  stringToTicker,
  valueToDid,
} from '~/utils';

export interface ModifyTokenTrustedClaimIssuersParams {
  claimIssuerIdentities: (string | Identity)[];
}

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

  let claimIssuersToDelete: IdentityId[] = [];
  let claimIssuersToAdd: IdentityId[] = [];

  const inputDids = claimIssuerIdentities.map(valueToDid);

  const rawCurrentClaimIssuers = await query.complianceManager.trustedClaimIssuer(rawTicker);
  const currentClaimIssuers = rawCurrentClaimIssuers.map(issuer => identityIdToString(issuer));

  const rawInput = inputDids.map(did => stringToIdentityId(did, context));

  if (operation === TrustedClaimIssuerOperation.Set) {
    claimIssuersToDelete = rawCurrentClaimIssuers;

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
        message: 'One or more of the supplied identities are not trusted claim issuers',
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
        message: 'One or more of the supplied identities already are trusted claim issuers',
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
      message: 'Some of the supplied identity IDs do not exist',
      data: {
        nonExistentDids,
      },
    });
  }

  if (claimIssuersToDelete.length) {
    batchArguments<IdentityId>(
      claimIssuersToDelete,
      TxTags.complianceManager.BatchRemoveDefaultTrustedClaimIssuer
    ).forEach(issuersBatch => {
      this.addTransaction(
        tx.complianceManager.batchRemoveDefaultTrustedClaimIssuer,
        { batchSize: issuersBatch.length },
        issuersBatch,
        rawTicker
      );
    });
  }

  if (claimIssuersToAdd.length) {
    batchArguments(
      claimIssuersToAdd,
      TxTags.complianceManager.BatchAddDefaultTrustedClaimIssuer
    ).forEach(issuersBatch => {
      this.addTransaction(
        tx.complianceManager.batchAddDefaultTrustedClaimIssuer,
        { batchSize: issuersBatch.length },
        issuersBatch,
        rawTicker
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

export const modifyTokenTrustedClaimIssuers = new Procedure(
  prepareModifyTokenTrustedClaimIssuers,
  getRequiredRoles
);
