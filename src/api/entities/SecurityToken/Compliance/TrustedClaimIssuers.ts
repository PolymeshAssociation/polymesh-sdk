import { Identity } from '~/api/entities';
import { setTokenTrustedClaimIssuers, SetTokenTrustedClaimIssuersParams } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
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

  /**
   * Retrieve the current default trusted claim issuers of the Security Token
   */
  public async get(): Promise<Identity[]> {
    const {
      context,
      parent: { ticker },
    } = this;

    const claimIssuers = await context.polymeshApi.query.generalTm.trustedClaimIssuer(
      stringToTicker(ticker, context)
    );

    return claimIssuers.map(
      claimIssuer => new Identity({ did: identityIdToString(claimIssuer) }, context)
    );
  }
}
