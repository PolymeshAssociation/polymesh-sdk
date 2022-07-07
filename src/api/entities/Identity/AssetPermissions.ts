import { BlockNumber, Hash } from '@polkadot/types/interfaces/runtime';
import BigNumber from 'bignumber.js';
import P from 'bluebird';

import {
  Asset,
  Context,
  CustomPermissionGroup,
  Identity,
  KnownPermissionGroup,
  Namespace,
  PolymeshError,
  setPermissionGroup,
  waivePermissions,
} from '~/internal';
import { eventByIndexedArgs, tickerExternalAgentActions } from '~/middleware/queries';
import { EventIdEnum as EventId, ModuleIdEnum as ModuleId, Query } from '~/middleware/types';
import {
  AssetWithGroup,
  CheckPermissionsResult,
  ErrorCode,
  EventIdentifier,
  ModuleName,
  PermissionType,
  ProcedureMethod,
  ResultSet,
  SetPermissionGroupParams,
  SignerType,
  TxTag,
  TxTags,
  WaivePermissionsParams,
} from '~/types';
import { Ensured, QueryReturnType } from '~/types/utils';
import { MAX_TICKER_LENGTH } from '~/utils/constants';
import {
  agentGroupToPermissionGroup,
  bigNumberToU32,
  extrinsicPermissionsToTransactionPermissions,
  hashToString,
  middlewareEventToEventIdentifier,
  stringToIdentityId,
  stringToTicker,
  tickerToString,
} from '~/utils/conversion';
import {
  asTicker,
  calculateNextKey,
  createProcedureMethod,
  isModuleOrTagMatch,
  optionize,
  padString,
} from '~/utils/internal';

/**
 * @hidden
 *
 * Check whether a tag is "present" in (represented by) a set of values and exceptions, using the following criteria:
 *
 * - if type is include:
 *   the passed tags are in the values array AND are not in the exceptions array (isInValues && !isInExceptions)
 * - if type is exclude:
 *   the passed tags are not in the values array OR are in the exceptions array (!isInValues || isInExceptions)
 */
function isPresent(
  tag: TxTag,
  values: (TxTag | ModuleName)[],
  exceptions: TxTag[] | undefined,
  flipResult: boolean
): boolean {
  const isInValues = values.some(value => isModuleOrTagMatch(value, tag));
  const isInExceptions = !!exceptions?.includes(tag);

  const result = isInValues && !isInExceptions;

  return flipResult ? result : !result;
}

/**
 * Handles all Asset Permissions (External Agents) related functionality on the Identity side
 */
export class AssetPermissions extends Namespace<Identity> {
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
   * Retrieve all the Assets over which this Identity has permissions, with the corresponding Permission Group
   */
  public async get(): Promise<AssetWithGroup[]> {
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
    const assetEntries = await externalAgents.agentOf.entries(rawDid);

    return P.map(assetEntries, async ([key]) => {
      const ticker = tickerToString(key.args[1]);
      const asset = new Asset({ ticker }, context);
      const group = await this.getGroup({ asset });

      return {
        asset,
        group,
      };
    });
  }

