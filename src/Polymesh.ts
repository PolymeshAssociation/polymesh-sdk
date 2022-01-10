import { ApiPromise, WsProvider } from '@polkadot/api';
import { Signer as PolkadotSigner } from '@polkadot/api/types';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { HttpLink } from 'apollo-link-http';
import BigNumber from 'bignumber.js';
import fetch from 'cross-fetch';
import schema from 'polymesh-types/schema';
import { TxTag } from 'polymesh-types/types';
import { satisfies } from 'semver';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import WebSocketAsPromised from 'websocket-as-promised';

import { Assets } from '~/Assets';
import {
  Account,
  Context,
  Identity,
  PolymeshError,
  registerIdentity,
  RegisterIdentityParams,
  transferPolyx,
  TransferPolyxParams,
} from '~/internal';
import { heartbeat } from '~/middleware/queries';
import { Settlements } from '~/Settlements';
import {
  AccountBalance,
  CommonKeyring,
  ErrorCode,
  MiddlewareConfig,
  NetworkProperties,
  ProcedureMethod,
  SubCallback,
  UiKeyring,
  UnsubCallback,
} from '~/types';
import {
  moduleAddressToString,
  signerToString,
  textToString,
  u32ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

import { Claims } from './Claims';
import { CurrentIdentity } from './CurrentIdentity';
import { Middleware } from './Middleware';
import {
  SUPPORTED_VERSION_RANGE,
  SYSTEM_VERSION_RPC_CALL,
  TREASURY_MODULE_ADDRESS,
} from './utils/constants';

interface ConnectParamsBase {
  nodeUrl: string;
  signer?: PolkadotSigner;
  middleware?: MiddlewareConfig;
}

/**
 * Main entry point of the Polymesh SDK
 */
export class Polymesh {
  private context: Context = {} as Context;

  // Namespaces

  public claims: Claims;
  public middleware: Middleware;

  /**
   * A set of methods for exchanging Assets
   */
  public settlements: Settlements;
  public currentIdentity: CurrentIdentity;
  /**
   * A set of methods for interacting with Assets
   */
  public assets: Assets;

  /**
   * @hidden
   */
  private constructor(context: Context) {
    this.context = context;

    this.claims = new Claims(context);
    this.middleware = new Middleware(context);
    this.settlements = new Settlements(context);
    this.currentIdentity = new CurrentIdentity(context);
    this.assets = new Assets(context);

    this.transferPolyx = createProcedureMethod(
      { getProcedureAndArgs: args => [transferPolyx, args] },
      context
    );

    this.registerIdentity = createProcedureMethod(
      { getProcedureAndArgs: args => [registerIdentity, args] },
      context
    );
  }

  /**
   * Create the instance and connect to the Polymesh node using an account seed
   *
   * @param params.nodeUrl - URL of the Polymesh node this instance will be connecting to
   * @param params.signer - injected signer object (optional, only relevant if using a wallet browser extension)
   * @param params.middleware - middleware API URL and key (optional, used for historic queries)
   * @param params.accountSeed - hex seed of the account
   */
  static async connect(params: ConnectParamsBase & { accountSeed: string }): Promise<Polymesh>;

  /**
   * Create the instance and connect to the Polymesh node using a keyring
   *
   * @param params.nodeUrl - URL of the Polymesh node this instance will be connecting to
   * @param params.signer - injected signer object (optional, only relevant if using a wallet browser extension)
   * @param params.middleware - middleware API URL and key (optional, used for historic queries)
   * @param params.keyring - object that holds several accounts (useful when using a wallet browser extension)
   */
  static async connect(
    params: ConnectParamsBase & {
      keyring: CommonKeyring | UiKeyring;
    }
  ): Promise<Polymesh>;

  /**
   * Create the instance and connect to the Polymesh node using an account URI
   *
   * @param params.nodeUrl - URL of the Polymesh node this instance will be connecting to
   * @param params.signer - injected signer object (optional, only relevant if using a wallet browser extension)
   * @param params.middleware - middleware API URL and key (optional, used for historic queries)
   */
  static async connect(params: ConnectParamsBase & { accountUri: string }): Promise<Polymesh>;

  /**
   * Create the instance and connect to the Polymesh node using an account mnemonic
   *
   * @param params.nodeUrl - URL of the Polymesh node this instance will be connecting to
   * @param params.signer - injected signer object (optional, only relevant if using a wallet browser extension)
   * @param params.middleware - middleware API URL and key (optional, used for historic queries)
   * @param params.accountMnemonic - account mnemonic
   */
  static async connect(params: ConnectParamsBase & { accountMnemonic: string }): Promise<Polymesh>;

  /**
   * Create the instance and connect to the Polymesh node without an account
   *
   * @param params.nodeUrl - URL of the Polymesh node this instance will be connecting to
   * @param params.signer - injected signer object (optional, only relevant if using a wallet browser extension)
   * @param params.middleware - middleware API URL and key (optional, used for historic queries)
   */
  static async connect(params: ConnectParamsBase): Promise<Polymesh>;

  // eslint-disable-next-line require-jsdoc
  static async connect(
    params: ConnectParamsBase & {
      accountSeed?: string;
      keyring?: CommonKeyring | UiKeyring;
      accountUri?: string;
      accountMnemonic?: string;
      middleware?: MiddlewareConfig;
    }
  ): Promise<Polymesh> {
    const {
      nodeUrl,
      accountSeed,
      keyring,
      accountUri,
      accountMnemonic,
      signer,
      middleware,
    } = params;
    let context: Context;

    /* istanbul ignore next: part of configuration, doesn't need to be tested */
    const wsp = new WebSocketAsPromised(nodeUrl, {
      createWebSocket: url => (new W3CWebSocket(url) as unknown) as WebSocket,
      packMessage: data => JSON.stringify(data),
      unpackMessage: data => JSON.parse(data.toString()),
      attachRequestId: (data, requestId) => Object.assign({ id: requestId }, data),
      extractRequestId: data => data && data.id,
    });

    await wsp.open();

    const { result: version } = await wsp.sendRequest(SYSTEM_VERSION_RPC_CALL);

    if (!satisfies(version, SUPPORTED_VERSION_RANGE)) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'Unsupported Polymesh version. Please upgrade the SDK',
        data: {
          polymeshVersion: version,
          supportedVersionRange: SUPPORTED_VERSION_RANGE,
        },
      });
    }

    await wsp.close();

    try {
      const { types, rpc } = schema;

      const polymeshApi = await ApiPromise.create({
        provider: new WsProvider(nodeUrl),
        types,
        rpc,
      });

      let middlewareApi: ApolloClient<NormalizedCacheObject> | null = null;

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
                fetch,
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

      context = await Context.create({
        polymeshApi,
        middlewareApi,
        accountSeed,
        accountUri,
        accountMnemonic,
        keyring,
      });
    } catch (err) {
      const { message, code } = err;
      throw new PolymeshError({
        code,
        message: `Error while connecting to "${nodeUrl}": "${
          message || 'The node couldn’t be reached'
        }"`,
      });
    }

    if (middleware) {
      try {
        await context.queryMiddleware(heartbeat());
      } catch (err) {
        if (
          err.message.indexOf('Forbidden') > -1 ||
          err.message.indexOf('Missing Authentication Token') > -1
        ) {
          throw new PolymeshError({
            code: ErrorCode.FatalError,
            message: 'Incorrect middleware URL or API key',
          });
        }
      }
    }

    return new Polymesh(context);
  }

  /**
   * Transfer an amount of POLYX to a specified Account
   */
  public transferPolyx: ProcedureMethod<TransferPolyxParams, void>;

  /**
   * Get the free/locked POLYX balance of an Account
   *
   * @param args.account - defaults to the current Account
   *
   * @note can be subscribed to
   */
  public getAccountBalance(args?: { account: string | Account }): Promise<AccountBalance>;
  public getAccountBalance(callback: SubCallback<AccountBalance>): Promise<UnsubCallback>;
  public getAccountBalance(
    args: { account: string | Account },
    callback: SubCallback<AccountBalance>
  ): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public getAccountBalance(
    args?: { account: string | Account } | SubCallback<AccountBalance>,
    callback?: SubCallback<AccountBalance>
  ): Promise<AccountBalance | UnsubCallback> {
    const { context } = this;
    let account: string | Account | undefined;
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
        ({ account } = args);
        break;
      }
    }

    if (!account) {
      account = context.getCurrentAccount();
    } else if (typeof account === 'string') {
      account = new Account({ address: account }, context);
    }

    if (cb) {
      return account.getBalance(cb);
    }

    return account.getBalance();
  }

  /**
   * Create an Identity instance from a DID
   *
   * @throws if there is no Identity with the passed DID
   */
  public async getIdentity(args: { did: string }): Promise<Identity> {
    return this.context.getIdentity(args.did);
  }

  /**
   * Retrieve the Identity associated to the current Account (null if there is none)
   */
  public getCurrentIdentity(): Promise<Identity | null> {
    return this.context.getCurrentAccount().getIdentity();
  }

  /**
   * Create an Account instance from an address. If no address is passed, the current Account is returned
   */
  public getAccount(args?: { address: string }): Account {
    const { context } = this;

    if (args) {
      return new Account(args, context);
    }

    return context.getCurrentAccount();
  }

  /**
   * Return a list that contains all the signing Accounts associated to the SDK instance
   *
   * @throws — if there is no current Account associated to the SDK instance
   */
  public getAccounts(): Account[] {
    return this.context.getAccounts();
  }

  /**
   * Return whether the supplied Identity/DID exists
   */
  public async isIdentityValid(args: { identity: Identity | string }): Promise<boolean> {
    const { identity: did } = args;
    const identity = did instanceof Identity ? did : new Identity({ did }, this.context);

    return identity.exists();
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
  public getTreasuryAccount(): Account {
    const { context } = this;
    return new Account(
      { address: moduleAddressToString(TREASURY_MODULE_ADDRESS, context) },
      context
    );
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
    const account = this.getTreasuryAccount();

    if (callback) {
      return account.getBalance(({ free: freeBalance }) => {
        callback(freeBalance);
      });
    }

    const { free } = await account.getBalance();
    return free;
  }

  /**
   * Register an Identity
   *
   * @note must be a CDD provider
   * @note this may create [[AuthorizationRequest | Authorization Requests]] which have to be accepted by
   *   the corresponding [[Account | Accounts]] and/or [[Identity | Identities]]. An Account or Identity can
   *   fetch its pending Authorization Requests by calling `authorizations.getReceived`
   *
   * @note required role:
   *   - Customer Due Diligence Provider
   */
  public registerIdentity: ProcedureMethod<RegisterIdentityParams, Identity>;

  /**
   * Retrieve the number of the latest block in the chain
   */
  public getLatestBlock(): Promise<BigNumber> {
    return this.context.getLatestBlock();
  }

  /**
   * Disconnect the client and close all open connections and subscriptions
   *
   * @note the SDK will become unusable after this operation. It will throw an error when attempting to
   *   access any chain or middleware data. If you wish to continue using the SDK, you must
   *   create a new instance by calling [[connect]]
   */
  public disconnect(): Promise<void> {
    return this.context.disconnect();
  }

  /**
   * Adds a new signing key to the SDK instance. This will not change the current signer. For that,
   *   you must explicitly call `setSigner`
   *
   * @param params.accountSeed - hex seed of the account
   */
  public addSigner(params: { accountSeed: string }): Account;

  /**
   * Adds a new signing key to the SDK instance. This will not change the current signer. For that,
   *   you must explicitly call `setSigner`
   *
   * @param params.accountMnemonic - account mnemonic
   */
  public addSigner(params: { accountMnemonic: string }): Account;

  /**
   * Adds a new signing key to the SDK instance. This will not change the current signer. For that,
   *   you must explicitly call [[setSigner]]
   *
   * @param params.accountUri - account URI
   */
  public addSigner(params: { accountUri: string }): Account;

  // eslint-disable-next-line require-jsdoc
  public addSigner(params: {
    accountSeed?: string;
    accountUri?: string;
    accountMnemonic?: string;
  }): Account {
    const { context } = this;
    const { address } = this.context.addPair(params);

    return new Account({ address }, context);
  }

  /**
   * Set the SDK's current signing key to the provided address
   *
   * @note the key must have been previously added via [[addSigner]]
   */
  public setSigner(signer: string | Account): void {
    this.context.setPair(signerToString(signer));
  }

  /**
   * Fetch the current network version (i.e. 3.1.0)
   */
  public async getNetworkVersion(): Promise<string> {
    return this.context.getNetworkVersion();
  }

  // TODO @monitz87: remove when the dApp team no longer needs it
  /* eslint-disable @typescript-eslint/naming-convention */
  /* istanbul ignore next: only for testing purposes */
  /**
   * Polkadot client
   */
  public get _polkadotApi(): ApiPromise {
    return this.context.polymeshApi;
  }

  /* istanbul ignore next: only for testing purposes */
  /**
   * Middleware client
   */
  public get _middlewareApi(): ApolloClient<NormalizedCacheObject> {
    return this.context.middlewareApi;
  }
  /* eslint-enable @typescript-eslint/naming-convention */
}
