import { Account, CurrentIdentity } from '~/internal';
import { Permissions, Signer } from '~/types';
import { signerToString } from '~/utils/conversion';

/**
 * Represents the current account that is bound to the SDK instance
 */
export class CurrentAccount extends Account {
  /**
   * Retrieve the current Identity (null if there is none)
   */
  public async getIdentity(): Promise<CurrentIdentity | null> {
    const identity = await super.getIdentity();

    return identity && new CurrentIdentity({ did: identity.did }, this.context);
  }

  /**
   * Retrieve the Permissions this Account has as a Signing Key for its corresponding Identity
   */
  public async getPermissions(): Promise<Permissions> {
    const { context, address } = this;

    const currentIdentity = await context.getCurrentIdentity();

    const [primaryKey, secondaryKeys] = await Promise.all([
      currentIdentity.getPrimaryKey(),
      currentIdentity.getSecondaryKeys(),
    ]);

    if (address === primaryKey) {
      return {
        tokens: null,
        transactions: null,
        portfolios: null,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const key = secondaryKeys.find(({ signer }) => address === signerToString(signer))!;

    return key.permissions;
  }
}
