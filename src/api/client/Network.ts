import BigNumber from 'bignumber.js';

import { Account, Context, transferPolyx } from '~/internal';
import { EventIdEnum, ModuleIdEnum } from '~/middleware/enums';
import { eventsByArgs, extrinsicByHash } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  EventIdentifier,
  ExtrinsicDataWithFees,
  MiddlewareMetadata,
  NetworkProperties,
  ProcedureMethod,
  ProtocolFees,
  SubCallback,
  TransferPolyxParams,
  TxTag,
  UnsubCallback,
} from '~/types';
import { Ensured } from '~/types/utils';
import { TREASURY_MODULE_ADDRESS } from '~/utils/constants';
import {
  balanceToBigNumber,
  extrinsicIdentifierToTxTag,
  middlewareEventDetailsToEventIdentifier,
  moduleAddressToString,
  stringToBlockHash,
  textToString,
  u32ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod, optionize } from '~/utils/internal';

/**
 * Handles all Network related functionality, including querying for historical events from middleware
 */
export class Network {
  private context: Context;

  /**
   * @hidden
   */
  constructor(context: Context) {
    this.context = context;

    this.transferPolyx = createProcedureMethod(
      { getProcedureAndArgs: args => [transferPolyx, args] },
      context
    );
  }

  /**
   * Retrieve the number of the latest finalized block in the chain
   */
  public getLatestBlock(): Promise<BigNumber> {
    return this.context.getLatestBlock();
  }

  /**
   * Fetch the current network version (e.g. 3.1.0)
   */
  public async getVersion(): Promise<string> {
    return this.context.getNetworkVersion();
  }

