import { ApiPromise, WsProvider } from '@polymathnetwork/polkadot/api';
import { Context } from './Context';
import { ErrorCode } from './types';
import { PolymeshError } from './base/PolymeshError';

interface ConnectParams {
  nodeUrl: string;
  accountSeed?: string;
}

/**
 * Main entry point of the Polymesh SDK
 */
export class Polymesh {
  public context: Context = {} as Context;

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
}
