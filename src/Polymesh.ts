/**
 * @packageDocumentation
 * @module polymesh
 */
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Signer as PolkadotSigner } from '@polkadot/api/types';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { HttpLink } from 'apollo-link-http';
import BigNumber from 'bignumber.js';
import { polymesh } from 'polymesh-types/definitions';
import { Ticker, TxTag } from 'polymesh-types/types';

import { Identity, SecurityToken, TickerReservation } from '~/api/entities';
import {
  modifyClaims,
  ModifyClaimsParams,
  removeSigningKeys,
  reserveTicker,
  ReserveTickerParams,
  transferPolyX,
  TransferPolyXParams,
} from '~/api/procedures';
import { PolymeshError, TransactionQueue } from '~/base';
import { Context } from '~/context';
import { didsWithClaims, transactions } from '~/middleware/queries';
import { ClaimTypeEnum, Query, TransactionOrderByInput } from '~/middleware/types';
import {
  AccountBalance,
  ClaimData,
  ClaimType,
  CommonKeyring,
  Ensured,
  ErrorCode,
  ExtrinsicData,
  IdentityWithClaims,
  MiddlewareConfig,
  NetworkProperties,
  ResultSet,
  Signer,
  SubCallback,
  TickerReservationStatus,
  UiKeyring,
  UnsubCallback,
} from '~/types';
import { ClaimOperation } from '~/types/internal';
import {
  addressToKey,
  calculateNextKey,
  extrinsicIdentifierToTxTag,
  moduleAddressToString,
  stringToIdentityId,
  stringToTicker,
  textToString,
  tickerToString,
  toIdentityWithClaimsArray,
  txTagToExtrinsicIdentifier,
  u32ToBigNumber,
  valueToDid,
} from '~/utils';

import { Governance } from './Governance';
import { TREASURY_MODULE_ADDRESS } from './utils/constants';

