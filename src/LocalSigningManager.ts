import { Keyring } from '@polkadot/api';
import { IKeyringPair } from '@polkadot/types/types';
import { hexToU8a } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { PrivateKey, SigningManager } from '~/types';

/**
 * Signing manager that holds private keys in memory
 */
export class LocalSigningManager implements SigningManager {
  private keyring: Keyring;
  private hasFormat?: boolean;

  /**
   * Create an instance of the Local Signing Manager and populates it with the passed accounts
   *
   * @param args.accounts - array of private keys
   */
  public static async create(args: { accounts: PrivateKey[] }): Promise<LocalSigningManager> {
    await cryptoWaitReady();

    return new LocalSigningManager(args.accounts);
  }

  /**
   * @hidden
   */
  private constructor(accounts: PrivateKey[]) {
    this.keyring = new Keyring({
      type: 'sr25519',
    });

    accounts.forEach(account => {
      this._addAccount(account);
    });
  }

  /**
   * Set the SS58 format in which returned addresses will be encoded
   */
  public setSs58Format(ss58Format: number): void {
    this.hasFormat = true;
    this.keyring.setSS58Format(ss58Format);
  }

  /**
   * Return all keyring pairs in the signing manager
   */
  public async getAccounts(): Promise<IKeyringPair[]> {
    return this.keyring.getPairs();
  }

  /**
   * Return null since signing is performed by each keyring pair
   */
  public getExternalSigner(): null {
    return null;
  }

  /**
   * Add a new account to the Signing Manager via private key
   *
   * @returns the newly added account's address, encoded with the Signing Manager's
   *   current SS58 format
   *
   * @throws if called before calling `setSs58Format`. Normally, `setSs58Format` will be called by the SDK when instantiated.
   *   If accounts need to be pre-loaded, it should be done by passing them to the `create` method
   */
  public addAccount(account: PrivateKey): string {
    const { hasFormat } = this;

    if (!hasFormat) {
      throw new Error('Cannot add accounts before calling `setSs58Format`');
    }

    return this._addAccount(account);
  }

  /**
   * @hidden
   */
  private _addAccount(account: PrivateKey): string {
    const { keyring } = this;

    let address: string;

    if ('uri' in account) {
      ({ address } = keyring.addFromUri(account.uri));
    } else if ('mnemonic' in account) {
      ({ address } = keyring.addFromMnemonic(account.mnemonic));
    } else {
      ({ address } = keyring.addFromSeed(hexToU8a(account.seed)));
    }

    return address;
  }
}
