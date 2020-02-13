import { Identity } from './api/entities/Identity';
import { ApiPromise, Keyring } from '@polymathnetwork/polkadot/api';
import { KeyringPair, KeyringPair$Meta } from '@polkadot/keyring/types';
import stringToU8a from '@polkadot/util/string/toU8a';
import { LinkedKeyInfo } from '@polymathnetwork/polkadot/types/interfaces';
import { Option } from '@polymathnetwork/polkadot/types/codec';

interface BuildParams {
  polymeshApi: ApiPromise;
  accountSeed?: string | undefined;
}

interface ConstructorParams {
  polymeshApi: ApiPromise;
  keyring: Keyring;
  currentPair?: KeyringPair;
  did?: Option<LinkedKeyInfo>;
}

interface AddressPair {
  address: string;
  meta: KeyringPair$Meta;
}

/**
 * Context in which the SDK is being used
 *
 * - Holds the current low level API
 * - Holds the current keyring pair
 * - Holds the current Identity
 */
export class Context {
  private keyring: Keyring;

  public polymeshApi: ApiPromise;

  public currentPair: KeyringPair | undefined;

  public currentIdentity: Identity | undefined;

  // eslint-disable-next-line require-jsdoc
  private constructor(params: ConstructorParams) {
    const { polymeshApi, keyring, currentPair, did } = params;

    this.polymeshApi = polymeshApi;
    this.keyring = keyring;

    if (currentPair && did) {
      this.currentPair = currentPair;
      this.currentIdentity = new Identity({ did: did.toString() }, this);
    }
  }

  /**
   * Create the Context instance
   */
  static async create(params: BuildParams): Promise<Context> {
    const { polymeshApi, accountSeed } = params;

    const keyring = new Keyring({ type: 'sr25519' });

    if (accountSeed) {
      if (accountSeed.length !== 32) {
        // TODO it should uses polymath error class
        throw new Error('Seed must be 32 length size');
      }

      const currentPair = keyring.addFromSeed(stringToU8a(accountSeed));
      const did = await polymeshApi.query.identity.keyToIdentityIds(currentPair.publicKey);
      return new Context({ polymeshApi, keyring, currentPair, did });
    }
    return new Context({ polymeshApi, keyring });
  }

  public getAddresses = (): Array<AddressPair> => {
    const { keyring } = this;
    return keyring.getPairs().map(({ address, meta }) => {
      return { address, meta };
    });
  };

  public setPair = (address: string): void => {
    const { keyring } = this;
    try {
      this.currentPair = keyring.getPair(address);
    } catch (e) {
      // TODO it should uses polymath error class
      throw new Error('The address is not present in the keyring set');
    }
  };
}
