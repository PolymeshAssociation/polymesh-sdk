import { ApiPromise, WsProvider } from '@polkadot/api';
import { Signer as PolkadotSigner } from '@polkadot/api/types';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { HttpLink } from 'apollo-link-http';
import BigNumber from 'bignumber.js';
import fetch from 'cross-fetch';
import { polymesh } from 'polymesh-types/definitions';
import { Ticker, TxTag } from 'polymesh-types/types';

import {
  Account,
  Context,
  Identity,
  PolymeshError,
  registerIdentity,
  RegisterIdentityParams,
  reserveTicker,
  ReserveTickerParams,
  SecurityToken,
  TickerReservation,
  TransactionQueue,
  transferPolyX,
  TransferPolyXParams,
} from '~/internal';
import { heartbeat } from '~/middleware/queries';
import {
  AccountBalance,
  CommonKeyring,
  CurrentAccount,
  CurrentIdentity,
  ErrorCode,
  MiddlewareConfig,
  NetworkProperties,
  SubCallback,
  TickerReservationStatus,
  UiKeyring,
  UnsubCallback,
} from '~/types';
import {
  moduleAddressToString,
  signerToString,
  stringToIdentityId,
  stringToTicker,
  textToString,
  tickerToString,
  u32ToBigNumber,
} from '~/utils/conversion';
import { getDid, stringIsClean } from '~/utils/internal';

import { Claims } from './Claims';
// import { Governance } from './Governance';
import { Middleware } from './Middleware';
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

  // NOTE uncomment in Governance v2 upgrade
  // public governance: Governance;
  public claims: Claims;
  public middleware: Middleware;

  /**
   * @hidden
   */
  private constructor(context: Context) {
    this.context = context;

    // NOTE uncomment in Governance v2 upgrade
    // this.governance = new Governance(context);
    this.claims = new Claims(context);
    this.middleware = new Middleware(context);
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
   * @param params.accountUri - account URI or mnemonic
   */
  static async connect(params: ConnectParamsBase & { accountUri: string }): Promise<Polymesh>;

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
      middleware?: MiddlewareConfig;
    }
  ): Promise<Polymesh> {
    const { nodeUrl, accountSeed, keyring, accountUri, signer, middleware } = params;
    let context: Context;

    try {
      const { types, rpc } = polymesh;

      const polymeshApi = await ApiPromise.create({
        provider: new WsProvider(nodeUrl),
        // https://github.com/polkadot-js/api/releases/tag/v2.0.1 TODO @monitz87: remove once Polymesh is updated to substrate 2.0
        types: {
          ...types,
        },
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
    } catch (err) {
      const { message, code } = err;
      throw new PolymeshError({
        code,
        message: `Error while connecting to "${nodeUrl}": "${message ||
          'The node couldn’t be reached'}"`,
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
            code: ErrorCode.NotAuthorized,
            message: 'Incorrect middleware URL or API key',
          });
        }
      }
    }

    return new Polymesh(context);
  }

  /**
   * Transfer an amount of POLYX to a specified Account
   *
   * @param args.to - account that will receive the POLYX
   * @param args.amount - amount of POLYX to be transferred
   * @param args.memo - identifier string to help differentiate transfers
   */
  public transferPolyX(args: TransferPolyXParams): Promise<TransactionQueue<void>> {
    return transferPolyX.prepare(args, this.context);
  }

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
   * Reserve a ticker symbol to later use in the creation of a Security Token.
   *   The ticker will expire after a set amount of time, after which other users can reserve it
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
   * Retrieve all the ticker reservations currently owned by an Identity. This doesn't include tokens that
   *   have already been launched
   *
   * @param args.owner - identity representation or Identity ID as stored in the blockchain
   *
   * * @note reservations with unreadable characters in their tickers will be left out
   */
  public async getTickerReservations(args?: {
    owner: string | Identity;
  }): Promise<TickerReservation[]> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
    } = this;

    const did = await getDid(args?.owner, context);

    const entries = await query.asset.assetOwnershipRelations.entries(
      stringToIdentityId(did, context)
    );

    const tickerReservations: TickerReservation[] = entries.reduce<TickerReservation[]>(
      (result, [key, relation]) => {
        if (relation.isTickerOwned) {
          const ticker = tickerToString(key.args[1] as Ticker);

          if (stringIsClean(ticker)) {
            return [...result, new TickerReservation({ ticker }, context)];
          }
        }

        return result;
      },
      []
    );

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
   * Create an Identity instance from a DID
   */
  public getIdentity(args: { did: string }): Identity {
    return new Identity(args, this.context);
  }

  /**
   * Retrieve the Identity associated to the current Account (null if there is none)
   */
  public getCurrentIdentity(): Promise<CurrentIdentity | null> {
    return this.context.getCurrentAccount().getIdentity();
  }

  /**
   * Create an Account instance from an address. If no address is passed, the current Account is returned
   */
  public getAccount(): CurrentAccount;
  public getAccount(args: { address: string }): Account;

  // eslint-disable-next-line require-jsdoc
  public getAccount(args?: { address: string }): Account | CurrentAccount {
    const { context } = this;

    if (args) {
      return new Account(args, context);
    }

    return context.getCurrentAccount();
  }

  /**
   * Return whether the supplied Identity/DID exists
   */
  public async isIdentityValid(args: { identity: Identity | string }): Promise<boolean> {
    const invalid = await this.context.getInvalidDids([signerToString(args.identity)]);

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
  public getTreasuryAccount(): Account {
    return new Account({ address: moduleAddressToString(TREASURY_MODULE_ADDRESS) }, this.context);
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
   * Retrieve all the Security Tokens owned by an Identity
   *
   * @param args.owner - identity representation or Identity ID as stored in the blockchain
   *
   * @note tokens with unreadable characters in their tickers will be left out
   */
  public async getSecurityTokens(args?: { owner: string | Identity }): Promise<SecurityToken[]> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
    } = this;

    const did = await getDid(args?.owner, context);

    const entries = await query.asset.assetOwnershipRelations.entries(
      stringToIdentityId(did, context)
    );

    const securityTokens: SecurityToken[] = entries.reduce<SecurityToken[]>(
      (result, [key, relation]) => {
        if (relation.isAssetOwned) {
          const ticker = tickerToString(key.args[1] as Ticker);

          if (stringIsClean(ticker)) {
            return [...result, new SecurityToken({ ticker }, context)];
          }
        }

        return result;
      },
      []
    );

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
   */
  public registerIdentity(args: RegisterIdentityParams): Promise<TransactionQueue<Identity>> {
    return registerIdentity.prepare(args, this.context);
  }

  /**
   * Retrieve the number of the latest block in the chain
   */
  public getLatestBlock(): Promise<BigNumber> {
    return this.context.getLatestBlock();
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
