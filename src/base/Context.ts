import { ApiPromise, Keyring } from '@polkadot/api';
import { AddressOrPair } from '@polkadot/api/types';
import { getTypeDef, Option } from '@polkadot/types';
import { AccountInfo } from '@polkadot/types/interfaces';
import { CallFunction, TypeDef, TypeDefInfo } from '@polkadot/types/types';
import { hexToU8a } from '@polkadot/util';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient, { ApolloQueryResult } from 'apollo-client';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { chunk, clone, flatMap, flatten, flattenDeep, remove } from 'lodash';
import { polymesh } from 'polymesh-types/definitions';
import {
  CAId,
  Distribution,
  ProtocolOp,
  Subsidy as MeshSubsidy,
  TxTag,
} from 'polymesh-types/types';

import { Account, DividendDistribution, Identity, PolymeshError, SecurityToken } from '~/internal';
import { didsWithClaims, heartbeat } from '~/middleware/queries';
import { ClaimTypeEnum, Query } from '~/middleware/types';
import {
  AccountBalance,
  ArrayTransactionArgument,
  ClaimData,
  ClaimType,
  CommonKeyring,
  ComplexTransactionArgument,
  CorporateActionParams,
  DistributionWithDetails,
  ErrorCode,
  KeyringPair,
  PlainTransactionArgument,
  ResultSet,
  SimpleEnumTransactionArgument,
  SubCallback,
  Subsidy,
  TransactionArgument,
  TransactionArgumentType,
  UiKeyring,
  UnsubCallback,
} from '~/types';
import { GraphqlQuery } from '~/types/internal';
import { Ensured, QueryReturnType } from '~/types/utils';
import { MAX_CONCURRENT_REQUESTS, MAX_PAGE_SIZE, ROOT_TYPES } from '~/utils/constants';
import {
  accountIdToString,
  balanceToBigNumber,
  boolToBoolean,
  claimTypeToMeshClaimType,
  corporateActionIdentifierToCaId,
  distributionToDividendDistributionParams,
  identityIdToString,
  meshClaimToClaim,
  meshCorporateActionToCorporateActionParams,
  momentToDate,
  numberToU32,
  posRatioToBigNumber,
  signerToString,
  stringToAccountId,
  stringToIdentityId,
  stringToTicker,
  textToString,
  tickerToString,
  txTagToProtocolOp,
  u8ToBigNumber,
  u32ToBigNumber,
} from '~/utils/conversion';
import {
  assertFormatValid,
  assertKeyringFormatValid,
  calculateNextKey,
  createClaim,
  getCommonKeyring,
} from '~/utils/internal';

interface ConstructorParams {
  polymeshApi: ApiPromise;
  middlewareApi: ApolloClient<NormalizedCacheObject> | null;
  keyring: CommonKeyring;
  ss58Format: number;
}

interface AddPairBaseParams {
  keyring: CommonKeyring;
}

type AddPairParams = {
  accountSeed?: string;
  accountUri?: string;
  accountMnemonic?: string;
  pair?: KeyringPair;
};

/**
 * Context in which the SDK is being used
 *
 * - Holds the current low level API
 * - Holds the current keyring pair
 * - Holds the current Identity
 */
export class Context {
  private keyring: CommonKeyring;
  private isDisconnected = false;

  public polymeshApi: ApiPromise;

  public currentPair?: KeyringPair;

  /**
   * Whether the current node is an archive node (contains a full history from genesis onward) or not
   */
  public isArchiveNode = false;

  public ss58Format: number;

  private _middlewareApi: ApolloClient<NormalizedCacheObject> | null;

  private _polymeshApi: ApiPromise;

  /**
   * @hidden
   */
  private constructor(params: ConstructorParams) {
    const { polymeshApi, middlewareApi, keyring, ss58Format } = params;

    this._middlewareApi = middlewareApi;
    this._polymeshApi = polymeshApi;
    this.polymeshApi = Context.createPolymeshApiProxy(this);
    this.keyring = keyring;
    this.ss58Format = ss58Format;

    const currentPair = keyring.getPairs()[0];

    if (currentPair) {
      assertFormatValid(currentPair.address, ss58Format);
      this.currentPair = currentPair;
    }
  }

