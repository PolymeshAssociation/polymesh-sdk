import { Namespace } from '~/base';
import { Context } from '~/context';

import { SecurityToken } from '../';
import { TrustedClaimIssuers } from './TrustedClaimIssuers';

/**
 * Handles all Security Token Compliance related functionality
 */
export class Compliance extends Namespace<SecurityToken> {
  public trustedClaimIssuers: TrustedClaimIssuers;

  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    this.trustedClaimIssuers = new TrustedClaimIssuers(parent, context);
  }
}
