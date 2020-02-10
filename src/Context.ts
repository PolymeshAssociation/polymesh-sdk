import { Identity } from './api/entities/Identity';
import { ApiPromise, Keyring } from '@polymathnetwork/polkadot/api';
import { KeyringPair, KeyringPair$Meta } from '@polkadot/keyring/types';
import stringToU8a from '@polkadot/util/string/toU8a';
import { LinkedKeyInfo } from '@polymathnetwork/polkadot/types/interfaces';
import { Option } from '@polymathnetwork/polkadot/types/codec';

interface BuildParams {
  polymeshApi: ApiPromise;
  seed: string | undefined;
}

interface ConstructorParams {
  polymeshApi: ApiPromise;
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
  private static keyring: Keyring = new Keyring({ type: 'sr25519' });

  public polymeshApi: ApiPromise;

  public currentPair: KeyringPair | undefined;

  public currentIdentity: Identity | undefined;

  private constructor(params: ConstructorParams) {
    const { polymeshApi, currentPair, did } = params;

    this.polymeshApi = polymeshApi;

    if (currentPair && did) {
      this.currentPair = currentPair;
      this.currentIdentity = new Identity({ did: did.toString() }, this);
    }
  }

  static async create(params: BuildParams) {
    const { polymeshApi, seed } = params;

    if (seed) {
      if (seed.length != 32) {
        throw new Error('Seed must be 32 length size');
      }

      const currentPair = Context.keyring.addFromSeed(stringToU8a(seed));
      const did = await polymeshApi.query.identity.keyToIdentityIds(currentPair.publicKey);
      return new Context({ polymeshApi, currentPair, did });
    }
    return new Context({ polymeshApi });
  }

  public getAddresses = (): Array<AddressPair> => {
    const { keyring } = Context;
    return keyring.getPairs().map(({ address, meta }) => {
      return { address, meta };
    });
  };

  public setPair = (address: string) => {
    const { keyring } = Context;
    try {
      this.currentPair = keyring.getPair(address);
    } catch ({}) {
      throw new Error('The address is not present in the keyring set');
    }
  };
}