interface ConnectParamsBase {
  nodeUrl: string;
  signer?: PolkadotSigner;
  middleware?: MiddlewareConfig;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @hidden
 */
function isUiKeyring(keyring: any): keyring is UiKeyring {
  return !!keyring.keyring;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Main entry point of the Polymesh SDK
 */
export class Polymesh {
  private context: Context = {} as Context;

  // Namespaces
  public governance: Governance;

  /**
   * @hidden
   */
  private constructor(context: Context) {
    this.context = context;

    this.governance = new Governance(context);
  }

  /**
   * Create the instance and connect to the Polymesh node
   */
  static async connect(params: ConnectParamsBase & { accountSeed: string }): Promise<Polymesh>;

  static async connect(
    params: ConnectParamsBase & {
      keyring: CommonKeyring | UiKeyring;
    }
  ): Promise<Polymesh>;

  static async connect(params: ConnectParamsBase & { accountUri: string }): Promise<Polymesh>;

  static async connect(params: ConnectParamsBase): Promise<Polymesh>;

  // eslint-disable-next-line require-jsdoc
  static async connect(
    params: ConnectParamsBase & {
      accountSeed?: string;
      keyring?: CommonKeyring | UiKeyring;
      accountUri?: string;
      middleware?: MiddlewareConfig;
    }
  ): Promise<Polymesh> {
    const { nodeUrl, accountSeed, keyring, accountUri, signer, middleware } = params;
    let polymeshApi: ApiPromise;
    let middlewareApi: ApolloClient<NormalizedCacheObject> | null = null;

    try {
      const { types, rpc } = polymesh;

      polymeshApi = await ApiPromise.create({
        provider: new WsProvider(nodeUrl),
        types,
        rpc,
      });

      if (middleware) {
        middlewareApi = new ApolloClient({
          link: setContext((_, { headers }) => {
            return {
              headers: {
                ...headers,
                'x-api-key': middleware.key,
              },
            };
          }).concat(
            ApolloLink.from([
              new HttpLink({
                uri: middleware.link,
              }),
            ])
          ),
          cache: new InMemoryCache(),
          defaultOptions: {
            watchQuery: {
              fetchPolicy: 'no-cache',
            },
            query: {
              fetchPolicy: 'no-cache',
            },
          },
        });
      }

      if (signer) {
        polymeshApi.setSigner(signer);
      }

      let context: Context;

      if (accountSeed) {
        context = await Context.create({
          polymeshApi,
          middlewareApi,
          seed: accountSeed,
        });
      } else if (keyring) {
        let keyringInstance: CommonKeyring;
        if (isUiKeyring(keyring)) {
          keyringInstance = keyring.keyring;
        } else {
          keyringInstance = keyring;
        }
        context = await Context.create({
          polymeshApi,
          middlewareApi,
          keyring: keyringInstance,
        });
      } else if (accountUri) {
        context = await Context.create({
          polymeshApi,
          middlewareApi,
          uri: accountUri,
        });
      } else {
        context = await Context.create({
          polymeshApi,
          middlewareApi,
        });
      }

      return new Polymesh(context);
    } catch (e) {
      const { message, code } = e;
      throw new PolymeshError({
        code,
        message: `Error while connecting to "${nodeUrl}": "${message ||
          'The node couldn’t be reached'}"`,
      });
    }
  }

  /**
   * Transfer an amount of POLYX to a specified account
   *
   * @param args.to - account id that will receive the POLYX
   * @param args.amount - amount of POLYX to be transferred
   */
  public transferPolyX(args: TransferPolyXParams): Promise<TransactionQueue<void>> {
    return transferPolyX.prepare(args, this.context);
  }

  /**
   * Get the free/locked POLYX balance of an account
   *
   * @param args.accountId - defaults to the current account
   *
   * @note can be subscribed to
   */
  public getAccountBalance(args?: { accountId: string }): Promise<AccountBalance>;
  public getAccountBalance(callback: SubCallback<AccountBalance>): Promise<UnsubCallback>;
  public getAccountBalance(
    args: { accountId: string },
    callback: SubCallback<AccountBalance>
  ): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public getAccountBalance(
    args?: { accountId: string } | SubCallback<AccountBalance>,
    callback?: SubCallback<AccountBalance>
  ): Promise<AccountBalance | UnsubCallback> {
    const { context } = this;
    let accountId: string | undefined;
    let cb: SubCallback<AccountBalance> | undefined = callback;

    switch (typeof args) {
      case 'undefined': {
        break;
      }
      case 'function': {
        cb = args;
        break;
      }
      default: {
        ({ accountId } = args);
        break;
      }
    }

    if (cb) {
      return context.accountBalance(accountId, cb);
    }

    return context.accountBalance(accountId);
  }

  /**
   * Reserve a ticker symbol to later use in the creation of a Security Token.
   * The ticker will expire after a set amount of time, after which other users can reserve it
   *
   * @param args.ticker - ticker symbol to reserve
   */
  public reserveTicker(args: ReserveTickerParams): Promise<TransactionQueue<TickerReservation>> {
    return reserveTicker.prepare(args, this.context);
  }

  /**
   * Check if a ticker hasn't been reserved
   *
   * @note can be subscribed to
   */
  public isTickerAvailable(args: { ticker: string }): Promise<boolean>;
  public isTickerAvailable(
    args: { ticker: string },
    callback: SubCallback<boolean>
  ): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async isTickerAvailable(
    args: { ticker: string },
    callback?: SubCallback<boolean>
  ): Promise<boolean | UnsubCallback> {
    const reservation = new TickerReservation(args, this.context);

    if (callback) {
      return reservation.details(({ status: reservationStatus }) => {
        // eslint-disable-next-line standard/no-callback-literal
        callback(reservationStatus === TickerReservationStatus.Free);
      });
    }
    const { status } = await reservation.details();

    return status === TickerReservationStatus.Free;
  }

  /**
   * Retrieve all the ticker reservations currently owned by an identity. This doesn't include tokens that
   *   have already been launched
   *
   * @param args.did - identity representation or identity ID as stored in the blockchain
   */
  public async getTickerReservations(args?: {
    did: string | Identity;
  }): Promise<TickerReservation[]> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
    } = this;

    let identity: string;

    if (args) {
      identity = valueToDid(args.did);
    } else {
      identity = context.getCurrentIdentity().did;
    }

    const entries = await query.asset.assetOwnershipRelations.entries(
      stringToIdentityId(identity, context)
    );

    const tickerReservations: TickerReservation[] = entries
      .filter(([, relation]) => relation.isTickerOwned)
      .map(([key]) => {
        const ticker = tickerToString(key.args[1] as Ticker);

        return new TickerReservation({ ticker }, context);
      });

    return tickerReservations;
  }

