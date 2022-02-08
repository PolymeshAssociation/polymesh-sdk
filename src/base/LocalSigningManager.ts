import { Keyring } from '@polkadot/api';
import { IKeyringPair } from '@polkadot/types/types';
import { hexToU8a } from '@polkadot/util';
import { cryptoIsReady, cryptoWaitReady } from '@polkadot/util-crypto';

import { SigningManager } from '~/types';

/**
 * URI|mnemonic|hex representation of a private key
 */
type PrivateKey =
  | {
      uri: string;
    }
  | {
      mnemonic: string;
    }
  | {
      seed: string;
    };

/**
 * Signing manager that holds private keys in memory
 */
export class LocalSigningManager implements SigningManager {
  private keyring: Keyring;

  /**
   * Create an instance of the Local Signing Manager and populates it with the passed accounts
   */
  public static async create(args: { accounts: PrivateKey[] }): Promise<LocalSigningManager> {
    if (!cryptoIsReady()) {
      await cryptoWaitReady();
    }

    return new LocalSigningManager(args);
  }

  /**
   * @param args.accounts - array of private keys
   */
  private constructor(args: { accounts: PrivateKey[] }) {
    this.keyring = new Keyring({
      type: 'sr25519',
    });

    args.accounts.forEach(account => {
      this.addAccount(account);
    });
  }

  /**
   * Set the SS58 format in which returned addresses will be encoded
   */
  public setSs58Format(ss58Format: number): void {
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
   * @note this method should only be called after instantiating the SDK with the Signing
   *   Manager. Doing so before can cause return values to be incorrectly encoded. If accounts need to be pre-loaded,
   *   it should be done with the `create` static method
   */
  public addAccount(account: PrivateKey): string {
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
