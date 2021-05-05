import BigNumber from 'bignumber.js';

import { Context } from '~/internal';
import { eventByIndexedArgs, eventsByIndexedArgs, transactionByHash } from '~/middleware/queries';
import { EventIdEnum as EventId, ModuleIdEnum as ModuleId, Query } from '~/middleware/types';
import { Ensured, EventIdentifier, ExtrinsicData } from '~/types';
import { extrinsicIdentifierToTxTag, middlewareEventToEventIdentifier } from '~/utils/conversion';
import { optionize } from '~/utils/internal';

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
      } = transaction;

      return {
        blockNumber: new BigNumber(blockNumber),
        extrinsicIdx,
        address: rawAddress ?? null,
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
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
