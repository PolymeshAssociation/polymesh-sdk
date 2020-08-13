import { ApiPromise, Keyring } from '@polkadot/api';
import { getTypeDef } from '@polkadot/types';
import { AccountInfo } from '@polkadot/types/interfaces';
import { CallBase, TypeDef, TypeDefInfo } from '@polkadot/types/types';
import stringToU8a from '@polkadot/util/string/toU8a';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient, { ApolloQueryResult } from 'apollo-client';
import BigNumber from 'bignumber.js';
import { polymesh } from 'polymesh-types/definitions';
import { DidRecord, IdentityId, ProtocolOp, TxTag } from 'polymesh-types/types';

import { Identity } from '~/api/entities';
import { PolymeshError } from '~/base';
import { didsWithClaims } from '~/middleware/queries';
import { ClaimTypeEnum, Query } from '~/middleware/types';
import {
  AccountBalance,
  ArrayTransactionArgument,
  ClaimData,
  ClaimType,
  CommonKeyring,
  ComplexTransactionArgument,
  Ensured,
  ErrorCode,
  KeyringPair,
  PlainTransactionArgument,
  ResultSet,
  Signer,
  SimpleEnumTransactionArgument,
  SubCallback,
  TransactionArgument,
  TransactionArgumentType,
  UnsubCallback,
} from '~/types';
import { GraphqlQuery } from '~/types/internal';
import {
  balanceToBigNumber,
  calculateNextKey,
  createClaim,
  identityIdToString,
  posRatioToBigNumber,
  signatoryToSigner,
  stringToAccountKey,
  stringToIdentityId,
  textToString,
  txTagToProtocolOp,
  valueToDid,
} from '~/utils';
import { ROOT_TYPES } from '~/utils/constants';

interface SignerData {
  currentPair: KeyringPair;
  did: IdentityId;
}

interface ConstructorParams {
  polymeshApi: ApiPromise;
  middlewareApi: ApolloClient<NormalizedCacheObject> | null;
  keyring: CommonKeyring;
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
  private keyring: CommonKeyring;

  public polymeshApi: ApiPromise;

  public currentPair?: KeyringPair;

  private currentIdentity?: Identity;

  private _middlewareApi: ApolloClient<NormalizedCacheObject> | null;

  /**
   * @hidden
   */
  private constructor(params: ConstructorParams) {
    const { polymeshApi, middlewareApi, keyring, pair } = params;

    this._middlewareApi = middlewareApi;

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

  static async create(params: {
    polymeshApi: ApiPromise;
    middlewareApi: ApolloClient<NormalizedCacheObject> | null;
    seed: string;
  }): Promise<Context>;

  static async create(params: {
    polymeshApi: ApiPromise;
    middlewareApi: ApolloClient<NormalizedCacheObject> | null;
    keyring: CommonKeyring;
  }): Promise<Context>;

  static async create(params: {
    polymeshApi: ApiPromise;
    middlewareApi: ApolloClient<NormalizedCacheObject> | null;
    uri: string;
  }): Promise<Context>;

  static async create(params: {
    polymeshApi: ApiPromise;
    middlewareApi: ApolloClient<NormalizedCacheObject> | null;
  }): Promise<Context>;

  /**
   * Create the Context instance
   */
  static async create(params: {
    polymeshApi: ApiPromise;
    middlewareApi: ApolloClient<NormalizedCacheObject> | null;
    seed?: string;
    keyring?: CommonKeyring;
    uri?: string;
  }): Promise<Context> {
    const { polymeshApi, middlewareApi, seed, keyring: passedKeyring, uri } = params;

    let keyring: CommonKeyring = new Keyring({ type: 'sr25519' });
    let currentPair: KeyringPair | undefined;

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

        return new Context({
          polymeshApi,
          middlewareApi,
          keyring,
          pair: { currentPair, did },
        });
      } catch (err) {
        throw new PolymeshError({
          code: ErrorCode.IdentityNotPresent,
          message: 'There is no Identity associated to this account',
        });
      }
    }