  /**
   * @hidden
   */
  static createPolymeshApiProxy(ctx: Context): ApiPromise {
    return new Proxy(ctx._polymeshApi, {
      get: (target, prop: keyof ApiPromise): ApiPromise[keyof ApiPromise] => {
        if (prop === 'tx' && !ctx.currentPair) {
          throw new PolymeshError({
            code: ErrorCode.General,
            message: 'Cannot perform transactions without an active Account',
          });
        }

        return target[prop];
      },
    });
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

    const ss58Format: number | undefined = u8ToBigNumber(
      polymeshApi.consts.system.ss58Prefix
    ).toNumber();

    let keyring: CommonKeyring = new Keyring({ type: 'sr25519', ss58Format });

    if (passedKeyring) {
      keyring = getCommonKeyring(passedKeyring);
      assertKeyringFormatValid(keyring, ss58Format);
    } else {
      Context._addPair({
        accountSeed,
        accountMnemonic,
        accountUri,
        keyring,
      });
    }

    const context = new Context({ polymeshApi, middlewareApi, keyring, ss58Format });

    context.isArchiveNode = await context.isCurrentNodeArchive();

    return new Proxy(context, {
      get: (target, prop: keyof Context): Context[keyof Context] => {
        if (target.isDisconnected) {
          throw new PolymeshError({
            code: ErrorCode.FatalError,
            message: 'Client disconnected. Please create a new instance via "Polymesh.connect()"',
          });
        }

        return target[prop];
      },
    });
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
   * Retrieve a list of Accounts that can act as signers. The first Account in the array is the current Account (default signer)
   */
  public getAccounts(): Account[] {
    const { keyring, currentPair } = this;

    if (!currentPair) {
      throw new PolymeshError({
        code: ErrorCode.General,
        message: 'There is no Account associated with the SDK',
      });
    }

    const pairs = [...keyring.getPairs()];

    const [first] = remove(pairs, ({ address }) => currentPair.address === address);

    return [
      new Account({ address: first.address }, this),
      ...pairs.map(({ address }) => new Account({ address }, this)),
    ];
  }

  /**
   * Add a signing pair to the Keyring
   */
  public addPair(params: AddPairParams): KeyringPair {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return Context._addPair({ ...params, keyring: this.keyring })!;
  }

  /**
   * @hidden
   */
  private static _addPair(params: AddPairBaseParams & AddPairParams): KeyringPair | undefined {
    const { accountSeed, accountUri, accountMnemonic, keyring, pair } = params;

    let newPair: KeyringPair;
    if (accountSeed) {
      if (accountSeed.length !== 66) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'Seed must be 66 characters in length',
        });
      }

