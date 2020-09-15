import { Identity } from '~/api/entities';
import { removeSigningKeys } from '~/api/procedures';
import { TransactionQueue } from '~/base';
import { Signer, SigningKey, SubCallback, UnsubCallback } from '~/types';

/**
 * Represents the Identity associated to the current [[Account]]
 */
export class CurrentIdentity extends Identity {
  /**
   * Get the list of signing keys related to the identity
   *
   * @note can be subscribed to
   */
  public async getSigningKeys(): Promise<SigningKey[]>;
  public async getSigningKeys(callback: SubCallback<SigningKey[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getSigningKeys(
    callback?: SubCallback<SigningKey[]>
  ): Promise<SigningKey[] | UnsubCallback> {
    const { context } = this;

    if (callback) {
      return context.getSigningKeys(callback);
    }

    return context.getSigningKeys();
  }

  /**
   * Remove a list of signing keys associated with the identity
   */
  public removeSigningKeys(args: { signers: Signer[] }): Promise<TransactionQueue<void>> {
    return removeSigningKeys.prepare(args, this.context);
  }
}