  /**
   * Retrieve a Ticker Reservation
   *
   * @param args.ticker - Security Token ticker
   */
  public async getTickerReservation(args: { ticker: string }): Promise<TickerReservation> {
    const { ticker } = args;
    const {
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      context,
    } = this;

    const tickerReservation = await asset.tickers(stringToTicker(ticker, context));

    if (!tickerReservation.owner.isEmpty) {
      return new TickerReservation({ ticker }, context);
    }

    throw new PolymeshError({
      code: ErrorCode.FatalError,
      message: `There is no reservation for ${ticker} ticker`,
    });
  }

  /**
   * Create an identity instance from a DID. If no DID is passed, the current identity is returned
   */
  public getIdentity(args?: { did: string }): Identity {
    if (args) {
      return new Identity(args, this.context);
    }
    return this.context.getCurrentIdentity();
  }

  /**
   * Return whether the supplied identity/DID exists
   */
  public async isIdentityValid(args: { identity: Identity | string }): Promise<boolean> {
    const invalid = await this.context.getInvalidDids([valueToDid(args.identity)]);

    return !invalid.length;
  }

  /**
   * Retrieve the protocol fees associated with running a specific transaction
   *
   * @param args.tag - transaction tag (i.e. TxTags.asset.CreateAsset or "asset.createAsset")
   */
  public getTransactionFees(args: { tag: TxTag }): Promise<BigNumber> {
    return this.context.getTransactionFees(args.tag);
  }

  /**
   * Get the treasury wallet address
   */
  public getTreasuryAddress(): string {
    return moduleAddressToString(TREASURY_MODULE_ADDRESS);
  }

  /**
   * Add claims to identities
   *
   * @param args.claims - array of claims to be added
   */
  public addClaims(args: Omit<ModifyClaimsParams, 'operation'>): Promise<TransactionQueue<void>> {
    return modifyClaims.prepare({ ...args, operation: ClaimOperation.Add }, this.context);
  }

  /**
   * Edit claims associated to identities (only the expiry date can be modified)
   *
   * * @param args.claims - array of claims to be edited
   */
  public editClaims(args: Omit<ModifyClaimsParams, 'operation'>): Promise<TransactionQueue<void>> {
    return modifyClaims.prepare({ ...args, operation: ClaimOperation.Edit }, this.context);
  }

  /**
   * Revoke claims from identities
   *
   * @param args.claims - array of claims to be revoked
   */
  public revokeClaims(
    args: Omit<ModifyClaimsParams, 'operation'>
  ): Promise<TransactionQueue<void>> {
    return modifyClaims.prepare({ ...args, operation: ClaimOperation.Revoke }, this.context);
  }

  /**
   * Handle connection errors
   *
   * @returns an unsubscribe callback
   */
  public onConnectionError(callback: (...args: unknown[]) => unknown): () => void {
    const {
      context: { polymeshApi },
    } = this;

    polymeshApi.on('error', callback);

    return (): void => {
      polymeshApi.off('error', callback);
    };
  }

  /**
   * Handle disconnection
   *
   * @returns an unsubscribe callback
   */
  public onDisconnect(callback: (...args: unknown[]) => unknown): () => void {
    const {
      context: { polymeshApi },
    } = this;

    polymeshApi.on('disconnected', callback);

    return (): void => {
      polymeshApi.off('disconnected', callback);
    };
  }

