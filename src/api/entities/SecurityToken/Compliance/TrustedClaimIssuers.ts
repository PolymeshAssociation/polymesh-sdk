import { TrustedIssuer } from 'polymesh-types/types';

import {
  DefaultTrustedClaimIssuer,
  modifyTokenTrustedClaimIssuers,
  ModifyTokenTrustedClaimIssuersParams,
  Namespace,
  SecurityToken,
  TransactionQueue,
} from '~/internal';
import { SubCallback, UnsubCallback } from '~/types';
import { TrustedClaimIssuerOperation } from '~/types/internal';
import { identityIdToString, stringToTicker } from '~/utils/conversion';

/**
 * Handles all Security Token Default Trusted Claim Issuers related functionality
 */
export class TrustedClaimIssuers extends Namespace<SecurityToken> {
  /**
   * Assign a new default list of trusted claim issuers to the Security Token by replacing the existing ones with the list passed as a parameter
   *
   * This requires two transactions
   *
   * @param args.claimIssuerDids - array of Identity IDs of the default Trusted Claim Issuers
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
   * Add the supplied Identities to the Security Token's list of trusted claim issuers
   *
   * @param args.claimIssuerDids - array of Identity IDs of the default claim issuers
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
   * Remove the supplied Identities from the Security Token's list of trusted claim issuers   *
   *
   * @param args.claimIssuerDids - array of Identity IDs of the default claim issuers
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
  public get(): Promise<DefaultTrustedClaimIssuer[]>;
  public get(callback: SubCallback<DefaultTrustedClaimIssuer[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async get(
    callback?: SubCallback<DefaultTrustedClaimIssuer[]>
  ): Promise<DefaultTrustedClaimIssuer[] | UnsubCallback> {
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

    const assembleResult = (issuers: TrustedIssuer[]): DefaultTrustedClaimIssuer[] =>
      issuers.map(
        ({ issuer }) =>
          new DefaultTrustedClaimIssuer({ did: identityIdToString(issuer), ticker }, context)
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
