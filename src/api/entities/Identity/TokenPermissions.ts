import BigNumber from 'bignumber.js';
import P from 'bluebird';

import {
  Context,
  CustomPermissionGroup,
  Identity,
  KnownPermissionGroup,
  Namespace,
  PolymeshError,
  SecurityToken,
  setPermissionGroup,
  SetPermissionGroupParams,
  waivePermissions,
  WaivePermissionsParams,
} from '~/internal';
import { eventByIndexedArgs, tickerExternalAgentActions } from '~/middleware/queries';
import {
  EventIdEnum as EventId,
  EventIdEnum,
  ModuleIdEnum as ModuleId,
  ModuleIdEnum,
  Query,
} from '~/middleware/types';
import {
  Ensured,
  ErrorCode,
  EventIdentifier,
  ModuleName,
  PermissionType,
  ProcedureMethod,
  ResultSet,
  TokenWithGroup,
  TxTag,
  TxTags,
} from '~/types';
import { MAX_TICKER_LENGTH } from '~/utils/constants';
import {
  agentGroupToPermissionGroup,
  extrinsicPermissionsToTransactionPermissions,
  middlewareEventToEventIdentifier,
  stringToIdentityId,
  stringToTicker,
  tickerToString,
} from '~/utils/conversion';
import {
  calculateNextKey,
  createProcedureMethod,
  getTicker,
  isModuleOrTagMatch,
  optionize,
  padString,
} from '~/utils/internal';

/**
 * Handles all Token Permissions (External Agents) related functionality on the Identity side
 */
export class TokenPermissions extends Namespace<Identity> {
  /**
   * @hidden
   */
  constructor(parent: Identity, context: Context) {
    super(parent, context);

    this.waive = createProcedureMethod(
      { getProcedureAndArgs: args => [waivePermissions, { ...args, identity: parent }] },
      context
    );

    this.setGroup = createProcedureMethod(
      { getProcedureAndArgs: args => [setPermissionGroup, { ...args, identity: parent }] },
      context
    );
  }

  /**
   * Retrieve all the Security Tokens over which this Identity has permissions, with the corresponding Permission Group
   */
  public async get(): Promise<TokenWithGroup[]> {
    const {
      context: {
        polymeshApi: {
          query: { externalAgents },
        },
      },
      parent: { did },
      context,
    } = this;

    const rawDid = stringToIdentityId(did, context);
    const tokenEntries = await externalAgents.agentOf.entries(rawDid);

    return P.map(tokenEntries, async ([key]) => {
      const ticker = tickerToString(key.args[1]);
      const token = new SecurityToken({ ticker }, context);
      const group = await this.getGroup({ token });

      return {
        token,
        group,
      };
    });
  }

  /**
   * Check whether this Identity has specific transaction Permissions over a Security Token
   */
  public async hasPermissions(args: {
    token: SecurityToken | string;
    transactions: TxTag[] | null;
  }): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { externalAgents },
        },
      },
      context,
      parent: { did },
    } = this;
    const { token, transactions } = args;

    const ticker = getTicker(token);
    const rawTicker = stringToTicker(ticker, context);

    const groupOption = await externalAgents.groupOfAgent(
      rawTicker,
      stringToIdentityId(did, context)
    );

    if (groupOption.isNone) {
      return false;
    }

    const group = groupOption.unwrap();

    if (group.isFull) {
      return true;
    }

    if (transactions === null) {
      return false;
    }

    /*
     * Not authorized:
     *   - externalAgents
     *   - identity.acceptAuthorization
     */
    if (group.isExceptMeta) {
      return !transactions.some(
        tag =>
          tag.split('.')[0] === ModuleName.ExternalAgents ||
          tag === TxTags.identity.AcceptAuthorization
      );
    }

    /*
     * Authorized:
     *   - asset.issue
     *   - asset.redeem
     *   - asset.controllerTransfer
     *   - sto (except for sto.invest)
     */
    if (group.isPolymeshV1Pia) {
      return transactions.every(tag => {
        const isSto = tag.split('.')[0] === ModuleName.Sto && tag !== TxTags.sto.Invest;
        const isAsset = (<TxTag[]>[
          TxTags.asset.Issue,
          TxTags.asset.Redeem,
          TxTags.asset.ControllerTransfer,
        ]).includes(tag);

        return isSto || isAsset;
      });
    }

    /*
     * Authorized:
     *   - corporateAction
     *   - corporateBallot
     *   - capitalDistribution
     */
    if (group.isPolymeshV1Caa) {
      return transactions.every(tag =>
        [
          ModuleName.CorporateAction,
          ModuleName.CorporateBallot,
          ModuleName.CapitalDistribution,
        ].includes(tag.split('.')[0] as ModuleName)
      );
    }

    const groupId = group.asCustom;

    const groupPermissionsOption = await externalAgents.groupPermissions(rawTicker, groupId);

    const permissions = extrinsicPermissionsToTransactionPermissions(
      groupPermissionsOption.unwrap()
    );

    if (permissions === null) {
      return true;
    }

    const { type, exceptions, values } = permissions;

    /*
     * if type is include:
     *  all passed tags are in the values array AND are not in the exceptions array (isInValues && !isInExceptions)
     * if type is exclude:
     *  all passed tags are not in the values array OR are in the exceptions array (!isInValues || isInExceptions)
     */
    const isPresent = (tag: TxTag, flipResult: boolean) => {
      const isInValues = values.some(value => isModuleOrTagMatch(value, tag));
      const isInExceptions = !!exceptions?.includes(tag);

      const result = isInValues && !isInExceptions;

      return flipResult ? result : !result;
    };

    const isInclude = type === PermissionType.Include;

    return transactions.every(tag => isPresent(tag, isInclude));
  }

  /**
   * Retrieve this Identity's Permission Group for a specific Security Token
   */
  public async getGroup({
    token,
  }: {
    token: string | SecurityToken;
  }): Promise<CustomPermissionGroup | KnownPermissionGroup> {
    const {
      context: {
        polymeshApi: {
          query: { externalAgents },
        },
      },
      context,
      parent: { did },
    } = this;

    const ticker = getTicker(token);

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
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when this Identity was enabled/added as
   *   an Agent with permissions over a specific Security Token
   *
   * @note uses the middleware
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async enabledAt({
    token,
  }: {
    token: string | SecurityToken;
  }): Promise<EventIdentifier | null> {
    const { context } = this;
    const ticker = getTicker(token);

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

  /**
   * Abdicate from the current Permissions Group for a given Security Token. This means that this Identity will no longer have any permissions over said Token
   */
  public waive: ProcedureMethod<WaivePermissionsParams, void>;

  /**
   * Assign this Identity to a different Permission Group for a given Security Token
   */
  public setGroup: ProcedureMethod<
    SetPermissionGroupParams,
    CustomPermissionGroup | KnownPermissionGroup
  >;

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
  public async getOperationHistory(opts: {
    token: string;
    moduleId?: ModuleId;
    eventId?: EventId;
    size?: number;
    start?: number;
  }): Promise<ResultSet<EventIdentifier>> {
    const {
      context,
      parent: { did },
    } = this;

    /* eslint-disable @typescript-eslint/naming-convention */
    const { token, moduleId: pallet_name, eventId: event_id, size, start } = opts;

    const ticker = getTicker(token);

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
