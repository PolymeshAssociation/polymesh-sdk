import { difference, intersection } from 'lodash';
import { Ticker, TrustedIssuer } from 'polymesh-types/types';

import { Identity, PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ClaimType, ErrorCode, Role, RoleType } from '~/types';
import { TrustedClaimIssuerOperation } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  signerToString,
  stringToTicker,
  trustedClaimIssuerToTrustedIssuer,
  trustedIssuerToTrustedClaimIssuer,
} from '~/utils/conversion';

export interface ModifyTokenTrustedClaimIssuersAddSetParams {
  claimIssuers: { identity: string | Identity; trustedFor?: ClaimType[] }[];
}

export interface ModifyTokenTrustedClaimIssuersRemoveParams {
  claimIssuers: (string | Identity)[];
}

/**
 * @hidden
 */
export type Params = { ticker: string } & (
  | (ModifyTokenTrustedClaimIssuersAddSetParams & {
      operation: TrustedClaimIssuerOperation.Add | TrustedClaimIssuerOperation.Set;
    })
  | (ModifyTokenTrustedClaimIssuersRemoveParams & {
      operation: TrustedClaimIssuerOperation.Remove;
    })
);

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
  const { ticker } = args;

  const rawTicker = stringToTicker(ticker, context);

  let claimIssuersToDelete: [Ticker, TrustedIssuer][] = [];
  let claimIssuersToAdd: [Ticker, TrustedIssuer][] = [];

  let inputDids: string[];

  const rawCurrentClaimIssuers = await query.complianceManager.trustedClaimIssuer(rawTicker);

  const currentClaimIssuers = rawCurrentClaimIssuers.map(issuer =>
    trustedIssuerToTrustedClaimIssuer(issuer, context)
  );
  const currentClaimIssuerDids = currentClaimIssuers.map(({ identity: { did } }) => did);

  if (args.operation === TrustedClaimIssuerOperation.Remove) {
    inputDids = args.claimIssuers.map(signerToString);

    const notPresent = difference(inputDids, currentClaimIssuerDids);

    if (notPresent.length) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'One or more of the supplied Identities are not Trusted Claim Issuers',
        data: {
          notPresent,
        },
      });
    }

    claimIssuersToDelete = currentClaimIssuers
      .filter(({ identity: { did } }) => inputDids.includes(did))
      .map(issuer => tuple(rawTicker, trustedClaimIssuerToTrustedIssuer(issuer, context)));
  } else {
    claimIssuersToAdd = [];
    inputDids = [];
    args.claimIssuers.forEach(({ identity, trustedFor }) => {
      let issuerIdentity: Identity;
      if (typeof identity === 'string') {
        issuerIdentity = new Identity({ did: identity }, context);
      } else {
        issuerIdentity = identity;
      }
      claimIssuersToAdd.push(
        tuple(
          rawTicker,
          trustedClaimIssuerToTrustedIssuer({ identity: issuerIdentity, trustedFor }, context)
        )
      );
      inputDids.push(issuerIdentity.did);
    });
  }

  if (args.operation === TrustedClaimIssuerOperation.Set) {
    claimIssuersToDelete = rawCurrentClaimIssuers.map(issuer => [rawTicker, issuer]);

    if (
      !difference(currentClaimIssuerDids, inputDids).length &&
      currentClaimIssuers.length === inputDids.length
    ) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The supplied claim issuer list is equal to the current one',
      });
    }
  }

  if (args.operation === TrustedClaimIssuerOperation.Add) {
    const present = intersection(inputDids, currentClaimIssuerDids);

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

  const nonExistentDids: string[] = await context.getInvalidDids(inputDids);

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
