import stringToU8a from '@polkadot/util/string/toU8a';
import { ApiPromise, Keyring } from '@polymathnetwork/polkadot/api';
import { IdentityId } from '@polymathnetwork/polkadot/types/interfaces';
import { IKeyringPair } from '@polymathnetwork/polkadot/types/types';

import { Identity } from '~/api/entities';
import { PolymeshError } from '~/base';
import { ErrorCode } from '~/types';

interface SignerData {
  currentPair: IKeyringPair;
  did: IdentityId;
}

interface ConstructorParams {
  polymeshApi: ApiPromise;
  keyring: Keyring;
  pair?: SignerData;
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

  public currentPair?: IKeyringPair;

  public currentIdentity?: Identity;

  /**
   * @hidden
   */
  private constructor(params: ConstructorParams) {
    const { polymeshApi, keyring, pair } = params;

    this.polymeshApi = polymeshApi;
    this.keyring = keyring;

    if (pair) {
      this.currentPair = pair.currentPair;
      this.currentIdentity = new Identity({ did: pair.did.toString() }, this);
    }
  }

  static async create(params: { polymeshApi: ApiPromise; seed: string }): Promise<Context>;

  static async create(params: { polymeshApi: ApiPromise; keyring: Keyring }): Promise<Context>;

  static async create(params: { polymeshApi: ApiPromise; uri: string }): Promise<Context>;

  static async create(params: { polymeshApi: ApiPromise }): Promise<Context>;

  /**
   * Create the Context instance
   */
  static async create(params: {
    polymeshApi: ApiPromise;
    seed?: string;
    keyring?: Keyring;
    uri?: string;
  }): Promise<Context> {
    const { polymeshApi, seed, keyring, uri } = params;

    let keyringManagement = new Keyring({ type: 'sr25519' });
    let currentPair = {} as IKeyringPair;
    let keyToIdentityIds;

    if (seed || keyring || uri) {
      if (keyring) {
        keyringManagement = keyring;

        keyToIdentityIds = await polymeshApi.query.identity.keyToIdentityIds(
          keyring.getPairs()[0].publicKey
        );
      } else {
        if (seed) {
          if (seed.length !== 32) {
            throw new PolymeshError({
              code: ErrorCode.ValidationError,
              message: 'Seed must be 32 characters in length',
            });
          }

          currentPair = keyringManagement.addFromSeed(stringToU8a(seed));
        } else {
          currentPair = keyringManagement.addFromUri(uri as string);
        }

        keyToIdentityIds = await polymeshApi.query.identity.keyToIdentityIds(currentPair.publicKey);
      }

      let did: IdentityId;
      try {
        did = keyToIdentityIds.unwrap().asUnique;
      } catch (e) {
        throw new PolymeshError({
          code: ErrorCode.FatalError,
          message: 'Identity ID does not exist',
        });
      }

      return new Context({ polymeshApi, keyring: keyringManagement, pair: { currentPair, did } });
    }
    return new Context({ polymeshApi, keyring: keyringManagement });
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
   * Set a pair as the current account keyring pair
   */
  public setPair = (address: string): void => {
    const { keyring } = this;
    try {
      this.currentPair = keyring.getPair(address);
    } catch (e) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'The address is not present in the keyring set',
      });
    }
  };
}
