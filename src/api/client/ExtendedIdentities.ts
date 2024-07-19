import { Identities } from '@polymeshassociation/polymesh-sdk/api/client/Identities';

import { Identity } from '~/internal';

/**
 * Handles all Identity related functionality
 */
export class ExtendedIdentities extends Identities {
  /**
   * Create an Identity instance from a DID (with confidential methods)
   *
   * @throws if there is no Identity with the passed DID
   */
  override async getIdentity(args: { did: string }): Promise<Identity> {
    const identity = await super.getIdentity(args);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Identity({ did: identity.did }, (identity as any).context);
  }
}
