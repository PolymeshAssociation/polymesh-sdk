import BigNumber from 'bignumber.js';

import { Account, Context, transferPolyx, TransferPolyxParams } from '~/internal';
import { eventByIndexedArgs, eventsByIndexedArgs, transactionByHash } from '~/middleware/queries';
import { EventIdEnum as EventId, ModuleIdEnum as ModuleId, Query } from '~/middleware/types';
import {
  EventIdentifier,
  ExtrinsicData,
  NetworkProperties,
  ProcedureMethod,
  SubCallback,
  TxTag,
  UnsubCallback,
} from '~/types';
import { Ensured } from '~/types/utils';
import { TREASURY_MODULE_ADDRESS } from '~/utils/constants';
import {
  extrinsicIdentifierToTxTag,
  middlewareEventToEventIdentifier,
  moduleAddressToString,
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
   * Retrieve the protocol fees associated with running a specific transaction
   *
   * @param args.tag - transaction tag (i.e. TxTags.asset.CreateAsset or "asset.createAsset")
   */
  public getProtocolFees(args: { tag: TxTag }): Promise<BigNumber> {
    return this.context.getProtocolFees(args.tag);
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
    size?: number;
    start?: number;
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
        count: size,
        skip: start,
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
   * Retrieve a transaction by hash
   *
   * @param opts.txHash - hash of the transaction
   *
   * @note uses the middleware
   */
  public async getTransactionByHash(opts: { txHash: string }): Promise<ExtrinsicData | null> {
    const { context } = this;

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

      return {
        blockNumber: new BigNumber(blockNumber),
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        blockHash: block!.hash!,
        extrinsicIdx,
        address: rawAddress ?? null,
        nonce: nonce!,
        txTag: extrinsicIdentifierToTxTag({ moduleId, callId }),
        params,
        success: !!txSuccess,
        specVersionId,
        extrinsicHash: extrinsicHash!,
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
      };
    }

    return null;
  }
}
