import { ApiPromise, Keyring } from '@polkadot/api';
import { AddressOrPair } from '@polkadot/api/types';
import { getTypeDef } from '@polkadot/types';
import { AccountInfo } from '@polkadot/types/interfaces';
import { CallFunction, TypeDef, TypeDefInfo } from '@polkadot/types/types';
import { hexToU8a } from '@polkadot/util';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient, { ApolloQueryResult } from 'apollo-client';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { flatMap, flatten } from 'lodash';
import { polymesh } from 'polymesh-types/definitions';
import { DidRecord, ProtocolOp, TxTag } from 'polymesh-types/types';

import { Account, CurrentAccount, CurrentIdentity, Identity, PolymeshError } from '~/internal';
import { didsWithClaims, heartbeat } from '~/middleware/queries';
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
  SecondaryKey,
  SimpleEnumTransactionArgument,
  SubCallback,
  TransactionArgument,
  TransactionArgumentType,
  UiKeyring,
  UnsubCallback,
} from '~/types';
import { GraphqlQuery } from '~/types/internal';
import { ROOT_TYPES } from '~/utils/constants';
import {
  balanceToBigNumber,
  claimTypeToMeshClaimType,
  identityIdToString,
  meshClaimToClaim,
  meshPermissionsToPermissions,
  momentToDate,
  numberToU32,
  posRatioToBigNumber,
  signatoryToSignerValue,
  signerToString,
  signerValueToSigner,
  stringToIdentityId,
  textToString,
  txTagToProtocolOp,
  u32ToBigNumber,
} from '~/utils/conversion';
import { calculateNextKey, createClaim, getCommonKeyring } from '~/utils/internal';

interface ConstructorParams {
  polymeshApi: ApiPromise;
  middlewareApi: ApolloClient<NormalizedCacheObject> | null;
  keyring: CommonKeyring;
  pair?: KeyringPair;
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

