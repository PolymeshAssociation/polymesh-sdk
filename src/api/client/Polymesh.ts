import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client/core';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { SigningManager } from '@polymeshassociation/signing-manager-types';
import fetch from 'cross-fetch';
import schema from 'polymesh-types/schema';

import { Account, Context, createTransactionBatch, Identity, PolymeshError } from '~/internal';
import {
  CreateTransactionBatchProcedureMethod,
  ErrorCode,
  MiddlewareConfig,
  PolkadotConfig,
  UnsubCallback,
} from '~/types';
import { signerToString } from '~/utils/conversion';
import {
  assertExpectedChainVersion,
  assertExpectedSqVersion,
  createProcedureMethod,
} from '~/utils/internal';

import { AccountManagement } from './AccountManagement';
import { Assets } from './Assets';
import { Claims } from './Claims';
import { Identities } from './Identities';
import { Network } from './Network';
import { Settlements } from './Settlements';

export interface ConnectParams {
  /**
   * The websocket URL for the Polymesh node to connect to
   */
  nodeUrl: string;
  /**
   * Handles signing of transactions. Required to be set before submitting transactions
   */
  signingManager?: SigningManager;
  /**
   * Allows for historical data to be queried. Required for some methods to work
   */
  middlewareV2?: MiddlewareConfig;
  /**
   * Advanced options that will be used with the underling polkadot.js instance
   */
  polkadot?: PolkadotConfig;
}

/**
 * @hidden
 */
function createMiddlewareApi(
  middleware?: MiddlewareConfig
): ApolloClient<NormalizedCacheObject> | null {
  return middleware
    ? new ApolloClient({
        link: createHttpLink({
          uri: middleware.link,
          fetch,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          headers: { 'x-api-key': middleware.key },
        }),
        cache: new InMemoryCache(),
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'no-cache',
          },
          query: {
            fetchPolicy: 'no-cache',
          },
        },
      })
    : null;
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

    this.createTransactionBatch = createProcedureMethod(
      {
        getProcedureAndArgs: args => [createTransactionBatch, { ...args }],
      },
      context
    ) as CreateTransactionBatchProcedureMethod;
  }

  /**
   * Create an SDK instance and connect to a Polymesh node
   *
   * @param params.nodeUrl - URL of the Polymesh node this instance will be connecting to
   * @param params.signingManager - object in charge of managing keys and signing transactions
   *   (optional, if not passed the SDK will not be able to submit transactions). Can be set later with
   *   `setSigningManager`
   * @param params.middlewareV2 - middleware V2 API URL (optional, used for historic queries)
   * @param params.polkadot - optional config for polkadot `ApiPromise`
   */
  static async connect(params: ConnectParams): Promise<Polymesh> {
    const { nodeUrl, signingManager, middlewareV2, polkadot } = params;
    let context: Context;
    let polymeshApi: ApiPromise;

    const { metadata, noInitWarn, typesBundle } = polkadot ?? {};

    // Defer `await` on any checks to minimize total startup time
    const requiredChecks: Promise<void>[] = [assertExpectedChainVersion(nodeUrl)];

    try {
      const { types, rpc, signedExtensions, runtime } = schema;

      polymeshApi = await ApiPromise.create({
        provider: new WsProvider(nodeUrl),
        types,
        rpc,
        runtime,
        signedExtensions,
        metadata,
        noInitWarn,
        typesBundle,
      });
      context = await Context.create({
        polymeshApi,
        middlewareApiV2: createMiddlewareApi(middlewareV2),
        signingManager,
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

    if (middlewareV2) {
      let middlewareMetadata = null;

      const checkMiddleware = async (): Promise<void> => {
        try {
          middlewareMetadata = await context.getMiddlewareMetadata();
        } catch (err) {
          throw new PolymeshError({
            code: ErrorCode.FatalError,
            message: 'Could not query for middleware V2 metadata',
          });
        }

        if (
          !middlewareMetadata ||
          middlewareMetadata.genesisHash !== polymeshApi.genesisHash.toString()
        ) {
          throw new PolymeshError({
            code: ErrorCode.FatalError,
            message: 'Middleware V2 URL is for a different chain than the given node URL',
          });
        }
      };

      requiredChecks.push(checkMiddleware(), assertExpectedSqVersion(context));
    }

    await Promise.all(requiredChecks);

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
  public onConnectionError(callback: (...args: unknown[]) => unknown): UnsubCallback {
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
  public onDisconnect(callback: (...args: unknown[]) => unknown): UnsubCallback {
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
  public setSigningAccount(signer: string | Account): Promise<void> {
    return this.context.setSigningAddress(signerToString(signer));
  }

  /**
   * Set the SDK's Signing Manager to the provided one.
   *
   * @note Pass `null` to unset the current signing manager
   */
  public setSigningManager(signingManager: SigningManager | null): Promise<void> {
    return this.context.setSigningManager(signingManager);
  }

  /**
   * Create a batch transaction from a list of separate transactions. The list can contain batch transactions as well.
   *   The result of running this transaction will be an array of the results of each transaction in the list, in the same order.
   *   Transactions with no return value will produce `undefined` in the resulting array
   *
   * @param args.transactions - list of {@link base/PolymeshTransaction!PolymeshTransaction} or {@link base/PolymeshTransactionBatch!PolymeshTransactionBatch}
   *
   * @example Batching 3 ticker reservation transactions
   *
   * ```typescript
   * const tx1 = await sdk.assets.reserveTicker({ ticker: 'FOO' });
   * const tx2 = await sdk.assets.reserveTicker({ ticker: 'BAR' });
   * const tx3 = await sdk.assets.reserveTicker({ ticker: 'BAZ' });
   *
   * const batch = sdk.createTransactionBatch({ transactions: [tx1, tx2, tx3] as const });
   *
   * const [res1, res2, res3] = await batch.run();
   * ```
   *
   * @example Specifying the signer account for the whole batch
   *
   * ```typescript
   * const batch = sdk.createTransactionBatch({ transactions: [tx1, tx2, tx3] as const }, { signingAccount: 'someAddress' });
   *
   * const [res1, res2, res3] = await batch.run();
   * ```
   *
   * @note it is mandatory to use the `as const` type assertion when passing in the transaction array to the method in order to get the correct types
   *   for the results of running the batch
   * @note if a signing Account is not specified, the default one will be used (the one returned by `sdk.accountManagement.getSigningAccount()`)
   * @note all fees in the resulting batch must be paid by the calling Account, regardless of any exceptions that would normally be made for
   *   the individual transactions (such as subsidies or accepting invitations to join an Identity)
   */
  public createTransactionBatch: CreateTransactionBatchProcedureMethod;

  /* eslint-disable @typescript-eslint/naming-convention */
  /* istanbul ignore next: not part of the official public API */
  /**
   * Polkadot client
   */
  public get _polkadotApi(): ApiPromise {
    return this.context.getPolymeshApi();
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
   * MiddlewareV2 client
   */
  public get _middlewareApiV2(): ApolloClient<NormalizedCacheObject> {
    return this.context.middlewareApi;
  }
  /* eslint-enable @typescript-eslint/naming-convention */
}
