import { setTokenTrustedClaimIssuers, SetTokenTrustedClaimIssuersParams } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';

import { SecurityToken } from '../';

/**
 * Handles all Security Token Compliance related functionality
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
}
