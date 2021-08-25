import {
  Context,
  CustomPermissionGroup,
  Identity,
  KnownPermissionGroup,
  PolymeshError,
} from '~/internal';
import { eventByIndexedArgs } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum, Query } from '~/middleware/types';
import { Ensured, ErrorCode, EventIdentifier } from '~/types';
import { MAX_TICKER_LENGTH } from '~/utils/constants';
import {
  agentGroupToPermissionGroup,
  middlewareEventToEventIdentifier,
  stringToIdentityId,
  stringToTicker} from '~/utils/conversion';
import { optionize, padString } from '~/utils/internal';

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
  }

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
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when this agent was added
   *
   * @note uses the middleware
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
   public async addedAt(): Promise<EventIdentifier | null> {
    const {
      ticker,
      context,
    } = this;

    const {
      data: { eventByIndexedArgs: event },
    } = await context.queryMiddleware<Ensured<Query, 'eventByIndexedArgs'>>(
      eventByIndexedArgs({
        moduleId: ModuleIdEnum.Externalagents,
        eventId: EventIdEnum.AgentAdded,
        eventArg1: padString(ticker, MAX_TICKER_LENGTH),
      })
    );

    return optionize(middlewareEventToEventIdentifier)(event);
  }
}
