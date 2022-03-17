import { ApiPromise, WsProvider } from '@polkadot/api';
import { SigningManager } from '@polymathnetwork/signing-manager-types';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { HttpLink } from 'apollo-link-http';
import fetch from 'cross-fetch';
import schema from 'polymesh-types/schema';
import { satisfies } from 'semver';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import WebSocketAsPromised from 'websocket-as-promised';

import { AccountManagement } from '~/AccountManagement';
import { Assets } from '~/Assets';
import { Identities } from '~/Identities';
import { Account, Context, Identity, PolymeshError } from '~/internal';
import { heartbeat } from '~/middleware/queries';
import { Settlements } from '~/Settlements';
import { ErrorCode, MiddlewareConfig } from '~/types';
import { SUPPORTED_VERSION_RANGE, SYSTEM_VERSION_RPC_CALL } from '~/utils/constants';
import { signerToString } from '~/utils/conversion';

import { Claims } from './Claims';
import { Network } from './Network';

interface ConnectParams {
  nodeUrl: string;
  signingManager?: SigningManager;
  middleware?: MiddlewareConfig;
  middlewareV2?: MiddlewareConfig;
  middlewareDiffLogger?: (error: string) => void;
}

/**
 * @hidden
 */
function createMiddlewareApi(middleware: MiddlewareConfig) {
  return new ApolloClient({
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

/**
 * Main entry point of the Polymesh SDK
 */
export class Polymesh {
  private context: Context = {} as Context;

  // Namespaces

  /**
   * A set of methods to deal with Claims
   */
  public claims: Claims;
  /**
   * A set of methods to interact with the Polymesh network. This includes transferring POLYX, reading network properties and querying for historical events
   */
  public network: Network;
  /**
   * A set of methods for exchanging Assets
   */
  public settlements: Settlements;
  /**
   * A set of methods for managing a Polymesh Identity's Accounts and their permissions
   */
  public accountManagement: AccountManagement;
  /**
   * A set of methods for interacting with Polymesh Identities.
   */
  public identities: Identities;
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
    this.network = new Network(context);
    this.settlements = new Settlements(context);
    this.accountManagement = new AccountManagement(context);
    this.identities = new Identities(context);
    this.assets = new Assets(context);
  }

  /**
   * Create an SDK instance and connect to a Polymesh node
   *
   * @param params.nodeUrl - URL of the Polymesh node this instance will be connecting to
   * @param params.signingManager - object in charge of managing keys and signing transactions
   *   (optional, if not passed the SDK will not be able to submit transactions). Can be set later with
   *   `setSigningManager`
   * @param params.middleware - middleware API URL and key (optional, used for historic queries)
   */
  static async connect(params: ConnectParams): Promise<Polymesh> {
    const { nodeUrl, signingManager, middleware, middlewareV2, middlewareDiffLogger } = params;
    let context: Context;

    /* istanbul ignore next: part of configuration, doesn't need to be tested */
    const wsp = new WebSocketAsPromised(nodeUrl, {
      createWebSocket: url => new W3CWebSocket(url) as unknown as WebSocket,
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

      const middlewareApi = middleware ? createMiddlewareApi(middleware) : null;
      const middlewareV2Api = middlewareV2 ? createMiddlewareApi(middlewareV2) : null;

      context = await Context.create({
        polymeshApi,
        middlewareApi,
        signingManager,
        middlewareV2Api,
        middlewareDiffLogger,
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
   * Retrieve the Identity associated to the signing Account (null if there is none)
   *
   * @throws if there is no signing Account associated to the SDK
   */
  public getSigningIdentity(): Promise<Identity | null> {
    return this.context.getSigningAccount().getIdentity();
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
   * Disconnect the client and close all open connections and subscriptions
   *
   * @note the SDK will become unusable after this operation. It will throw an error when attempting to
   *   access any chain or middleware data. If you wish to continue using the SDK, you must
   *   create a new instance by calling {@link connect}
   */
  public disconnect(): Promise<void> {
    return this.context.disconnect();
  }

  /**
   * Set the SDK's signing Account to the provided one
   *
   * @throws if the passed Account is not present in the Signing Manager (or there is no Signing Manager)
   */
  public async setSigningAccount(signer: string | Account): Promise<void> {
    return this.context.setSigningAddress(signerToString(signer));
  }

  /**
   * Set the SDK's Signing Manager to the provided one
   */
  public setSigningManager(signingManager: SigningManager): Promise<void> {
    return this.context.setSigningManager(signingManager);
  }

  /* eslint-disable @typescript-eslint/naming-convention */
  /* istanbul ignore next: not part of the official public API */
  /**
   * Polkadot client
   */
  public get _polkadotApi(): ApiPromise {
    return this.context.polymeshApi;
  }

  /* istanbul ignore next: not part of the official public API */
  /**
   * signing address (to manually submit transactions with the polkadot API)
   */
  public get _signingAddress(): string {
    return this.context.getSigningAddress();
  }

  /* istanbul ignore next: not part of the official public API */
  /**
   * Middleware client
   */
  public get _middlewareApi(): ApolloClient<NormalizedCacheObject> {
    return this.context.middlewareApi;
  }
  /* eslint-enable @typescript-eslint/naming-convention */
}