  /**
   * Whether the current node is an archive node (contains a full history from genesis onward) or not
   */
  public isArchiveNode = false;

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
      this.currentPair = pair;
    }
  }

  /**
   * Create the Context instance
   */
  static async create(params: {
    polymeshApi: ApiPromise;
    middlewareApi: ApolloClient<NormalizedCacheObject> | null;
    accountSeed?: string;
    keyring?: CommonKeyring | UiKeyring;
    accountUri?: string;
    accountMnemonic?: string;
  }): Promise<Context> {
    const {
      polymeshApi,
      middlewareApi,
      accountSeed,
      keyring: passedKeyring,
      accountUri,
      accountMnemonic,
    } = params;

    let keyring: CommonKeyring = new Keyring({ type: 'sr25519' });
    let currentPair: KeyringPair | undefined;
    let context: Context;

    if (passedKeyring) {
      keyring = getCommonKeyring(passedKeyring);
      currentPair = keyring.getPairs()[0];
    } else if (accountSeed) {
      if (accountSeed.length !== 66) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'Seed must be 66 characters in length',
        });
      }

      currentPair = keyring.addFromSeed(hexToU8a(accountSeed), undefined, 'sr25519');
    } else if (accountUri) {
      currentPair = keyring.addFromUri(accountUri);
    } else if (accountMnemonic) {
      currentPair = keyring.addFromMnemonic(accountMnemonic);
    }

    if (currentPair) {
      context = new Context({
        polymeshApi,
        middlewareApi,
        keyring,
        pair: currentPair,
      });
    } else {
      context = new Context({ polymeshApi, middlewareApi, keyring });
    }

    context.isArchiveNode = await context.isCurrentNodeArchive();

    return context;
  }

  /**
   * @hidden
   */
  private async isCurrentNodeArchive(): Promise<boolean> {
    const {
      polymeshApi: {
        query: { balances, system },
      },
    } = this;

    try {
      const blockHash = await system.blockHash(numberToU32(0, this));
      const balance = await balances.totalIssuance.at(blockHash);
      return balanceToBigNumber(balance).gt(new BigNumber(0));
    } catch (e) {
      return false;
    }
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
    const { keyring } = this;

    let newCurrentPair;

    try {
      newCurrentPair = keyring.getPair(address);
    } catch (e) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'The address is not present in the keyring set',
      });
    }

    this.currentPair = newCurrentPair;
  }

  public accountBalance(account?: string | Account): Promise<AccountBalance>;
  public accountBalance(
    account: string | Account | undefined,
    callback: SubCallback<AccountBalance>
  ): Promise<UnsubCallback>;

  /**
   * Retrieve the account level POLYX balance
   *
   * @note can be subscribed to
   */
  public async accountBalance(
    account?: string | Account,
    callback?: SubCallback<AccountBalance>
  ): Promise<AccountBalance | UnsubCallback> {
    const {
      currentPair,
      polymeshApi: {
        query: { system },
      },
    } = this;
    let address: string;

    if (account) {
      address = signerToString(account);
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
   * Retrieve current Account
   *
   * @throws if there is no current account associated to the SDK instance
   */
  public getCurrentAccount(): CurrentAccount {
    const { currentPair } = this;

    if (!currentPair) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'There is no account associated with the SDK',
      });
    }

    const { address } = currentPair;

    return new CurrentAccount({ address }, this);
  }

  /**
   * Retrieve current Identity
   *
   * @throws if there is no Identity associated to the current Account (or there is no current Account associated to the SDK instance)
   */
  public async getCurrentIdentity(): Promise<CurrentIdentity> {
    const account = this.getCurrentAccount();

    const identity = await account.getIdentity();

    if (identity === null) {
      throw new PolymeshError({
        code: ErrorCode.IdentityNotPresent,
        message: 'The current account does not have an associated Identity',
      });
    }

    return identity;
  }

  /**
   * Retrieve current Keyring Pair
   *
   * @throws if there is no Account associated to the SDK instance
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
   * Retrieve the signer address (or keyring pair)
   */
  public getSigner(): AddressOrPair {
    const currentPair = this.getCurrentPair();
    const { isLocked, address } = currentPair;
    /*
     * if the keyring pair is locked, it means it most likely got added from the polkadot extension
     * with a custom signer. This means we have to pass just the address to signAndSend
     */
    return isLocked ? address : currentPair;
  }

  /**
   * Check whether Identities exist
   */
  public async getInvalidDids(identities: (string | Identity)[]): Promise<string[]> {
    const dids = identities.map(signerToString);
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
    return ((tx as any)[section][method] as CallFunction).meta.args.map(({ name, type }) => {
      const typeDef = getTypeDef(type.toString());
      const argName = textToString(name);

      return processType(typeDef, argName);
    });
  }

  /**
   * Retrieve the list of secondary keys related to the Account
   *
   * @note can be subscribed to
   */
  public async getSecondaryKeys(): Promise<SecondaryKey[]>;
  public async getSecondaryKeys(callback: SubCallback<SecondaryKey[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getSecondaryKeys(
    callback?: SubCallback<SecondaryKey[]>
  ): Promise<SecondaryKey[] | UnsubCallback> {
    const {
      polymeshApi: {
        query: { identity },
      },
    } = this;

    const { did } = await this.getCurrentIdentity();

    const assembleResult = ({ secondary_keys: secondaryKeys }: DidRecord): SecondaryKey[] => {
      return secondaryKeys.map(({ signer: rawSigner, permissions }) => ({
        signer: signerValueToSigner(signatoryToSignerValue(rawSigner), this),
        permissions: meshPermissionsToPermissions(permissions, this),
      }));
    };

    if (callback) {
      return identity.didRecords(did, records => callback(assembleResult(records)));
    }

    const didRecords = await identity.didRecords(did);
    return assembleResult(didRecords);
  }

  /**
   * @hidden
   *
   * @note no claimTypes value means ALL claim types
   */
  public async getIdentityClaimsFromChain(args: {
    targets: (string | Identity)[];
    claimTypes?: ClaimType[];
    trustedClaimIssuers?: (string | Identity)[];
    includeExpired: boolean;
  }): Promise<ClaimData[]> {
    const {
      polymeshApi: {
        query: { identity },
      },
    } = this;

    const {
      targets,
      claimTypes = Object.values(ClaimType),
      trustedClaimIssuers,
      includeExpired,
    } = args;

    const claim1stKeys = flatMap(targets, target =>
      claimTypes.map(claimType => {
        return {
          target: signerToString(target),
          // eslint-disable-next-line @typescript-eslint/camelcase
          claim_type: claimTypeToMeshClaimType(claimType, this),
        };
      })
    );

    const claimIssuerDids = trustedClaimIssuers?.map(trustedClaimIssuer =>
      signerToString(trustedClaimIssuer)
    );

    const claimData = await P.map(claim1stKeys, async claim1stKey => {
      const entries = await identity.claims.entries(claim1stKey);
      const data: ClaimData[] = [];
      entries.forEach(
        ([
          key,
          { claim_issuer: claimissuer, issuance_date: issuanceDate, expiry: rawExpiry, claim },
        ]) => {
          const { target } = key.args[0];
          const expiry = !rawExpiry.isEmpty ? momentToDate(rawExpiry.unwrap()) : null;
          if ((!includeExpired && (expiry === null || expiry > new Date())) || includeExpired) {
            data.push({
              target: new Identity({ did: identityIdToString(target) }, this),
              issuer: new Identity({ did: identityIdToString(claimissuer) }, this),
              issuedAt: momentToDate(issuanceDate),
              expiry,
              claim: meshClaimToClaim(claim),
            });
          }
        }
      );
      return data;
    });

    return flatten(claimData).filter(({ issuer }) =>
      claimIssuerDids ? claimIssuerDids.includes(issuer.did) : true
    );
  }

  /**
   * @hidden
   */
  public async getIdentityClaimsFromMiddleware(args: {
    targets?: (string | Identity)[];
    trustedClaimIssuers?: (string | Identity)[];
    claimTypes?: ClaimType[];
    includeExpired?: boolean;
    size?: number;
    start?: number;
  }): Promise<ResultSet<ClaimData>> {
    const { targets, claimTypes, trustedClaimIssuers, includeExpired, size, start } = args;

    const data: ClaimData[] = [];

    const result = await this.queryMiddleware<Ensured<Query, 'didsWithClaims'>>(
      didsWithClaims({
        dids: targets?.map(target => signerToString(target)),
        trustedClaimIssuers: trustedClaimIssuers?.map(trustedClaimIssuer =>
          signerToString(trustedClaimIssuer)
        ),
        claimTypes: claimTypes?.map(ct => ClaimTypeEnum[ct]),
        includeExpired,
        count: size,
        skip: start,
      })
    );

    const {
      data: {
        didsWithClaims: { items: didsWithClaimsList, totalCount: count },
      },
    } = result;

    didsWithClaimsList.forEach(({ claims }) => {
      claims.forEach(
        ({
          targetDID,
          issuer,
          issuance_date: issuanceDate,
          expiry,
          type,
          jurisdiction,
          scope,
          cdd_id: cddId,
        }) => {
          data.push({
            target: new Identity({ did: targetDID }, this),
            issuer: new Identity({ did: issuer }, this),
            issuedAt: new Date(issuanceDate),
            expiry: expiry ? new Date(expiry) : null,
            claim: createClaim(type, jurisdiction, scope, cddId, undefined),
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
   * Retrieve a list of claims. Can be filtered using parameters
   *
   * @param opts.targets - identities (or Identity IDs) for which to fetch claims (targets). Defaults to all targets
   * @param opts.trustedClaimIssuers - identity IDs of claim issuers. Defaults to all claim issuers
   * @param opts.claimTypes - types of the claims to fetch. Defaults to any type
   * @param opts.includeExpired - whether to include expired claims. Defaults to true
   * @param opts.size - page size
   * @param opts.start - page offset
   *
   * @note uses the middleware (optional)
   */
  public async issuedClaims(
    opts: {
      targets?: (string | Identity)[];
      trustedClaimIssuers?: (string | Identity)[];
      claimTypes?: ClaimType[];
      includeExpired?: boolean;
      size?: number;
      start?: number;
    } = {}
  ): Promise<ResultSet<ClaimData>> {
    const { targets, trustedClaimIssuers, claimTypes, includeExpired = true, size, start } = opts;

    const isMiddlewareAvailable = await this.isMiddlewareAvailable();

    if (isMiddlewareAvailable) {
      return this.getIdentityClaimsFromMiddleware({
        targets,
        trustedClaimIssuers,
        claimTypes,
        includeExpired,
        size,
        start,
      });
    }

    if (!targets) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'Cannot perform this action without an active middleware connection',
      });
    }

    const identityClaimsFromChain = await this.getIdentityClaimsFromChain({
      targets,
      claimTypes,
      trustedClaimIssuers,
      includeExpired,
    });

    return {
      data: identityClaimsFromChain,
      next: null,
      count: undefined,
    };
  }

  /**
   * Retrieve the middleware client
   *
   * @throws if the middleware is not enabled
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
   * Make a query to the middleware server using the apollo client
   */
  public async queryMiddleware<Result extends Partial<Query>>(
    query: GraphqlQuery<unknown>
  ): Promise<ApolloQueryResult<Result>> {
    let result: ApolloQueryResult<Result>;
    try {
      result = await this.middlewareApi.query(query);
    } catch (err) {
      const resultMessage = err.networkError?.result?.message;
      const { message: errorMessage } = err;
      const message = resultMessage ?? errorMessage;
      throw new PolymeshError({
        code: ErrorCode.MiddlewareError,
        message: `Error in middleware query: ${message}`,
      });
    }

    return result;
  }

  /**
   * Return whether the middleware was enabled at startup
   */
  public isMiddlewareEnabled(): boolean {
    return !!this._middlewareApi;
  }

  /**
   * Return whether the middleware is enabled and online
   */
  public async isMiddlewareAvailable(): Promise<boolean> {
    try {
      this.middlewareApi.query(heartbeat());
    } catch (err) {
      return false;
    }

    return true;
  }

  /**
   * Retrieve the latest block number
   */
  public async getLatestBlock(): Promise<BigNumber> {
    const { number } = await this.polymeshApi.rpc.chain.getHeader();

    return u32ToBigNumber(number.unwrap());
  }
}