  /**
   * Retrieve all the Security Tokens owned by an identity
   *
   * @param args.did - identity representation or identity ID as stored in the blockchain
   */
  public async getSecurityTokens(args?: { did: string | Identity }): Promise<SecurityToken[]> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
    } = this;

    let identity: string;

    if (args) {
      identity = valueToDid(args.did);
    } else {
      identity = context.getCurrentIdentity().did;
    }

    const entries = await query.asset.assetOwnershipRelations.entries(
      stringToIdentityId(identity, context)
    );

    const securityTokens: SecurityToken[] = entries
      .filter(([, relation]) => relation.isAssetOwned)
      .map(([key]) => {
        const ticker = tickerToString(key.args[1] as Ticker);

        return new SecurityToken({ ticker }, context);
      });

    return securityTokens;
  }

  /**
   * Retrieve a Security Token
   *
   * @param args.ticker - Security Token ticker
   */
  public async getSecurityToken(args: { ticker: string }): Promise<SecurityToken> {
    const { ticker } = args;
    const {
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      context,
    } = this;

    const securityToken = await asset.tokens(stringToTicker(ticker, context));

    if (!securityToken.owner_did.isEmpty) {
      return new SecurityToken({ ticker }, context);
    }

    throw new PolymeshError({
      code: ErrorCode.FatalError,
      message: `There is no Security Token with ticker "${ticker}"`,
    });
  }

  /**
   * Retrieve all claims issued by the current identity
   */
  public async getIssuedClaims(
    opts: {
      size?: number;
      start?: number;
    } = {}
  ): Promise<ResultSet<ClaimData>> {
    const { context } = this;

    const { size, start } = opts;
    const { did } = context.getCurrentIdentity();

    const result = await context.issuedClaims({
      trustedClaimIssuers: [did],
      size,
      start,
    });

    return result;
  }

  /**
   * Retrieve a list of identities with claims associated to them. Can be filtered using parameters
   *
   * @param opts.targets - identities (or identity IDs) for which to fetch claims (targets). Defaults to all targets
   * @param opts.trustedClaimIssuers - identity IDs of claim issuers. Defaults to all claim issuers
   * @param opts.scope - scope of the claims to fetch. Defaults to any scope
   * @param opts.claimTypes - types of the claims to fetch. Defaults to any type
   * @param opts.size - page size
   * @param opts.start - page offset
   */
  public async getIdentitiesWithClaims(
    opts: {
      targets?: (string | Identity)[];
      trustedClaimIssuers?: (string | Identity)[];
      scope?: string;
      claimTypes?: ClaimType[];
      size?: number;
      start?: number;
    } = {}
  ): Promise<ResultSet<IdentityWithClaims>> {
    const { context } = this;

    const { targets, trustedClaimIssuers, scope, claimTypes, size, start } = opts;

    const result = await context.queryMiddleware<Ensured<Query, 'didsWithClaims'>>(
      didsWithClaims({
        dids: targets?.map(target => valueToDid(target)),
        scope,
        trustedClaimIssuers: trustedClaimIssuers?.map(trustedClaimIssuer =>
          valueToDid(trustedClaimIssuer)
        ),
        claimTypes: claimTypes?.map(ct => ClaimTypeEnum[ct]),
        count: size,
        skip: start,
      })
    );

    const {
      data: {
        didsWithClaims: { items: didsWithClaimsList, totalCount: count },
      },
    } = result;

    const data = toIdentityWithClaimsArray(didsWithClaimsList, context);

    const next = calculateNextKey(count, size, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Retrieve information for the current network
   */
  public async getNetworkProperties(): Promise<NetworkProperties> {
    const {
      context: {
        polymeshApi: {
          runtimeVersion: { specVersion },
          rpc: {
            system: { chain },
          },
        },
      },
    } = this;
    const name = await chain();

    return {
      name: textToString(name),
      version: u32ToBigNumber(specVersion).toNumber(),
    };
  }

  /**
   * Retrieve a list of transactions. Can be filtered using parameters
   *
   * @param filters.address - account that signed the transaction
   * @param filters.tag - tag associated with the transaction
   * @param filters.success - whether the transaction was successful or not
   * @param filters.size - page size
   * @param filters.start - page offset
   */
  public async getTransactionHistory(
    filters: {
      blockId?: number;
      address?: string;
      tag?: TxTag;
      success?: boolean;
      size?: number;
      start?: number;
      orderBy?: TransactionOrderByInput;
    } = {}
  ): Promise<ResultSet<ExtrinsicData>> {
    const { context } = this;

    const { blockId, address, tag, success, size, start, orderBy } = filters;

    let moduleId;
    let callId;
    if (tag) {
      ({ moduleId, callId } = txTagToExtrinsicIdentifier(tag));
    }

    /* eslint-disable @typescript-eslint/camelcase */
    const result = await context.queryMiddleware<Ensured<Query, 'transactions'>>(
      transactions({
        block_id: blockId,
        address: address ? addressToKey(address) : undefined,
        module_id: moduleId,
        call_id: callId,
        success,
        count: size,
        skip: start,
        orderBy,
      })
    );

    const {
      data: {
        transactions: { items: transactionList, totalCount: count },
      },
    } = result;

    const data: ExtrinsicData[] = [];

    transactionList.forEach(
      ({
        block_id,
        extrinsic_idx,
        address: rawAddress,
        nonce,
        module_id,
        call_id,
        params,
        success: txSuccess,
        spec_version_id,
        extrinsic_hash,
      }) => {
        // TODO remove null check once types fixed
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        data.push({
          blockId: block_id!,
          extrinsicIdx: extrinsic_idx!,
          address: rawAddress ?? null,
          nonce: nonce!,
          txTag: extrinsicIdentifierToTxTag({ moduleId: module_id!, callId: call_id! }),
          params,
          success: !!txSuccess,
          specVersionId: spec_version_id!,
          extrinsicHash: extrinsic_hash!,
        });
        /* eslint-enabled @typescript-eslint/no-non-null-assertion */
      }
    );
    /* eslint-enable @typescript-eslint/camelcase */

    const next = calculateNextKey(count, size, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Get the Treasury POLYX balance
   *
   * @note can be subscribed to
   */
  public getTreasuryBalance(): Promise<BigNumber>;
  public getTreasuryBalance(callback: SubCallback<BigNumber>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getTreasuryBalance(
    callback?: SubCallback<BigNumber>
  ): Promise<BigNumber | UnsubCallback> {
    const accountId = this.getTreasuryAddress();

    if (callback) {
      return this.context.accountBalance(accountId, ({ free: freeBalance }) => {
        callback(freeBalance);
      });
    }

    const { free } = await this.getAccountBalance({ accountId });
    return free;
  }

  /**
   * Get the list of signing keys related to the current identity
   *
   * @note can be subscribed to
   */
  public async getMySigningKeys(): Promise<Signer[]>;
  public async getMySigningKeys(callback: SubCallback<Signer[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getMySigningKeys(
    callback?: SubCallback<Signer[]>
  ): Promise<Signer[] | UnsubCallback> {
    const { context } = this;

    if (callback) {
      return context.getSigningKeys(callback);
    }

    return context.getSigningKeys();
  }

  /**
   * Remove a list of signing keys associated with the current identity
   */
  public removeMySigningKeys(args: { signers: Signer[] }): Promise<TransactionQueue<void>> {
    return removeSigningKeys.prepare(args, this.context);
  }

  // TODO @monitz87: remove when the dApp team no longer needs it
  /* istanbul ignore next: only for testing purposes */
  /**
   * Polkadot client
   */
  public get _polkadotApi(): ApiPromise {
    return this.context.polymeshApi;
  }
}
