import { difference, differenceWith, intersection, isEqual, sortBy } from 'lodash';
import { IdentityId, Ticker, TrustedIssuer, TxTags } from 'polymesh-types/types';

import { Context, Identity, PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ClaimType, ErrorCode, TrustedClaimIssuer } from '~/types';
import { ProcedureAuthorization, TrustedClaimIssuerOperation } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  signerToString,
  stringToIdentityId,
  stringToTicker,
  trustedClaimIssuerToTrustedIssuer,
  trustedIssuerToTrustedClaimIssuer,
} from '~/utils/conversion';

export interface ModifyTokenTrustedClaimIssuersAddSetParams {
  /**
   * array of Identity IDs
   */
  claimIssuers: { identity: string | Identity; trustedFor?: ClaimType[] }[];
}

export interface ModifyTokenTrustedClaimIssuersRemoveParams {
  /**
   * array of Identities (or DIDs) of the default claim issuers
   */
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

const convertArgsToRaw = (
  claimIssuers: ModifyTokenTrustedClaimIssuersAddSetParams['claimIssuers'],
  rawTicker: Ticker,
  context: Context
): { claimIssuersToAdd: [Ticker, TrustedIssuer][]; inputDids: string[] } => {
  const claimIssuersToAdd: [Ticker, TrustedIssuer][] = [];
  const inputDids: string[] = [];
  claimIssuers.forEach(({ identity, trustedFor }) => {
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

  return {
    claimIssuersToAdd,
    inputDids,
  };
};

const areSameClaimIssuers = (
  currentClaimIssuers: TrustedClaimIssuer[],
  claimIssuers: ModifyTokenTrustedClaimIssuersAddSetParams['claimIssuers']
): boolean =>
  !differenceWith(
    currentClaimIssuers,
    claimIssuers,
    (
      { identity: { did: aDid }, trustedFor: aTrustedFor },
      { identity: bIdentity, trustedFor: bTrustedFor }
    ) => {
      const sameClaimTypes =
        (aTrustedFor === undefined && bTrustedFor === undefined) ||
        (aTrustedFor && bTrustedFor && isEqual(sortBy(aTrustedFor), sortBy(bTrustedFor)));

      return aDid === signerToString(bIdentity) && !!sameClaimTypes;
    }
  ).length && currentClaimIssuers.length === claimIssuers.length;

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

  let claimIssuersToDelete: [Ticker, IdentityId][] = [];
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
      .map(({ identity: { did } }) => tuple(rawTicker, stringToIdentityId(did, context)));
  } else {
    ({ claimIssuersToAdd, inputDids } = convertArgsToRaw(args.claimIssuers, rawTicker, context));
  }

  if (args.operation === TrustedClaimIssuerOperation.Set) {
    claimIssuersToDelete = rawCurrentClaimIssuers.map(({ issuer }) => [rawTicker, issuer]);

    if (areSameClaimIssuers(currentClaimIssuers, args.claimIssuers)) {
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
export function getAuthorization(
  this: Procedure<Params, SecurityToken>,
  { ticker, operation }: Params
): ProcedureAuthorization {
  const transactions = [];
  if (operation !== TrustedClaimIssuerOperation.Add) {
    transactions.push(TxTags.complianceManager.RemoveDefaultTrustedClaimIssuer);
  }
  if (operation !== TrustedClaimIssuerOperation.Remove) {
    transactions.push(TxTags.complianceManager.AddDefaultTrustedClaimIssuer);
  }

  return {
    permissions: {
      transactions,
      tokens: [new SecurityToken({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const modifyTokenTrustedClaimIssuers = (): Procedure<Params, SecurityToken> =>
  new Procedure(prepareModifyTokenTrustedClaimIssuers, getAuthorization);
