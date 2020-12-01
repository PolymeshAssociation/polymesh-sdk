import { Namespace, SecurityToken } from '~/api/entities';
import { Context } from '~/base';

import { Requirements } from './Requirements';
import { TrustedClaimIssuers } from './TrustedClaimIssuers';

/**
 * Handles all Security Token Compliance related functionality
 */
export class Compliance extends Namespace<SecurityToken> {
  public trustedClaimIssuers: TrustedClaimIssuers;
  public requirements: Requirements;

  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    this.trustedClaimIssuers = new TrustedClaimIssuers(parent, context);
    this.requirements = new Requirements(parent, context);
  }
}