  /**
   * Retrieve the chain's SS58 format
   */
  public getSs58Format(): BigNumber {
    return this.context.ss58Format;
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
      version: u32ToBigNumber(specVersion),
    };
  }

  /**
   * Retrieve the protocol fees associated with running specific transactions
   *
   * @param args.tags - list of transaction tags (e.g. [TxTags.asset.CreateAsset, TxTags.asset.RegisterTicker] or ["asset.createAsset", "asset.registerTicker"])
   */
  public getProtocolFees(args: { tags: TxTag[] }): Promise<ProtocolFees[]> {
    return this.context.getProtocolFees(args);
  }

  /**
   * Get the treasury wallet address
   */
  public getTreasuryAccount(): Account {
    const { context } = this;
    return new Account(
      { address: moduleAddressToString(TREASURY_MODULE_ADDRESS, context) },
      context
    );
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
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(freeBalance);
      });
    }

    const { free } = await account.getBalance();
    return free;
  }

  /**
   * Transfer an amount of POLYX to a specified Account
   */
  public transferPolyx: ProcedureMethod<TransferPolyxParams, void>;

  /**
   * Retrieve a single event by any of its indexed arguments. Can be filtered using parameters
   *
   * @param opts.moduleId - type of the module to fetch
   * @param opts.eventId - type of the event to fetch
   * @param opts.eventArg0 - event parameter value to filter by in position 0
   * @param opts.eventArg1 - event parameter value to filter by in position 1
   * @param opts.eventArg2 - event parameter value to filter by in position 2
   *
   * @note uses the middlewareV2
   */
  public async getEventByIndexedArgs(opts: {
    moduleId: ModuleIdEnum;
    eventId: EventIdEnum;
    eventArg0?: string;
    eventArg1?: string;
    eventArg2?: string;
  }): Promise<EventIdentifier | null> {
    const { context } = this;

    const { moduleId, eventId, eventArg0, eventArg1, eventArg2 } = opts;

    const {
      data: {
        events: {
          nodes: [event],
        },
      },
    } = await context.queryMiddleware<Ensured<Query, 'events'>>(
      eventsByArgs(
        {
          moduleId,
          eventId,
          eventArg0,
          eventArg1,
          eventArg2,
        },
        new BigNumber(1)
      )
    );

    return optionize(middlewareEventDetailsToEventIdentifier)(event?.block, event?.eventIdx);
  }

  /**
   * Retrieve a list of events. Can be filtered using parameters
   *
   * @param opts.moduleId - type of the module to fetch
   * @param opts.eventId - type of the event to fetch
   * @param opts.eventArg0 - event parameter value to filter by in position 0
   * @param opts.eventArg1 - event parameter value to filter by in position 1
   * @param opts.eventArg2 - event parameter value to filter by in position 2
   * @param opts.size - page size
   * @param opts.start - page offset
   *
   * @note uses the middlewareV2
   */
  public async getEventsByIndexedArgs(opts: {
    moduleId: ModuleIdEnum;
    eventId: EventIdEnum;
    eventArg0?: string;
    eventArg1?: string;
    eventArg2?: string;
    size?: BigNumber;
    start?: BigNumber;
  }): Promise<EventIdentifier[] | null> {
    const { context } = this;

    const { moduleId, eventId, eventArg0, eventArg1, eventArg2, size, start } = opts;

    const {
      data: {
        events: { nodes: events },
      },
    } = await context.queryMiddleware<Ensured<Query, 'events'>>(
      eventsByArgs(
        {
          moduleId,
          eventId,
          eventArg0,
          eventArg1,
          eventArg2,
        },
        size,
        start
      )
    );

    if (events.length) {
      return events.map(({ block, eventIdx }) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        middlewareEventDetailsToEventIdentifier(block!, eventIdx)
      );
    }

    return null;
  }

  /**
   * Retrieve a transaction by hash
   *
   * @param opts.txHash - hash of the transaction
   *
   * @note uses the middlewareV2
   */
  public async getTransactionByHash(opts: {
    txHash: string;
  }): Promise<ExtrinsicDataWithFees | null> {
    const {
      context: {
        polymeshApi: {
          rpc: {
            chain: { getBlock },
            payment: { queryInfo },
          },
        },
      },
      context,
    } = this;

    const {
      data: {
        extrinsics: {
          nodes: [transaction],
        },
      },
    } = await context.queryMiddleware<Ensured<Query, 'extrinsics'>>(
      extrinsicByHash({
        extrinsicHash: opts.txHash,
      })
    );

    if (transaction) {
      const {
        extrinsicIdx,
        address: rawAddress,
        nonce,
        moduleId,
        callId,
        paramsTxt,
        success: txSuccess,
        specVersionId,
        extrinsicHash,
        block,
      } = transaction;

      const txTag = extrinsicIdentifierToTxTag({
        moduleId,
        callId,
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { hash: blockHash, blockId: blockNumber } = block!;

      const rawBlockHash = stringToBlockHash(blockHash, context);

      const {
        block: { extrinsics: blockExtrinsics },
      } = await getBlock(rawBlockHash);

      const [{ partialFee }, [{ fees: protocol }]] = await Promise.all([
        queryInfo(blockExtrinsics[extrinsicIdx].toHex(), rawBlockHash),
        context.getProtocolFees({ tags: [txTag], blockHash }),
      ]);

      const gas = balanceToBigNumber(partialFee);

      return {
        blockNumber: new BigNumber(blockNumber),
        blockHash,
        extrinsicIdx: new BigNumber(extrinsicIdx),
        address: rawAddress ?? null,
        nonce: nonce ? new BigNumber(nonce) : null,
        txTag,
        params: JSON.parse(paramsTxt),
        success: !!txSuccess,
        specVersionId: new BigNumber(specVersionId),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        extrinsicHash: extrinsicHash!,
        fee: {
          gas,
          protocol,
          total: gas.plus(protocol),
        },
      };
    }

    return null;
  }

  /**
   * Retrieve middleware metadata.
   * Returns null if middleware is disabled
   *
   * @note uses the middleware V2
   */
  public async getMiddlewareMetadata(): Promise<MiddlewareMetadata | null> {
    return this.context.getMiddlewareMetadata();
  }

  /**
   * Get the number of blocks the middleware needs to process to be synced with chain.
   * The lag can be around somewhere upto 15 blocks, but this can increase if the block size being processed by the Middleware is too large.
   * If the lag is too large, its recommended to check the indexer health to make sure the Middleware is processing the blocks.
   *
   * @note uses the middleware V2
   */
  public async getMiddlewareLag(): Promise<BigNumber> {
    let lastProcessedBlockFromMiddleware = new BigNumber(0);
    const [latestBlockFromChain, middlewareMetadata] = await Promise.all([
      this.context.getLatestBlock(),
      this.context.getMiddlewareMetadata(),
    ]);

    if (middlewareMetadata) {
      lastProcessedBlockFromMiddleware = middlewareMetadata.lastProcessedHeight;
    }

    return latestBlockFromChain.minus(lastProcessedBlockFromMiddleware);
  }
}
