import { Identity } from '~/api/entities';
import { setTokenTrustedClaimIssuers, SetTokenTrustedClaimIssuersParams } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
import { IdentityId } from '~/polkadot';
import { SubCallback, UnsubCallback } from '~/types';
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
   * @param args.claimIssuerDids - array if identity IDs of the default claim issuers
   */
  public set(args: SetTokenTrustedClaimIssuersParams): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return setTokenTrustedClaimIssuers.prepare({ ticker, ...args }, context);
  }

  public get(): Promise<Identity[]>;
  public get(callback: SubCallback<Identity[]>): Promise<UnsubCallback>;

  /**
   * Retrieve the current default trusted claim issuers of the Security Token
   *
   * @note can be subscribed to
   */
  public async get(callback?: SubCallback<Identity[]>): Promise<Identity[] | UnsubCallback> {
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

    const assembleResult = (issuers: IdentityId[]): Identity[] =>
      issuers.map(claimIssuer => new Identity({ did: identityIdToString(claimIssuer) }, context));

    if (callback) {
      return complianceManager.trustedClaimIssuer(rawTicker, issuers => {
        callback(assembleResult(issuers));
      });
    }

    const claimIssuers = await complianceManager.trustedClaimIssuer(rawTicker);

    return assembleResult(claimIssuers);
  }
}
