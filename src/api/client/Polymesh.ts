import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client/core';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Polymesh as PublicPolymesh } from '@polymeshassociation/polymesh-sdk';
import { Context, PolymeshError } from '@polymeshassociation/polymesh-sdk/internal';
import {
  ErrorCode,
  MiddlewareConfig,
  PolkadotConfig,
} from '@polymeshassociation/polymesh-sdk/types';
import {
  assertExpectedChainVersion,
  assertExpectedSqVersion,
} from '@polymeshassociation/polymesh-sdk/utils/internal';
import { SigningManager } from '@polymeshassociation/signing-manager-types';

import { ConfidentialAccounts } from '~/api/client/ConfidentialAccounts';
import { ConfidentialAssets } from '~/api/client/ConfidentialAssets';
import { ConfidentialSettlements } from '~/api/client/ConfidentialSettlements';
import schema from '~/polkadot/schema';

import { ExtendedIdentities } from './ExtendedIdentities';

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
export class ConfidentialPolymesh extends PublicPolymesh {
  // Namespaces

  /**
   * A set of methods for interacting with Confidential Assets
   */
  public confidentialAssets: ConfidentialAssets;

  /**
   * A set of methods for exchanging confidential Assets
   */
  public confidentialSettlements: ConfidentialSettlements;

  /**
   * A set of methods for managing confidential Accounts
   */
  public confidentialAccounts: ConfidentialAccounts;

  /**
   * A set of methods for interacting with Polymesh Identities, with confidential extensions
   */
  override identities: ExtendedIdentities;

  /**
   * @hidden
   */
  protected constructor(context: Context) {
    super(context);
    this.confidentialAssets = new ConfidentialAssets(context);
    this.confidentialSettlements = new ConfidentialSettlements(context);
    this.confidentialAccounts = new ConfidentialAccounts(context);
    this.identities = new ExtendedIdentities(context);
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
  static override async connect(params: ConnectParams): Promise<ConfidentialPolymesh> {
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

    return new ConfidentialPolymesh(context);
  }
}
