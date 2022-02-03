import { Asset, Context, Namespace } from '~/internal';

import { Requirements } from './Requirements';
import { TrustedClaimIssuers } from './TrustedClaimIssuers';

/**
 * Handles all Asset Compliance related functionality
 */
export class Compliance extends Namespace<Asset> {
  public trustedClaimIssuers: TrustedClaimIssuers;
  public requirements: Requirements;

  /**
   * @hidden
   */
  constructor(parent: Asset, context: Context) {
    super(parent, context);

    this.trustedClaimIssuers = new TrustedClaimIssuers(parent, context);
    this.requirements = new Requirements(parent, context);
  }
}
