import BigNumber from 'bignumber.js';

import {
  Context,
  CustomPermissionGroup,
  Identity,
  KnownPermissionGroup,
  PolymeshError,
  setPermissionGroup,
  SetPermissionGroupParams,
} from '~/internal';
import { tickerExternalAgentActions } from '~/middleware/queries';
import { EventIdEnum as EventId, ModuleIdEnum as ModuleId, Query } from '~/middleware/types';
import { Ensured, ErrorCode, EventIdentifier, ProcedureMethod, ResultSet } from '~/types';
import {
  agentGroupToPermissionGroup,
  stringToIdentityId,
  stringToTicker,
} from '~/utils/conversion';
import { calculateNextKey, createProcedureMethod } from '~/utils/internal';

export interface UniqueIdentifiers {
  did: string;
  ticker: string;
}

/**
 * Represents an agent for a Security Token
 */
export class Agent extends Identity {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { did, ticker } = identifier as UniqueIdentifiers;

    return typeof did === 'string' && typeof ticker === 'string';
  }

  /**
   * ticker of the Security Token
   */
  public ticker: string;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { ticker } = identifiers;

    this.ticker = ticker;

    this.setPermissionGroup = createProcedureMethod(
      { getProcedureAndArgs: args => [setPermissionGroup, { agent: this, ...args }] },
      context
    );
  }

  /**
   * Assign this agent to a different Permission Group
   */
  public setPermissionGroup: ProcedureMethod<
    SetPermissionGroupParams,
    CustomPermissionGroup | KnownPermissionGroup
  >;

  /**
   * Retrieve the agent group associated with this Agent
   */
  public async getPermissionGroup(): Promise<CustomPermissionGroup | KnownPermissionGroup> {
    const {
      context: {
        polymeshApi: {
          query: { externalAgents },
        },
      },
      context,
      ticker,
      did,
    } = this;

    const rawTicker = stringToTicker(ticker, context);
    const rawIdentityId = stringToIdentityId(did, context);

    const rawGroupPermissions = await externalAgents.groupOfAgent(rawTicker, rawIdentityId);

    if (rawGroupPermissions.isNone) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'This Identity is no longer an Agent for this Security Token',
      });
    }
    const agentGroup = rawGroupPermissions.unwrap();

    return agentGroupToPermissionGroup(agentGroup, ticker, context);
  }

  /**
   * Retrieve all transactions for a given agent and asset
   *
   * @param opts.moduleId - type of the module to fetch
   * @param opts.eventId - type of the event to fetch
   * @param opts.size - page size
   * @param opts.start - page offset
   *
   * @note uses the middleware
   * @note supports pagination
   */
  public async getOperationHistory(
    opts: {
      moduleId?: ModuleId;
      eventId?: EventId;
      size?: number;
      start?: number;
    } = {}
  ): Promise<ResultSet<EventIdentifier>> {
    const { context, did, ticker } = this;

    /* eslint-disable @typescript-eslint/naming-convention */
    const { moduleId: pallet_name, eventId: event_id, size, start } = opts;

    const result = await context.queryMiddleware<Ensured<Query, 'tickerExternalAgentActions'>>(
      tickerExternalAgentActions({
        ticker,
        caller_did: did,
        pallet_name,
        event_id,
        count: size,
        skip: start,
      })
    );
    /* eslint-enable @typescript-eslint/naming-convention */

    const {
      data: { tickerExternalAgentActions: tickerExternalAgentActionsResult },
    } = result;

    const { items, totalCount: count } = tickerExternalAgentActionsResult;

    const data: EventIdentifier[] = [];
    let next = null;

    if (items) {
      items.forEach(item => {
        const { block_id: blockId, datetime, event_idx: eventIndex } = item;

        data.push({
          blockNumber: new BigNumber(blockId),
          blockDate: new Date(`${datetime}Z`),
          eventIndex,
        });
      });

      next = calculateNextKey(count, size, start);
    }

    return {
      data,
      next,
      count,
    };
  }
}
