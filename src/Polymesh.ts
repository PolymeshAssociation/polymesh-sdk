import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { BigNumber } from 'bignumber.js';
import { polymesh } from 'polymesh-types/definitions';

import { Identity, TickerReservation } from '~/api/entities';
import { reserveTicker, ReserveTickerParams } from '~/api/procedures';
import { PolymeshError, TransactionQueue } from '~/base';
import { Context } from '~/context';
import { ErrorCode } from '~/types';
import { tickerToString } from '~/utils';

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
      polymeshApi = await ApiPromise.create({
        provider: new WsProvider(nodeUrl),
        types: polymesh.types,
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
   * @param args.did - identity ID as stored in the blockchain
   */
  public async getTickerReservations(args?: { did: string }): Promise<TickerReservation[]> {
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
      identity = args.did;
    } else {
      identity = context.getCurrentIdentity().did;
    }

    const tickers = await links.entries({ identity });

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
}
