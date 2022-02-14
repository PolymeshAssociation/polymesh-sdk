import { Keyring } from '@polkadot/api';
import { TypeRegistry } from '@polkadot/types';
import {
  IKeyringPair,
  Signer as PolkadotSigner,
  SignerPayloadJSON,
  SignerPayloadRaw,
  SignerResult,
} from '@polkadot/types/types';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { PrivateKey, SigningManager } from '~/types';

/**
 * Manages signing payloads with a set of pre-loaded accounts in a Keyring
 */
export class KeyringSigner implements PolkadotSigner {
  private currentId = -1;

  /**
   * @hidden
   */
  constructor(private readonly keyring: Keyring, private readonly registry: TypeRegistry) {}

  /**
   * Sign a payload
   */
  public async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
    const { registry } = this;
    const { address, signedExtensions, version } = payload;

    const pair = this.getPair(address);

    registry.setSignedExtensions(signedExtensions);

    const signablePayload = registry.createType('ExtrinsicPayload', payload, {
      version,
    });

    const { signature } = signablePayload.sign(pair);

    const id = (this.currentId += 1);

    return {
      signature,
      id,
    };
  }

  /**
   * Sign raw data
   */
  public async signRaw(raw: SignerPayloadRaw): Promise<SignerResult> {
    const { address, data } = raw;

    const pair = this.getPair(address);

    const signature = u8aToHex(pair.sign(hexToU8a(data)));

    const id = (this.currentId += 1);

    return {
      id,
      signature,
    };
  }

  /**
   * @hidden
   *
   * Get a pair from the keyring
   *
   * @throws if there is no pair with that address
   */
  private getPair(address: string): IKeyringPair {
    const { keyring } = this;

    try {
      return keyring.getPair(address);
    } catch (err) {
      if (err.message.indexOf('Unable to retrieve keypair') > -1) {
        throw new Error('The signer cannot sign transactions on behalf of the calling Account');
      } else {
        throw err;
      }
    }
  }
}

/**
 * Signing manager that holds private keys in memory
 */
export class LocalSigningManager implements SigningManager {
  private keyring: Keyring;
  private externalSigner: KeyringSigner;
  private hasFormat?: boolean;

  /**
   * Create an instance of the Local Signing Manager and populates it with the passed Accounts
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

    this.externalSigner = new KeyringSigner(this.keyring, new TypeRegistry());

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
   * Return the addresses of all Accounts in the Signing Manager
   *
   * @throws if called before calling `setSs58Format`. Normally, `setSs58Format` will be called by the SDK when instantiated
   */
  public async getAccounts(): Promise<string[]> {
    this.assertFormatSet();
    return this.keyring.getPairs().map(({ address }) => address);
  }

  /**
   * Return a signer object that uses the underlying keyring pairs to sign
   */
  public getExternalSigner(): PolkadotSigner {
    return this.externalSigner;
  }

  /**
   * Add a new Account to the Signing Manager via private key
   *
   * @returns the newly added Account's address, encoded with the Signing Manager's
   *   current SS58 format
   *
   * @throws if called before calling `setSs58Format`. Normally, `setSs58Format` will be called by the SDK when instantiated.
   *   If Accounts need to be pre-loaded, it should be done by passing them to the `create` method
   */
  public addAccount(account: PrivateKey): string {
    this.assertFormatSet();

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

  /**
   * @hidden
   *
   * Throw an error if the SS58 format hasn't been set yet
   */
  private assertFormatSet(): void {
    const { hasFormat } = this;

    if (!hasFormat) {
      throw new Error(
        'Cannot add Accounts before calling `setSs58Format`. Did you forget to use this Signing Manager to connect with the Polymesh SDK?'
      );
    }
  }
}
