import { ApiPromise, WsProvider } from '@polymathnetwork/polkadot/api';
import { BigNumber } from 'bignumber.js';

import { Context, PolymeshError } from '~/base';
import { ErrorCode } from '~/types';

interface ConnectParams {
  nodeUrl: string;
  accountSeed?: string;
}

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

  /**
   * Create the instance and connect to the Polymesh node
   */
  static async connect(params: ConnectParams): Promise<Polymesh> {
    const { nodeUrl, accountSeed } = params;
    let polymeshApi: ApiPromise;

    try {
      polymeshApi = await ApiPromise.create({
        provider: new WsProvider(nodeUrl),
      });

      const context = await Context.create({
        polymeshApi,
        accountSeed,
      });

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
  public getPolyBalance = async (): Promise<BigNumber> => {
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
}