      newPair = keyring.addFromSeed(hexToU8a(accountSeed), undefined, 'sr25519');
    } else if (accountUri) {
      newPair = keyring.addFromUri(accountUri);
    } else if (accountMnemonic) {
      newPair = keyring.addFromMnemonic(accountMnemonic);
    } else if (pair) {
      /*
       * NOTE @monitz87: the only way to avoid this assertion is to import the Keyring package
       *   which doesn't make sense just for this
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      newPair = keyring.addPair(pair as any);
    } else {
      return;
    }

    return newPair;
  }

  /**
   * Set a pair as the current Account keyring pair
   */
  public setPair(address: string): void {
    const { keyring } = this;

    let newCurrentPair;

    try {
      assertFormatValid(address, this.ss58Format);
      newCurrentPair = keyring.getPair(address);
    } catch (e) {
      throw new PolymeshError({
        code: ErrorCode.General,
        message: 'The address is not present in the keyring set',
      });
    }

    this.currentPair = newCurrentPair;
  }

  /**
   * Retrieve the account level POLYX balance
   *
   * @note can be subscribed to
   */
  public accountBalance(account?: string | Account): Promise<AccountBalance>;
  public accountBalance(
    account: string | Account | undefined,
    callback: SubCallback<AccountBalance>
  ): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async accountBalance(
    account?: string | Account,
    callback?: SubCallback<AccountBalance>
  ): Promise<AccountBalance | UnsubCallback> {
    const {
      polymeshApi: {
        query: { system },
      },
    } = this;
    let address: string;

    if (account) {
      address = signerToString(account);
    } else {
      ({ address } = this.getCurrentAccount());
    }

    const rawAddress = stringToAccountId(address, this);

    const assembleResult = ({
      data: { free: rawFree, miscFrozen, feeFrozen, reserved: rawReserved },
    }: AccountInfo): AccountBalance => {
      /*
       * The chain's "free" balance is the balance that isn't locked. Here we calculate it so
       * the free balance is what the Account is able to spend
       */
      const reserved = balanceToBigNumber(rawReserved);
      const total = balanceToBigNumber(rawFree).plus(reserved);
      const locked = BigNumber.max(balanceToBigNumber(miscFrozen), balanceToBigNumber(feeFrozen));
      return {
        total,
        locked,
        free: total.minus(locked).minus(reserved),
      };
    };

    if (callback) {
      return system.account(rawAddress, info => {
        callback(assembleResult(info));
      });
    }

    const accountInfo = await system.account(rawAddress);

    return assembleResult(accountInfo);
  }

  /**
   * Retrieve the account level subsidizer relationship. If there is no such relationship, return null
   *
   * @note can be subscribed to
   */
  public accountSubsidy(account?: string | Account): Promise<Omit<Subsidy, 'beneficiary'> | null>;
  public accountSubsidy(
    account: string | Account | undefined,
    callback: SubCallback<Omit<Subsidy, 'beneficiary'> | null>
  ): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async accountSubsidy(
    account?: string | Account,
    callback?: SubCallback<Omit<Subsidy, 'beneficiary'> | null>
  ): Promise<Omit<Subsidy, 'beneficiary'> | null | UnsubCallback> {
    const {
      polymeshApi: {
        query: { relayer },
      },
    } = this;
    let address: string;

    if (account) {
      address = signerToString(account);
    } else {
      ({ address } = this.getCurrentAccount());
    }

    const rawAddress = stringToAccountId(address, this);

    const assembleResult = (subsidy: Option<MeshSubsidy>): Omit<Subsidy, 'beneficiary'> | null => {
      if (subsidy.isNone) {
        return null;
      }
      const { paying_key: payingKey, remaining } = subsidy.unwrap();
      const allowance = balanceToBigNumber(remaining);
      const subsidizer = new Account({ address: accountIdToString(payingKey) }, this);

      return {
        allowance,
        subsidizer,
      };
    };

    if (callback) {
      return relayer.subsidies(rawAddress, subsidy => {
        callback(assembleResult(subsidy));
      });
    }

    const subsidies = await relayer.subsidies(rawAddress);

    return assembleResult(subsidies);
  }

  /**
   * Retrieve current Account
   *
   * @throws if there is no current Account associated to the SDK instance
   */
  public getCurrentAccount(): Account {
    const { address } = this.getCurrentPair();

    return new Account({ address }, this);
  }

  /**
   * Retrieve current Identity
   *
   * @throws if there is no Identity associated to the current Account (or there is no current Account associated to the SDK instance)
   */
  public async getCurrentIdentity(): Promise<Identity> {
    const account = this.getCurrentAccount();

    const identity = await account.getIdentity();

    if (identity === null) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The current Account does not have an associated Identity',
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
        code: ErrorCode.General,
        message: 'There is no Account associated with the current SDK instance',
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
    const {
      polymeshApi: {
        query: { identity },
      },
    } = this;

    const dids = identities.map(signerToString);
    const rawIdentities = dids.map(did => stringToIdentityId(did, this));
    const records = await identity.didRecords.multi<QueryReturnType<typeof identity.didRecords>>(
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
   * Returns an Identity when given a did string
   *
   * @throws if the Identity does not exist
   */
  public async getIdentity(identity: Identity | string): Promise<Identity> {
    let id;
    if (typeof identity === 'string') {
      id = new Identity({ did: identity }, this);
    } else {
      id = identity;
    }
    const exists = await id.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The Identity does not exist',
      });
    }

    return id;
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
   * @hidden
   */
  public async getDividendDistributionsForTokens(args: {
    tokens: SecurityToken[];
  }): Promise<DistributionWithDetails[]> {
    const {
      polymeshApi: {
        query: { corporateAction: corporateActionQuery, capitalDistribution },
      },
    } = this;
    const { tokens } = args;
    const distributionsMultiParams: CAId[] = [];
    const corporateActionParams: CorporateActionParams[] = [];
    const corporateActionIds: BigNumber[] = [];
    const tickers: string[] = [];

    const tokenChunks = chunk(tokens, MAX_CONCURRENT_REQUESTS);

    await P.each(tokenChunks, async tokenChunk => {
      const corporateActions = await Promise.all(
        tokenChunk.map(({ ticker }) =>
          corporateActionQuery.corporateActions.entries(stringToTicker(ticker, this))
        )
      );
      const eligibleCas = flatten(corporateActions).filter(([, action]) => {
        const kind = action.unwrap().kind;

        return kind.isUnpredictableBenefit || kind.isPredictableBenefit;
      });

      const corporateActionData = await P.map(
        eligibleCas,
        async ([
          {
            args: [rawTicker, rawId],
          },
          corporateAction,
        ]) => {
          const localId = u32ToBigNumber(rawId);
          const ticker = tickerToString(rawTicker);
          const caId = corporateActionIdentifierToCaId({ ticker, localId }, this);
          const details = await corporateActionQuery.details(caId);
          const action = corporateAction.unwrap();

          return {
            ticker,
            localId,
            caId,
            corporateAction: meshCorporateActionToCorporateActionParams(action, details, this),
          };
        }
      );

      corporateActionData.forEach(({ ticker, localId, caId, corporateAction }) => {
        tickers.push(ticker);
        corporateActionIds.push(localId);
        distributionsMultiParams.push(caId);
        corporateActionParams.push(corporateAction);
      });
    });

    /*
     * Divide the requests to account for practical limits
     */
    const paramChunks = chunk(distributionsMultiParams, MAX_PAGE_SIZE);
    const requestChunks = chunk(paramChunks, MAX_CONCURRENT_REQUESTS);
    const distributions = await P.mapSeries(requestChunks, requestChunk =>
      Promise.all(
        requestChunk.map(paramChunk =>
          capitalDistribution.distributions.multi<
            QueryReturnType<typeof capitalDistribution.distributions>
          >(paramChunk)
        )
      )
    );

    const result: DistributionWithDetails[] = [];

    flattenDeep<Option<Distribution>>(distributions).forEach((distribution, index) => {
      if (distribution.isNone) {
        return;
      }

      const dist = distribution.unwrap();

      const { reclaimed, remaining } = dist;

      result.push({
        distribution: new DividendDistribution(
          {
            ticker: tickers[index],
            id: corporateActionIds[index],
            ...corporateActionParams[index],
            ...distributionToDividendDistributionParams(dist, this),
          },
          this
        ),
        details: {
          remainingFunds: balanceToBigNumber(remaining),
          fundsReclaimed: boolToBoolean(reclaimed),
        },
      });
    });

    return result;
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
          // eslint-disable-next-line @typescript-eslint/naming-convention
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
    claimTypes?: Exclude<ClaimType, ClaimType.InvestorUniquenessV2>[];
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
          targetDID: target,
          issuer,
          issuance_date: issuanceDate,
          expiry,
          type,
          jurisdiction,
          scope,
          cdd_id: cddId,
        }) => {
          data.push({
            target: new Identity({ did: target }, this),
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
      claimTypes?: Exclude<ClaimType, ClaimType.InvestorUniquenessV2>[];
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
        code: ErrorCode.MiddlewareError,
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
    const { _middlewareApi: api } = this;

    if (!api) {
      throw new PolymeshError({
        code: ErrorCode.MiddlewareError,
        message: 'Cannot perform this action without an active middleware connection',
      });
    }

    return api;
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

  /**
   * Retrieve the network version
   */
  public async getNetworkVersion(): Promise<string> {
    const version = await this.polymeshApi.rpc.system.version();

    return textToString(version);
  }

  /**
   * Disconnect the Polkadot API, middleware, and render this instance unusable
   *
   * @note after disconnecting, trying to access any property in this objecct will result
   *   in an error
   */
  public disconnect(): Promise<void> {
    const { polymeshApi } = this;
    let middlewareApi;

    if (this.isMiddlewareEnabled()) {
      ({ middlewareApi } = this);
    }
    this.isDisconnected = true;

    middlewareApi && middlewareApi.stop();

    return polymeshApi.disconnect();
  }

  /**
   * Returns a (shallow) clone of this instance. Useful for providing a separate
   *   Context to Procedures with different signers
   */
  public clone(): Context {
    const cloned = clone(this);
    cloned.polymeshApi = Context.createPolymeshApiProxy(cloned);

    return cloned;
  }
}
