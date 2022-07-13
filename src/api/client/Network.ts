import BigNumber from 'bignumber.js';

import { Account, Context, transferPolyx } from '~/internal';
import { eventByIndexedArgs, eventsByIndexedArgs, transactionByHash } from '~/middleware/queries';
import { eventsByArgs, extrinsicByHash } from '~/middleware/queriesV2';
import {
  CallIdEnum,
  EventIdEnum as EventId,
  ModuleIdEnum as ModuleId,
  ModuleIdEnum,
  Query,
} from '~/middleware/types';
import { Query as QueryV2 } from '~/middleware/typesV2';
import {
  EventIdentifier,
  ExtrinsicDataWithFees,
  NetworkProperties,
  ProcedureMethod,
  ProtocolFees,
  SubCallback,
  TransferPolyxParams,
  TxTag,
  UnsubCallback,
} from '~/types';
import { Ensured, EnsuredV2 } from '~/types/utils';
import { TREASURY_MODULE_ADDRESS } from '~/utils/constants';
import {
  balanceToBigNumber,
  extrinsicIdentifierToTxTag,
  middlewareEventToEventIdentifier,
  middlewareV2EventDetailsToEventIdentifier,
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
   * Retrieve the number of the latest block in the chain
   */
  public getLatestBlock(): Promise<BigNumber> {
    return this.context.getLatestBlock();
  }

  /**
   * Fetch the current network version (i.e. 3.1.0)
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
   * @param args.tags - list of transaction tags (i.e. [TxTags.asset.CreateAsset, TxTags.asset.RegisterTicker] or ["asset.createAsset", "asset.registerTicker"])
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
   * @note uses the middleware
   */
  public async getEventByIndexedArgs(opts: {
    moduleId: ModuleId;
    eventId: EventId;
    eventArg0?: string;
    eventArg1?: string;
    eventArg2?: string;
  }): Promise<EventIdentifier | null> {
    const { context } = this;

    const { moduleId, eventId, eventArg0, eventArg1, eventArg2 } = opts;

    const {
      data: { eventByIndexedArgs: event },
    } = await context.queryMiddleware<Ensured<Query, 'eventByIndexedArgs'>>(
      eventByIndexedArgs({
        moduleId,
        eventId,
        eventArg0,
        eventArg1,
        eventArg2,
      })
    );

    return optionize(middlewareEventToEventIdentifier)(event);
  }

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
  public async getEventByIndexedArgsV2(opts: {
    moduleId: ModuleId;
    eventId: EventId;
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
    } = await context.queryMiddlewareV2<EnsuredV2<QueryV2, 'events'>>(
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

    return optionize(middlewareV2EventDetailsToEventIdentifier)(event?.block, event?.eventIdx);
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
   * @note uses the middleware
   */
  public async getEventsByIndexedArgs(opts: {
    moduleId: ModuleId;
    eventId: EventId;
    eventArg0?: string;
    eventArg1?: string;
    eventArg2?: string;
    size?: BigNumber;
    start?: BigNumber;
  }): Promise<EventIdentifier[] | null> {
    const { context } = this;

    const { moduleId, eventId, eventArg0, eventArg1, eventArg2, size, start } = opts;

    const result = await context.queryMiddleware<Ensured<Query, 'eventsByIndexedArgs'>>(
      eventsByIndexedArgs({
        moduleId,
        eventId,
        eventArg0,
        eventArg1,
        eventArg2,
        count: size?.toNumber(),
        skip: start?.toNumber(),
      })
    );

    const {
      data: { eventsByIndexedArgs: events },
    } = result;

    if (events) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return events.map(event => middlewareEventToEventIdentifier(event!));
    }

    return null;
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
  public async getEventsByIndexedArgsV2(opts: {
    moduleId: ModuleId;
    eventId: EventId;
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
    } = await context.queryMiddlewareV2<EnsuredV2<QueryV2, 'events'>>(
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
        middlewareV2EventDetailsToEventIdentifier(block!, eventIdx)
      );
    }

    return null;
  }

  /**
   * Retrieve a transaction by hash
   *
   * @param opts.txHash - hash of the transaction
   *
   * @note uses the middleware
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

    const { txHash: transactionHash } = opts;

    const result = await context.queryMiddleware<Ensured<Query, 'transactionByHash'>>(
      transactionByHash({
        transactionHash,
      })
    );

    const {
      data: { transactionByHash: transaction },
    } = result;

    if (transaction) {
      const {
        block_id: blockNumber,
        extrinsic_idx: extrinsicIdx,
        address: rawAddress,
        nonce,
        module_id: moduleId,
        call_id: callId,
        params,
        success: txSuccess,
        spec_version_id: specVersionId,
        extrinsic_hash: extrinsicHash,
        block,
      } = transaction;

      const txTag = extrinsicIdentifierToTxTag({ moduleId, callId });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const blockHash = block!.hash!;

      const rawBlockHash = stringToBlockHash(blockHash, context);

      const {
        block: { extrinsics },
      } = await getBlock(rawBlockHash);

      const [{ partialFee }, [{ fees: protocolFees }]] = await Promise.all([
        queryInfo(extrinsics[extrinsicIdx].toHex(), rawBlockHash),
        context.getProtocolFees({ tags: [txTag], blockHash }),
      ]);

      return {
        blockNumber: new BigNumber(blockNumber),
        blockHash,
        extrinsicIdx: new BigNumber(extrinsicIdx),
        address: rawAddress ?? null,
        nonce: nonce ? new BigNumber(nonce) : null,
        txTag,
        params,
        success: !!txSuccess,
        specVersionId: new BigNumber(specVersionId),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        extrinsicHash: extrinsicHash!,
        fee: {
          gas: balanceToBigNumber(partialFee),
          protocol: protocolFees,
        },
      };
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
  public async getTransactionByHashV2(opts: {
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
    } = await context.queryMiddlewareV2<EnsuredV2<QueryV2, 'extrinsics'>>(
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
        moduleId: moduleId as ModuleIdEnum,
        callId: callId as CallIdEnum,
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { hash: blockHash, blockId: blockNumber } = block!;

      const rawBlockHash = stringToBlockHash(blockHash, context);

      const {
        block: { extrinsics: blockExtrinsics },
      } = await getBlock(rawBlockHash);

      const [{ partialFee }, [{ fees: protocolFees }]] = await Promise.all([
        queryInfo(blockExtrinsics[extrinsicIdx].toHex(), rawBlockHash),
        context.getProtocolFees({ tags: [txTag], blockHash }),
      ]);

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
          gas: balanceToBigNumber(partialFee),
          protocol: protocolFees,
        },
      };
    }

    return null;
  }
}
