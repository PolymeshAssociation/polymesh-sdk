import { u8aToString } from '@polkadot/util';
import { ApiPromise, Keyring, WsProvider } from '@polymathnetwork/polkadot/api';
import { Option } from '@polymathnetwork/polkadot/types';
import { Link } from '@polymathnetwork/polkadot/types/interfaces';
import { BigNumber } from 'bignumber.js';

import { TickerReservation } from '~/api/entities';
import { reserveTicker, ReserveTickerParams } from '~/api/procedures';
import { PolymeshError, TransactionQueue } from '~/base';
import { Context } from '~/context';
import { ErrorCode } from '~/types';

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
   * Get the POLY balance of the current account
   */
  public getIdentityBalance = async (): Promise<BigNumber> => {
    const { currentIdentity } = this.context;
    if (currentIdentity) {
      const balance = await currentIdentity.getIdentityBalance();
      return balance;
    } else {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'The current account does not have an associated identity',
      });
    }
  };

  /**
   * Get the free POLY balance of the current account
   */
  public getAccountBalance = (accountId?: string): Promise<BigNumber> => {
    const { context } = this;

    return context.accountBalance(accountId);
  };

  /**
   * Reserve a ticker symbol to later use in the creation of a Security Token.
   * The ticker will expire after a set amount of time, after which other users can reserve it
   *
   * @param args.ticker - ticker symbol to reserve
   */
  public async reserveTicker(
    args: ReserveTickerParams
  ): Promise<TransactionQueue<TickerReservation>> {
    return reserveTicker.prepare(args, this.context);
  }

  /**
   * Retrieve all the ticker reservations currently owned by an identity. This includes
   * Security Tokens that have already been launched
   */
  public async getTickerReservations(did?: string): Promise<TickerReservation[]> {
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

    const { currentIdentity } = context;

    let identity: string;

    if (did) {
      identity = did;
    } else if (currentIdentity) {
      identity = currentIdentity.did;
    } else {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'The current account does not have an associated identity',
      });
    }

    const tickers = await links.entries({ identity });

    /*
      NOTE: we have cast to Option<Link> to get access of link_data properties despite what the types say.
    */
    const tickerReservations = tickers
      .filter(([, data]) => ((data as unknown) as Option<Link>).unwrap().link_data.isTickerOwned)
      .map(([, data]) => {
        const ticker = ((data as unknown) as Option<Link>).unwrap().link_data.asTickerOwned;
        return new TickerReservation(
          // eslint-disable-next-line no-control-regex
          { ticker: u8aToString(ticker).replace(/\u0000/g, '') },
          context
        );
      });

    return tickerReservations;
  }

  /**
   * Retrieve a Ticker Reservation
   *
   * @param ticker - Security Token ticker
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
}
