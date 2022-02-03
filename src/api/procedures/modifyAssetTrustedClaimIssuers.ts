import { difference, intersection, isEqual, sortBy } from 'lodash';
import { IdentityId, Ticker, TrustedIssuer, TxTags } from 'polymesh-types/types';

import { Asset, Context, Identity, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, InputTrustedClaimIssuer, TrustedClaimIssuer } from '~/types';
import { ProcedureAuthorization, TrustedClaimIssuerOperation } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  signerToString,
  stringToIdentityId,
  stringToTicker,
  trustedClaimIssuerToTrustedIssuer,
  trustedIssuerToTrustedClaimIssuer,
} from '~/utils/conversion';
import { assembleBatchTransactions, hasSameElements } from '~/utils/internal';

export interface ModifyAssetTrustedClaimIssuersAddSetParams {
  claimIssuers: InputTrustedClaimIssuer[];
}

export interface ModifyAssetTrustedClaimIssuersRemoveParams {
  /**
   * array of Identities (or DIDs) of the default claim issuers
   */
  claimIssuers: (string | Identity)[];
}

/**
 * @hidden
 */
export type Params = { ticker: string } & (
  | (ModifyAssetTrustedClaimIssuersAddSetParams & {
      operation: TrustedClaimIssuerOperation.Add | TrustedClaimIssuerOperation.Set;
    })
  | (ModifyAssetTrustedClaimIssuersRemoveParams & {
      operation: TrustedClaimIssuerOperation.Remove;
    })
);

const convertArgsToRaw = (
  claimIssuers: ModifyAssetTrustedClaimIssuersAddSetParams['claimIssuers'],
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
  claimIssuers: ModifyAssetTrustedClaimIssuersAddSetParams['claimIssuers']
): boolean =>
  hasSameElements(
    currentClaimIssuers,
    claimIssuers,
    (
      { identity: aIdentity, trustedFor: aTrustedFor },
      { identity: bIdentity, trustedFor: bTrustedFor }
    ) => {
      const sameClaimTypes =
        (aTrustedFor === null && bTrustedFor === null) ||
        (aTrustedFor && bTrustedFor && isEqual(sortBy(aTrustedFor), sortBy(bTrustedFor)));

      return signerToString(aIdentity) === signerToString(bIdentity) && !!sameClaimTypes;
    }
  );

/**
 * @hidden
 */
export async function prepareModifyAssetTrustedClaimIssuers(
  this: Procedure<Params, Asset>,
  args: Params
): Promise<Asset> {
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
  const currentClaimIssuerDids = currentClaimIssuers.map(({ identity }) =>
    signerToString(identity)
  );

  if (args.operation === TrustedClaimIssuerOperation.Remove) {
    inputDids = args.claimIssuers.map(signerToString);

    const notPresent = difference(inputDids, currentClaimIssuerDids);

    if (notPresent.length) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'One or more of the supplied Identities are not Trusted Claim Issuers',
        data: {
          notPresent,
        },
      });
    }

    claimIssuersToDelete = currentClaimIssuers
      .filter(({ identity }) => inputDids.includes(signerToString(identity)))
      .map(({ identity }) =>
        tuple(rawTicker, stringToIdentityId(signerToString(identity), context))
      );
  } else {
    ({ claimIssuersToAdd, inputDids } = convertArgsToRaw(args.claimIssuers, rawTicker, context));
  }

  if (args.operation === TrustedClaimIssuerOperation.Set) {
    claimIssuersToDelete = rawCurrentClaimIssuers.map(({ issuer }) => [rawTicker, issuer]);

    if (areSameClaimIssuers(currentClaimIssuers, args.claimIssuers)) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The supplied claim issuer list is equal to the current one',
      });
    }
  }

  if (args.operation === TrustedClaimIssuerOperation.Add) {
    const present = intersection(inputDids, currentClaimIssuerDids);

    if (present.length) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
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
      code: ErrorCode.DataUnavailable,
      message: 'Some of the supplied Identities do not exist',
      data: {
        nonExistentDids,
      },
    });
  }

  const transactions = assembleBatchTransactions(
    tuple(
      {
        transaction: tx.complianceManager.removeDefaultTrustedClaimIssuer,
        argsArray: claimIssuersToDelete,
      },
      {
        transaction: tx.complianceManager.addDefaultTrustedClaimIssuer,
        argsArray: claimIssuersToAdd,
      }
    )
  );

  this.addBatchTransaction({ transactions });

  return new Asset({ ticker }, context);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, Asset>,
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
      assets: [new Asset({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const modifyAssetTrustedClaimIssuers = (): Procedure<Params, Asset> =>
  new Procedure(prepareModifyAssetTrustedClaimIssuers, getAuthorization);
