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

interface Pair {
  current: KeyringPair;
  did: Option<LinkedKeyInfo>;
}

interface ConstructorParams {
  polymeshApi: ApiPromise;
  keyring: Keyring;
  pair?: Pair;
}

interface AccountData {
  address: string;
  name?: string;
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

  public currentPair?: KeyringPair;

  public currentIdentity?: Identity;

  // eslint-disable-next-line require-jsdoc
  private constructor(params: ConstructorParams) {
    const { polymeshApi, keyring, pair } = params;

    this.polymeshApi = polymeshApi;
    this.keyring = keyring;

    if (pair) {
      this.currentPair = pair.current;
      this.currentIdentity = new Identity({ did: pair.did.toString() }, this);
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
        // TODO - MSDK-49 Create Polymesh Error class
        throw new Error('Seed must be 32 length size');
      }

      const current = keyring.addFromSeed(stringToU8a(accountSeed));
      const did = await polymeshApi.query.identity.keyToIdentityIds(current.publicKey);
      return new Context({ polymeshApi, keyring, pair: { current, did } });
    }
    return new Context({ polymeshApi, keyring });
  }

  /**
   * Retrieve a list of addresses associated with the account
   */
  public getAccounts = (): Array<AccountData> => {
    const { keyring } = this;
    return keyring.getPairs().map(({ address, meta }) => {
      return { address, name: meta.name };
    });
  };

  /**
   * Set a pair as a current account keyring pair
   */
  public setPair = (address: string): void => {
    const { keyring } = this;
    try {
      this.currentPair = keyring.getPair(address);
    } catch (e) {
      // TODO - MSDK-49 Create Polymesh Error class
      throw new Error('The address is not present in the keyring set');
    }
  };
}
