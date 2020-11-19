import { Account, CurrentIdentity } from '~/internal';

/**
 * Represents the current account that is bound to the SDK instance
 */
export class CurrentAccount extends Account {
  /**
   * Retrieves the current Identity (null if there is none)
   */
  public async getIdentity(): Promise<CurrentIdentity | null> {
    const identity = await super.getIdentity();

    return identity && new CurrentIdentity({ did: identity.did }, this.context);
  }
}
