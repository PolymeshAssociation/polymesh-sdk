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

import { Account, Identity, SecurityToken, TickerReservation } from '~/api/entities';
import {
  registerIdentity,
  RegisterIdentityParams,
  reserveTicker,
  ReserveTickerParams,
  transferPolyX,
  TransferPolyXParams,
} from '~/api/procedures';
import { Context, PolymeshError, TransactionQueue } from '~/base';
import { heartbeat } from '~/middleware/queries';
import {
  AccountBalance,
  CommonKeyring,
  CurrentAccount,
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
  stringToIdentityId,
  stringToTicker,
  textToString,
  tickerToString,
  u32ToBigNumber,
  valueToDid,
} from '~/utils';

import { Claims } from './Claims';
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
  public claims: Claims;

  /**
   * @hidden
   */
  private constructor(context: Context) {
    this.context = context;

    this.governance = new Governance(context);
    this.claims = new Claims(context);
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
    let context: Context;

    try {
      const { types, rpc } = polymesh;

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
   * Transfer an amount of POLYX to a specified account
   *
   * @param args.to - account id that will receive the POLYX
   * @param args.amount - amount of POLYX to be transferred
   * @param args.memo - identifier string to help differentiate transfers
   */
  public transferPolyX(args: TransferPolyXParams): Promise<TransactionQueue<void>> {
    return transferPolyX.prepare(args, this.context);
  }

  /**
   * Get the free/locked POLYX balance of an account
   *
   * @param args.account - defaults to the current account
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
   * @param args.owner - identity representation or identity ID as stored in the blockchain
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

    let identity: string;

    if (args) {
      identity = valueToDid(args.owner);
    } else {
      ({ did: identity } = await context.getCurrentIdentity());
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
   * Create an Identity instance from a DID
   */
  public getIdentity(args: { did: string }): Identity {
    return new Identity(args, this.context);
  }

  /**
   * Retrieve the Identity associated to the current Account
   */
  public getCurrentIdentity(): Promise<Identity> {
    return this.context.getCurrentIdentity();
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
   */
  public async getSecurityTokens(args?: { owner: string | Identity }): Promise<SecurityToken[]> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
    } = this;

    let identity: string;

    if (args) {
      identity = valueToDid(args.owner);
    } else {
      ({ did: identity } = await context.getCurrentIdentity());
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