    return new Context({ polymeshApi, middlewareApi, keyring });
  }

  /**
   * Retrieve a list of addresses associated with the account
   */
  public getAccounts(): Array<AccountData> {
    const { keyring } = this;
    return keyring.getPairs().map(({ address, meta }) => {
      return { address, name: meta.name as string };
    });
  }

  /**
   * Set a pair as the current account keyring pair
   */
  public async setPair(address: string): Promise<void> {
    const {
      keyring,
      polymeshApi: {
        query: { identity },
      },
    } = this;

    let newCurrentPair;
    let identityIds;
    let did;

    try {
      newCurrentPair = keyring.getPair(address);
    } catch (e) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'The address is not present in the keyring set',
      });
    }

    try {
      identityIds = await identity.keyToIdentityIds(
        stringToAccountKey(newCurrentPair.address, this)
      );

      did = identityIds.unwrap().asUnique;
    } catch (e) {
      throw new PolymeshError({
        code: ErrorCode.IdentityNotPresent,
        message: 'There is no Identity associated to this account',
      });
    }

    this.currentPair = newCurrentPair;
    this.currentIdentity = new Identity({ did: identityIdToString(did) }, this);
  }

  public accountBalance(accountId?: string): Promise<AccountBalance>;
  public accountBalance(
    accountId: string | undefined,
    callback: SubCallback<AccountBalance>
  ): Promise<UnsubCallback>;

  /**
   * Retrieve the account level POLYX balance
   *
   * @note can be subscribed to
   */
  public async accountBalance(
    accountId?: string,
    callback?: SubCallback<AccountBalance>
  ): Promise<AccountBalance | UnsubCallback> {
    const {
      currentPair,
      polymeshApi: {
        query: { system },
      },
    } = this;
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

    const assembleResult = ({
      data: { free, miscFrozen, feeFrozen },
    }: AccountInfo): AccountBalance => {
      return {
        free: balanceToBigNumber(free),
        locked: BigNumber.max(balanceToBigNumber(miscFrozen), balanceToBigNumber(feeFrozen)),
      };
    };

    if (callback) {
      return system.account(address, info => {
        callback(assembleResult(info));
      });
    }

    const accountInfo = await this.polymeshApi.query.system.account(address);

    return assembleResult(accountInfo);
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
        code: ErrorCode.IdentityNotPresent,
        message: 'The current account does not have an associated identity',
      });
    }

    return currentIdentity;
  }

  /**
   * Retrieve current Keyring Pair
   *
   * @throws if there is no account associated to the SDK instance
   */
  public getCurrentPair(): KeyringPair {
    const { currentPair } = this;
    if (!currentPair) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'There is no account associated with the current SDK instance',
      });
    }

    return currentPair;
  }

  /**
   * Check whether identities exist
   */
  public async getInvalidDids(identities: (string | Identity)[]): Promise<string[]> {
    const dids = identities.map(valueToDid);
    const rawIdentities = dids.map(did => stringToIdentityId(did, this));
    const records = await this.polymeshApi.query.identity.didRecords.multi<DidRecord>(
      rawIdentities
    );

    const invalidDids: string[] = [];

    records.forEach((record, index) => {
      if (record.isEmpty) {
        invalidDids.push(dids[index]);
      }
    });

    return invalidDids;
  }

  /**
   * Retrieve the protocol fees associated with running a specific transaction
   *
   * @param tag - transaction tag (i.e. TxTags.asset.CreateAsset or "asset.createAsset")
   */
  public async getTransactionFees(tag: TxTag): Promise<BigNumber> {
    const {
      polymeshApi: {
        query: { protocolFee },
      },
    } = this;

    let protocolOp: ProtocolOp;
    try {
      protocolOp = txTagToProtocolOp(tag, this);
    } catch (err) {
      return new BigNumber(0);
    }

    const [baseFee, coefficient] = await Promise.all([
      protocolFee.baseFees(protocolOp),
      protocolFee.coefficient(),
    ]);

    return balanceToBigNumber(baseFee).multipliedBy(posRatioToBigNumber(coefficient));
  }

  /**
   * Retrieve the types of arguments that a certain transaction requires to be run
   *
   * @param args.tag - tag associated with the transaction that will be executed if the proposal passes
   */
  public getTransactionArguments(args: { tag: TxTag }): TransactionArgument[] {
    const {
      polymeshApi: { tx },
    } = this;
    const { types } = polymesh;

    const [section, method] = args.tag.split('.');

    const getRootType = (
      type: string
    ):
      | PlainTransactionArgument
      | ArrayTransactionArgument
      | SimpleEnumTransactionArgument
      | ComplexTransactionArgument => {
      const rootType = ROOT_TYPES[type];

      if (rootType) {
        return {
          type: rootType,
        };
      }
      if (type === 'Null') {
        return {
          type: TransactionArgumentType.Null,
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const definition = (types as any)[type];

      if (!definition) {
        return {
          type: TransactionArgumentType.Unknown,
        };
      }

      const typeDef = getTypeDef(JSON.stringify(definition));

      if (typeDef.info === TypeDefInfo.Plain) {
        return getRootType(definition);
      }

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return processType(typeDef, '');
    };

    const processType = (rawType: TypeDef, name: string): TransactionArgument => {
      const { type, info, sub } = rawType;

      const arg = {
        name,
        optional: false,
        _rawType: rawType,
      };

      switch (info) {
        case TypeDefInfo.Plain: {
          return {
            ...getRootType(type),
            ...arg,
          };
        }
        case TypeDefInfo.Compact: {
          return {
            ...processType(sub as TypeDef, name),
            ...arg,
          };
        }
        case TypeDefInfo.Option: {
          return {
            ...processType(sub as TypeDef, name),
            ...arg,
            optional: true,
          };
        }
        case TypeDefInfo.Tuple: {
          return {
            type: TransactionArgumentType.Tuple,
            ...arg,
            internal: (sub as TypeDef[]).map((def, index) => processType(def, `${index}`)),
          };
        }
        case TypeDefInfo.Vec: {
          return {
            type: TransactionArgumentType.Array,
            ...arg,
            internal: processType(sub as TypeDef, ''),
          };
        }
        case TypeDefInfo.VecFixed: {
          return {
            type: TransactionArgumentType.Text,
            ...arg,
          };
        }
        case TypeDefInfo.Enum: {
          const subTypes = sub as TypeDef[];

          const isSimple = subTypes.every(({ type: subType }) => subType === 'Null');

          if (isSimple) {
            return {
              type: TransactionArgumentType.SimpleEnum,
              ...arg,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              internal: subTypes.map(({ name: subName }) => subName!),
            };
          }

          return {
            type: TransactionArgumentType.RichEnum,
            ...arg,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            internal: subTypes.map(def => processType(def, def.name!)),
          };
        }
        case TypeDefInfo.Struct: {
          return {
            type: TransactionArgumentType.Object,
            ...arg,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            internal: (sub as TypeDef[]).map(def => processType(def, def.name!)),
          };
        }
        default: {
          return {
            type: TransactionArgumentType.Unknown,
            ...arg,
          };
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((tx as any)[section][method] as CallBase).meta.args.map(({ name, type }) => {
      const typeDef = getTypeDef(type.toString());
      const argName = textToString(name);

      return processType(typeDef, argName);
    });
  }

  /**
   * Retrieve the list of signing keys related to the account
   *
   * @note can be subscribed to
   */
  public async getSigningKeys(): Promise<Signer[]>;
  public async getSigningKeys(callback: SubCallback<Signer[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getSigningKeys(callback?: SubCallback<Signer[]>): Promise<Signer[] | UnsubCallback> {
    const {
      polymeshApi: {
        query: { identity },
      },
    } = this;

    const { did } = this.getCurrentIdentity();

    const assembleResult = ({ signing_items: signingItems }: DidRecord): Signer[] => {
      return signingItems.map(({ signer: rawSigner }) => signatoryToSigner(rawSigner));
    };

    if (callback) {
      return identity.didRecords(did, records => callback(assembleResult(records)));
    }

    const didRecords = await identity.didRecords(did);
    return assembleResult(didRecords);
  }

  /**
   * Retrieve a list of claims. Can be filtered using parameters
   *
   * @param opts.targets - identities (or identity IDs) for which to fetch claims (targets). Defaults to all targets
   * @param opts.trustedClaimIssuers - identity IDs of claim issuers. Defaults to all claim issuers
   * @param opts.claimTypes - types of the claims to fetch. Defaults to any type
   * @param opts.size - page size
   * @param opts.start - page offset
   */
  public async issuedClaims(
    opts: {
      targets?: (string | Identity)[];
      trustedClaimIssuers?: (string | Identity)[];
      claimTypes?: ClaimType[];
      size?: number;
      start?: number;
    } = {}
  ): Promise<ResultSet<ClaimData>> {
    const { middlewareApi } = this;

    const { targets, trustedClaimIssuers, claimTypes, size, start } = opts;

    let result: ApolloQueryResult<Ensured<Query, 'didsWithClaims'>>;
    try {
      result = await middlewareApi.query<Ensured<Query, 'didsWithClaims'>>(
        didsWithClaims({
          dids: targets?.map(target => valueToDid(target)),
          trustedClaimIssuers: trustedClaimIssuers?.map(trustedClaimIssuer =>
            valueToDid(trustedClaimIssuer)
          ),
          claimTypes: claimTypes?.map(ct => ClaimTypeEnum[ct]),
          count: size,
          skip: start,
        })
      );
    } catch (e) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: `Error in middleware query: ${e.message}`,
      });
    }

    const {
      data: {
        didsWithClaims: { items: didsWithClaimsList, totalCount: count },
      },
    } = result;
    const data: ClaimData[] = [];

    didsWithClaimsList.forEach(({ claims }) => {
      claims.forEach(
        ({ targetDID, issuer, issuance_date: issuanceDate, expiry, type, jurisdiction, scope }) => {
          data.push({
            target: new Identity({ did: targetDID }, this),
            issuer: new Identity({ did: issuer }, this),
            issuedAt: new Date(issuanceDate),
            expiry: expiry ? new Date(expiry) : null,
            claim: createClaim(type, jurisdiction, scope),
          });
        }
      );
    });

    const next = calculateNextKey(count, size, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Retrieve the middleware client
   *
   * @throws if credentials are not set
   */
  public get middlewareApi(): ApolloClient<NormalizedCacheObject> {
    const { _middlewareApi } = this;

    if (!_middlewareApi) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'Cannot perform this action without an active middleware connection',
      });
    }

    return _middlewareApi;
  }

  /**
   *
   * @param query
   */
  public async queryMiddleware<Result extends Partial<Query>>(
    query: GraphqlQuery<unknown>
  ): Promise<ApolloQueryResult<Result>> {
    let result: ApolloQueryResult<Result>;
    try {
      result = await this.middlewareApi.query(query);
    } catch (e) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: `Error in middleware query: ${e.message}`,
      });
    }

    return result;
  }
}
