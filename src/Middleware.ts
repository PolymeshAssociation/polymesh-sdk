import BigNumber from 'bignumber.js';

import { Context } from '~/internal';
import { eventByIndexedArgs, eventsByIndexedArgs, transactionByHash } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum, Query } from '~/middleware/types';
import { Ensured, EventIdentifier, ExtrinsicData } from '~/types';
import { extrinsicIdentifierToTxTag } from '~/utils/conversion';

/**
 * Handles all Middleware related functionality
 */
export class Middleware {
  private context: Context;

  /**
   * @hidden
   */
  constructor(context: Context) {
    this.context = context;
  }

  /**
   * Retrieve a single event by any of its indexed arguments. Can be filtered using parameters
   *
   * @param opts.moduleId - type of the module to fetch
   * @param opts.eventId - type of the event to fetch
   * @param opts.eventArg0 - event value to filter in position 0
   * @param opts.eventArg1 - event value to filter in position 1
   * @param opts.eventArg2 - event value to filter in position 2
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

    const result = await context.queryMiddleware<Ensured<Query, 'eventByIndexedArgs'>>(
      eventByIndexedArgs({
        moduleId,
        eventId,
        eventArg0,
        eventArg1,
        eventArg2,
      })
    );

    if (result.data.eventByIndexedArgs) {
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      return {
        blockNumber: new BigNumber(result.data.eventByIndexedArgs.block_id),
        blockDate: result.data.eventByIndexedArgs.block!.datetime,
        eventIndex: result.data.eventByIndexedArgs.event_idx,
      };
      /* eslint-enabled @typescript-eslint/no-non-null-assertion */
    }

    return null;
  }

  /**
   * Retrieve a list of events. Can be filtered using parameters
   *
   * @param opts.moduleId - type of the module to fetch
   * @param opts.eventId - type of the event to fetch
   * @param opts.eventArg0 - event value to filter in position 0
   * @param opts.eventArg1 - event value to filter in position 1
   * @param opts.eventArg2 - event value to filter in position 2
   * @param opts.size - page size
   * @param opts.start - page offset
   */
  public async getEventsByIndexedArgs(opts: {
    moduleId: ModuleIdEnum;
    eventId: EventIdEnum;
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
      return events.map(event => {
        return {
          blockNumber: new BigNumber(event!.block_id),
          blockDate: event!.block!.datetime,
          eventIndex: event!.event_idx,
        };
      });
    }

    return null;
  }

  /**
   * Retrieve a transaction by hash
   *
   * @param opts.txHash - hash of the transaction
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

    /* eslint-disable @typescript-eslint/camelcase */
    if (transaction) {
      const {
        block_id,
        extrinsic_idx,
        address: rawAddress,
        nonce,
        module_id,
        call_id,
        params,
        success: txSuccess,
        spec_version_id,
        extrinsic_hash,
      } = transaction;

      return {
        blockNumber: new BigNumber(block_id),
        extrinsicIdx: extrinsic_idx,
        address: rawAddress ?? null,
        nonce: nonce!,
        txTag: extrinsicIdentifierToTxTag({ moduleId: module_id, callId: call_id }),
        params,
        success: !!txSuccess,
        specVersionId: spec_version_id,
        extrinsicHash: extrinsic_hash!,
      };
    }
    /* eslint-enable @typescript-eslint/camelcase */

    return null;
  }
}
