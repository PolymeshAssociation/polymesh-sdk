import { ApiPromise, WsProvider } from '@polymathnetwork/polkadot/api';
import { Context } from './Context';

interface ConnectParams {
  node: string;
  seed?: string;
}

interface Connect {
  (params: ConnectParams): Promise<Polymesh>;
}

/**
 * Main entry point of the Polymesh SDK
 */
export class Polymesh {
  public isConnected = false;
  private context: Context = {} as Context;

  public connect: Connect = async ({
    node,
    seed = undefined,
  }: ConnectParams): Promise<Polymesh> => {
    let polymeshApi: ApiPromise;
    try {
      polymeshApi = await ApiPromise.create({
        provider: new WsProvider(node),
      });
    } catch (e) {
      // TODO polymesh error class
      throw new Error('Connection error');
    }

    this.isConnected = true;

    this.context = await Context.create({
      polymeshApi,
      seed,
    });

    return this;
  };
}
