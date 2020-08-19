import { IdentityId } from 'polymesh-types/types';

import { TrustedClaimIssuer } from '~/api/entities/TrustedClaimIssuer';
import {
  modifyTokenTrustedClaimIssuers,
  ModifyTokenTrustedClaimIssuersParams,
} from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
import { SubCallback, UnsubCallback } from '~/types';
import { TrustedClaimIssuerOperation } from '~/types/internal';
import { identityIdToString, stringToTicker } from '~/utils';

import { SecurityToken } from '../';

/**
 * Handles all Security Token Default Trusted Claim Issuers related functionality
 */
export class TrustedClaimIssuers extends Namespace<SecurityToken> {
  /**
   * Assign a new default list of trusted claim issuers to the Security Token by replacing the existing ones with the list passed as a parameter
   *
   * This requires two transactions
   *
   * @param args.claimIssuerDids - array of identity IDs of the default claim issuers
   */
  public set(args: ModifyTokenTrustedClaimIssuersParams): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return modifyTokenTrustedClaimIssuers.prepare(
      { ticker, ...args, operation: TrustedClaimIssuerOperation.Set },
      context
    );
  }

  /**
   * Add the supplied identities to the Security Token's list of trusted claim issuers
   *
   * @param args.claimIssuerDids - array of identity IDs of the default claim issuers
   */
  public add(args: ModifyTokenTrustedClaimIssuersParams): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return modifyTokenTrustedClaimIssuers.prepare(
      { ticker, ...args, operation: TrustedClaimIssuerOperation.Add },
      context
    );
  }

  /**
   * Remove the supplied identities from the Security Token's list of trusted claim issuers   *
   *
   * @param args.claimIssuerDids - array of identity IDs of the default claim issuers
   */
  public remove(
    args: ModifyTokenTrustedClaimIssuersParams
  ): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return modifyTokenTrustedClaimIssuers.prepare(
      { ticker, ...args, operation: TrustedClaimIssuerOperation.Remove },
      context
    );
  }

  /**
   * Retrieve the current default trusted claim issuers of the Security Token
   *
   * @note can be subscribed to
   */
  public get(): Promise<TrustedClaimIssuer[]>;
  public get(callback: SubCallback<TrustedClaimIssuer[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async get(
    callback?: SubCallback<TrustedClaimIssuer[]>
  ): Promise<TrustedClaimIssuer[] | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { complianceManager },
        },
      },
      context,
      parent: { ticker },
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const assembleResult = (issuers: IdentityId[]): TrustedClaimIssuer[] =>
      issuers.map(
        claimIssuer =>
          new TrustedClaimIssuer({ did: identityIdToString(claimIssuer), ticker }, context)
      );

    if (callback) {
      return complianceManager.trustedClaimIssuer(rawTicker, issuers => {
        callback(assembleResult(issuers));
      });
    }

    const claimIssuers = await complianceManager.trustedClaimIssuer(rawTicker);

    return assembleResult(claimIssuers);
  }
}