  /**
   * Check whether this Identity has specific transaction Permissions over an Asset
   */
  public async checkPermissions(args: {
    asset: Asset | string;
    transactions: TxTag[] | null;
  }): Promise<CheckPermissionsResult<SignerType.Identity>> {
    const {
      context: {
        polymeshApi: {
          query: { externalAgents },
        },
      },
      context,
      parent: { did },
    } = this;
    const { asset, transactions } = args;

    if (transactions?.length === 0) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Cannot check Permissions for an empty transaction array',
      });
    }

    const ticker = asTicker(asset);
    const rawTicker = stringToTicker(ticker, context);

    const groupOption = await externalAgents.groupOfAgent(
      rawTicker,
      stringToIdentityId(did, context)
    );

    if (groupOption.isNone) {
      return {
        missingPermissions: transactions,
        result: false,
        message: 'The Identity is not an Agent for the Asset',
      };
    }

    const group = groupOption.unwrap();

    if (group.isFull) {
      return {
        result: true,
      };
    }

    let missingPermissions: TxTag[];

    if (group.isCustom) {
      const groupId = group.asCustom;

      const groupPermissionsOption = await externalAgents.groupPermissions(rawTicker, groupId);

      const permissions = extrinsicPermissionsToTransactionPermissions(
        groupPermissionsOption.unwrap()
      );

      if (permissions === null) {
        return {
          result: true,
        };
      }

      if (transactions === null) {
        return {
          result: false,
          missingPermissions: null,
        };
      }

      const { type, exceptions, values } = permissions;

      const isInclude = type === PermissionType.Include;

      missingPermissions = transactions.filter(
        tag => !isPresent(tag, values, exceptions, isInclude)
      );
    }

    if (transactions === null) {
      return {
        result: false,
        missingPermissions: null,
      };
    }

    /*
     * Not authorized:
     *   - externalAgents
     */
    if (group.isExceptMeta) {
      missingPermissions = transactions.filter(
        tag => tag.split('.')[0] === ModuleName.ExternalAgents
      );
    }

    /*
     * Authorized:
     *   - asset.issue
     *   - asset.redeem
     *   - asset.controllerTransfer
     *   - sto (except for sto.invest)
     */
    if (group.isPolymeshV1PIA) {
      missingPermissions = transactions.filter(tag => {
        const isSto = tag.split('.')[0] === ModuleName.Sto && tag !== TxTags.sto.Invest;
        const isAsset = (<TxTag[]>[
          TxTags.asset.Issue,
          TxTags.asset.Redeem,
          TxTags.asset.ControllerTransfer,
        ]).includes(tag);

        return !isSto && !isAsset;
      });
    }

    /*
     * Authorized:
     *   - corporateAction
     *   - corporateBallot
     *   - capitalDistribution
     */
    if (group.isPolymeshV1CAA) {
      missingPermissions = transactions.filter(
        tag =>
          ![
            ModuleName.CorporateAction,
            ModuleName.CorporateBallot,
            ModuleName.CapitalDistribution,
          ].includes(tag.split('.')[0] as ModuleName)
      );
    }

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    if (missingPermissions!.length) {
      return {
        missingPermissions: missingPermissions!,
        result: false,
      };
    }
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    return {
      result: true,
    };
  }

  /**
   * Check whether this Identity has specific transaction Permissions over an Asset
   *
   * @deprecated in favor of `checkPermissions`
   */
  public async hasPermissions(args: {
    asset: Asset | string;
    transactions: TxTag[] | null;
  }): Promise<boolean> {
    const { result } = await this.checkPermissions(args);

    return result;
  }

  /**
   * Retrieve this Identity's Permission Group for a specific Asset
   */
  public async getGroup({
    asset,
  }: {
    asset: string | Asset;
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

    const ticker = asTicker(asset);

    const rawTicker = stringToTicker(ticker, context);
    const rawIdentityId = stringToIdentityId(did, context);

    const rawGroupPermissions = await externalAgents.groupOfAgent(rawTicker, rawIdentityId);

    if (rawGroupPermissions.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'This Identity is no longer an Agent for this Asset',
      });
    }
    const agentGroup = rawGroupPermissions.unwrap();

    return agentGroupToPermissionGroup(agentGroup, ticker, context);
  }

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when this Identity was enabled/added as
   *   an Agent with permissions over a specific Asset
   *
   * @note uses the middleware
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async enabledAt({ asset }: { asset: string | Asset }): Promise<EventIdentifier | null> {
    const { context } = this;
    const ticker = asTicker(asset);

    const {
      data: { eventByIndexedArgs: event },
    } = await context.queryMiddleware<Ensured<Query, 'eventByIndexedArgs'>>(
      eventByIndexedArgs({
        // cSpell: disable-next-line
        moduleId: ModuleId.Externalagents,
        eventId: EventId.AgentAdded,
        eventArg1: padString(ticker, MAX_TICKER_LENGTH),
      })
    );

    return optionize(middlewareEventToEventIdentifier)(event);
  }

  /**
   * Abdicate from the current Permissions Group for a given Asset. This means that this Identity will no longer have any permissions over said Asset
   */
  public waive: ProcedureMethod<WaivePermissionsParams, void>;

  /**
   * Assign this Identity to a different Permission Group for a given Asset
   */
  public setGroup: ProcedureMethod<
    SetPermissionGroupParams,
    CustomPermissionGroup | KnownPermissionGroup
  >;

  /**
   * Retrieve all Events triggered by Operations this Identity has performed on a specific Asset
   *
   * @param opts.moduleId - filters results by module
   * @param opts.eventId - filters results by event
   * @param opts.size - page size
   * @param opts.start - page offset
   *
   * @note uses the middleware
   * @note supports pagination
   */
  public async getOperationHistory(opts: {
    asset: string | Asset;
    moduleId?: ModuleId;
    eventId?: EventId;
    size?: BigNumber;
    start?: BigNumber;
  }): Promise<ResultSet<EventIdentifier>> {
    const {
      context: {
        polymeshApi: {
          query: { system },
        },
      },
      context,
      parent: { did },
    } = this;

    /* eslint-disable @typescript-eslint/naming-convention */
    const { asset, moduleId: pallet_name, eventId: event_id, size, start } = opts;

    const ticker = asTicker(asset);

    const result = await context.queryMiddleware<Ensured<Query, 'tickerExternalAgentActions'>>(
      tickerExternalAgentActions({
        ticker,
        caller_did: did,
        pallet_name,
        event_id,
        count: size?.toNumber(),
        skip: start?.toNumber(),
      })
    );
    /* eslint-enable @typescript-eslint/naming-convention */

    const {
      data: { tickerExternalAgentActions: tickerExternalAgentActionsResult },
    } = result;

    const { items, totalCount } = tickerExternalAgentActionsResult;

    const multiParams: BlockNumber[] = [];
    const data: Omit<EventIdentifier, 'blockHash'>[] = [];

    items.forEach(item => {
      const { block_id: blockId, datetime, event_idx: eventIndex } = item;

      const blockNumber = new BigNumber(blockId);
      multiParams.push(bigNumberToU32(blockNumber, context));
      data.push({
        blockNumber,
        blockDate: new Date(`${datetime}Z`),
        eventIndex: new BigNumber(eventIndex),
      });
    });

    let hashes: Hash[] = [];

    if (multiParams.length) {
      hashes = await system.blockHash.multi<QueryReturnType<typeof system.blockHash>>(multiParams);
    }

    const count = new BigNumber(totalCount);
    const next = calculateNextKey(count, size, start);

    return {
      data: data.map((event, index) => ({
        ...event,
        blockHash: hashToString(hashes[index]),
      })),
      next,
      count,
    };
  }
}
