import BigNumber from 'bignumber.js';
import P from 'bluebird';

import {
  BaseAsset,
  Context,
  CustomPermissionGroup,
  FungibleAsset,
  Identity,
  KnownPermissionGroup,
  Namespace,
  PolymeshError,
  setPermissionGroup,
  waivePermissions,
} from '~/internal';
import { tickerExternalAgentActionsQuery, tickerExternalAgentsQuery } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum, Query } from '~/middleware/types';
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
import { Ensured } from '~/types/utils';
import {
  agentGroupToPermissionGroup,
  extrinsicPermissionsToTransactionPermissions,
  middlewareEventDetailsToEventIdentifier,
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
      const asset = new FungibleAsset({ ticker }, context);
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
    asset: BaseAsset | string;
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
   * Retrieve this Identity's Permission Group for a specific Asset
   */
  public async getGroup({
    asset,
  }: {
    asset: string | BaseAsset;
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
   * @note uses the middlewareV2
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async enabledAt({
    asset,
  }: {
    asset: string | FungibleAsset;
  }): Promise<EventIdentifier | null> {
    const { context } = this;
    const ticker = asTicker(asset);

    const {
      data: {
        tickerExternalAgents: {
          nodes: [node],
        },
      },
    } = await context.queryMiddleware<Ensured<Query, 'tickerExternalAgents'>>(
      tickerExternalAgentsQuery({
        assetId: ticker,
      })
    );

    return optionize(middlewareEventDetailsToEventIdentifier)(node?.createdBlock, node?.eventIdx);
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
   * @note uses the middlewareV2
   * @note supports pagination
   */
  public async getOperationHistory(opts: {
    asset: string | FungibleAsset;
    moduleId?: ModuleIdEnum;
    eventId?: EventIdEnum;
    size?: BigNumber;
    start?: BigNumber;
  }): Promise<ResultSet<EventIdentifier>> {
    const {
      context,
      parent: { did },
    } = this;

    const { asset, moduleId: palletName, eventId, size, start } = opts;

    const ticker = asTicker(asset);

    const {
      data: {
        tickerExternalAgentActions: { nodes, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'tickerExternalAgentActions'>>(
      tickerExternalAgentActionsQuery(
        {
          assetId: ticker,
          callerId: did,
          palletName,
          eventId,
        },
        size,
        start
      )
    );

    const data = nodes.map(({ createdBlock, eventIdx }) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      middlewareEventDetailsToEventIdentifier(createdBlock!, eventIdx)
    );

    const count = new BigNumber(totalCount);
    const next = calculateNextKey(count, data.length, start);

    return {
      data,
      next,
      count,
    };
  }
}
