import { ApiPromise, Keyring } from '@polkadot/api';
import { IKeyringPair } from '@polkadot/types/types';
import stringToU8a from '@polkadot/util/string/toU8a';
import BigNumber from 'bignumber.js';
import { IdentityId } from 'polymesh-types/types';

import { Identity } from '~/api/entities';
import { PolymeshError } from '~/base';
import { ErrorCode } from '~/types';
import { balanceToBigNumber } from '~/utils';

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

  private currentIdentity?: Identity;

  /**
   * @hidden
   */
  private constructor(params: ConstructorParams) {
    const { polymeshApi, keyring, pair } = params;

    this.polymeshApi = new Proxy(polymeshApi, {
      get: (target, prop: keyof ApiPromise): ApiPromise[keyof ApiPromise] => {
        if (prop === 'tx' && !this.currentPair) {
          throw new PolymeshError({
            code: ErrorCode.FatalError,
            message: 'Cannot perform transactions without an active account',
          });
        }

        return target[prop];
      },
    });
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
    const { polymeshApi, seed, keyring: passedKeyring, uri } = params;

    let keyring = new Keyring({ type: 'sr25519' });
    let currentPair: IKeyringPair | undefined;

    if (passedKeyring) {
      keyring = passedKeyring;
      currentPair = keyring.getPairs()[0];
    } else if (seed) {
      if (seed.length !== 32) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'Seed must be 32 characters in length',
        });
      }

      currentPair = keyring.addFromSeed(stringToU8a(seed));
    } else if (uri) {
      currentPair = keyring.addFromUri(uri);
    }

    if (currentPair) {
      try {
        const identityIds = await polymeshApi.query.identity.keyToIdentityIds(
          currentPair.publicKey
        );
        const did = identityIds.unwrap().asUnique;

        return new Context({ polymeshApi, keyring, pair: { currentPair, did } });
      } catch (err) {
        throw new PolymeshError({
          code: ErrorCode.FatalError,
          message: 'There is no Identity associated to this account',
        });
      }
    }

    return new Context({ polymeshApi, keyring });
  }

  /**
   * Retrieve a list of addresses associated with the account
   */
  public getAccounts(): Array<AccountData> {
    const { keyring } = this;
    return keyring.getPairs().map(({ address, meta }) => {
      return { address, name: meta.name };
    });
  }

  /**
   * Set a pair as the current account keyring pair
   */
  public setPair(address: string): void {
    const { keyring } = this;
    try {
      this.currentPair = keyring.getPair(address);
    } catch (e) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'The address is not present in the keyring set',
      });
    }
  }

  /**
   * Retrieve the account level POLYX balance
   */
  public async accountBalance(accountId?: string): Promise<BigNumber> {
    const { currentPair } = this;
    let address: string;

    if (accountId) {
      address = accountId;
    } else if (currentPair) {
      address = currentPair.address;
    } else {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'There is no account associated with the SDK',
      });
    }

    const {
      data: { free },
    } = await this.polymeshApi.query.system.account(address);

    return balanceToBigNumber(free);
  }

  /**
   * Retrieve current Identity
   *
   * @throws if there is no identity associated to the current account (or there is no current account associated to the SDK instance)
   */
  public getCurrentIdentity(): Identity {
    const { currentIdentity } = this;

    if (!currentIdentity) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'The current account does not have an associated identity',
      });
    }

    return currentIdentity;
  }
}
