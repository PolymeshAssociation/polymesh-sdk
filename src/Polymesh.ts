import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { BigNumber } from 'bignumber.js';
import { polymesh } from 'polymesh-types/definitions';

import { Identity, SecurityToken, TickerReservation } from '~/api/entities';
import { addClaims, AddClaimsParams, reserveTicker, ReserveTickerParams } from '~/api/procedures';
import { PolymeshError, TransactionQueue } from '~/base';
import { Context } from '~/context';
import { ErrorCode } from '~/types';
import { SignerType } from '~/types/internal';
import { signerToSignatory, tickerToString, valueToDid } from '~/utils';

/**
 * Main entry point of the Polymesh SDK
 */
export class Polymesh {
  private context: Context = {} as Context;

  /**
   * @hidden
   */
  private constructor(context: Context) {
    this.context = context;
  }

  static async connect(params: { nodeUrl: string; accountSeed: string }): Promise<Polymesh>;

  static async connect(params: { nodeUrl: string; keyring: Keyring }): Promise<Polymesh>;

  static async connect(params: { nodeUrl: string; accountUri: string }): Promise<Polymesh>;

  static async connect(params: { nodeUrl: string }): Promise<Polymesh>;

  /**
   * Create the instance and connect to the Polymesh node
   */
  static async connect(params: {
    nodeUrl: string;
    accountSeed?: string;
    keyring?: Keyring;
    accountUri?: string;
  }): Promise<Polymesh> {
    const { nodeUrl, accountSeed, keyring, accountUri } = params;
    let polymeshApi: ApiPromise;

    try {
      const { types, rpc } = polymesh;

      polymeshApi = await ApiPromise.create({
        provider: new WsProvider(nodeUrl),
        types,
        rpc,
      });

      let context: Context;

      if (accountSeed) {
        context = await Context.create({
          polymeshApi,
          seed: accountSeed,
        });
      } else if (keyring) {
        context = await Context.create({
          polymeshApi,
          keyring,
        });
      } else if (accountUri) {
        context = await Context.create({
          polymeshApi,
          uri: accountUri,
        });
      } else {
        context = await Context.create({
          polymeshApi,
        });
      }

      return new Polymesh(context);
    } catch (e) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: `Error while connecting to "${nodeUrl}": "${e.message}"`,
      });
    }
  }

  /**
   * Get the POLYX balance of the current account
   */
  public getIdentityBalance(): Promise<BigNumber> {
    return this.context.getCurrentIdentity().getPolyXBalance();
  }

  /**
   * Get the free POLYX balance of an account
   *
   * @param args.accountId - defaults to the current account
   */
  public getAccountBalance(args?: { accountId: string }): Promise<BigNumber> {
    const { context } = this;

    return context.accountBalance(args?.accountId);
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
   * Retrieve all the ticker reservations currently owned by an identity. This includes
   * Security Tokens that have already been launched
   *
   * @param args.did - identity representation or identity ID as stored in the blockchain
   */
  public async getTickerReservations(args?: {
    did: string | Identity;
  }): Promise<TickerReservation[]> {
    const {
      context: {
        polymeshApi: {
          query: {
            identity: { links },
          },
        },
      },
      context,
    } = this;

    let identity: string;

    if (args) {
      identity = valueToDid(args.did);
    } else {
      identity = context.getCurrentIdentity().did;
    }

    const tickers = await links.entries(
      signerToSignatory({ type: SignerType.Identity, value: identity }, context)
    );

    const tickerReservations = tickers
      .filter(([, data]) => data.link_data.isTickerOwned)
      .map(([, data]) => {
        const ticker = data.link_data.asTickerOwned;
        return new TickerReservation({ ticker: tickerToString(ticker) }, context);
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

    const tickerReservation = await asset.tickers(ticker);

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
   * Add a batch of claims
   *
   * @param args.claims - array of clamis to be added
   */
  public addClaims(args: AddClaimsParams): Promise<TransactionQueue<void>> {
    return addClaims.prepare(args, this.context);
  }

  /**
   * Handle connection errors
   *
   * @returns an unsubscribe callback
   */
  onConnectionError(callback: (...args: unknown[]) => unknown): () => void {
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
  onDisconnect(callback: (...args: unknown[]) => unknown): () => void {
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
        polymeshApi: {
          query: {
            identity: { links },
          },
        },
      },
      context,
    } = this;

    let identity: string;

    if (args) {
      identity = valueToDid(args.did);
    } else {
      identity = context.getCurrentIdentity().did;
    }

    const identityLinks = await links.entries(
      signerToSignatory({ type: SignerType.Identity, value: identity }, context)
    );

    const securityTokens = identityLinks
      .filter(([, data]) => data.link_data.isTokenOwned)
      .map(([, data]) => {
        const ticker = data.link_data.asTokenOwned;
        return new SecurityToken({ ticker: tickerToString(ticker) }, context);
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

    const securityToken = await asset.tokens(ticker);

    if (!securityToken.name.isEmpty) {
      return new SecurityToken({ ticker }, context);
    }

    throw new PolymeshError({
      code: ErrorCode.FatalError,
      message: `There is no Security Token with ticker "${ticker}"`,
    });
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
