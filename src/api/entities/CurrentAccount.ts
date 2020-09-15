import { Account, CurrentIdentity } from '~/api/entities';

/**
 * Represents the current account that is bound to the SDK instance
 */
export class CurrentAccount extends Account {
  /**
   * Retrieves the current Identity
   */
  public async getIdentity(): Promise<CurrentIdentity> {
    const { did } = await super.getIdentity();

    return new CurrentIdentity({ did }, this.context);
  }
}
