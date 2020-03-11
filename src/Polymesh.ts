import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { BigNumber } from 'bignumber.js';
import { polymesh } from 'polymesh-types/definitions';

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
   * Get the POLY balance of the current account
   */
  public async getIdentityBalance(): Promise<BigNumber> {
    const { currentIdentity } = this.context;
    if (currentIdentity) {
      const balance = await currentIdentity.getPolyXBalance();
      return balance;
    } else {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'The current account does not have an associated identity',
      });
    }
  }

  /**
   * Get the free POLY balance of an account
   *
   * @param args.accountId - defaults to the current account
   */
  public getAccountBalance(args: { accountId?: string } = {}): Promise<BigNumber> {
    const { context } = this;

    return context.accountBalance(args.accountId);
  }

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
}
