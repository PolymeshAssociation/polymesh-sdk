import { Context, Namespace } from '~/base';

import { SecurityToken } from '../';
import { Rules } from './Rules';
import { TrustedClaimIssuers } from './TrustedClaimIssuers';

/**
 * Handles all Security Token Compliance related functionality
 */
export class Compliance extends Namespace<SecurityToken> {
  public trustedClaimIssuers: TrustedClaimIssuers;
  public rules: Rules;

  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    this.trustedClaimIssuers = new TrustedClaimIssuers(parent, context);
    this.rules = new Rules(parent, context);
  }
}
