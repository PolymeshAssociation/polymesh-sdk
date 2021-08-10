import {
  Agent,
  Context,
  createGroup,
  CreateGroupParams,
  CustomPermissionGroup,
  inviteExternalAgent,
  InviteExternalAgentParams,
  KnownPermissionGroup,
  Namespace,
  removeExternalAgent,
  RemoveExternalAgentParams,
  SecurityToken,
} from '~/internal';
import { AgentWithGroup, PermissionGroupType, ProcedureMethod } from '~/types';
import {
  agentGroupToPermissionGroup,
  identityIdToString,
  stringToTicker,
  u32ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Security Token Permissions related functionality
 */
export class Permissions extends Namespace<SecurityToken> {
  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.createGroup = createProcedureMethod(
      { getProcedureAndArgs: args => [createGroup, { ticker, ...args }] },
      context
    );

    this.inviteAgent = createProcedureMethod(
      { getProcedureAndArgs: args => [inviteExternalAgent, { ticker, ...args }] },
      context
    );

    this.removeAgent = createProcedureMethod(
      { getProcedureAndArgs: args => [removeExternalAgent, { ticker, ...args }] },
      context
    );
  }

  /**
   * Create a Security Token Agent Group
   */
  public createGroup: ProcedureMethod<CreateGroupParams, CustomPermissionGroup>;

  /**
   * Invite a new external agent to this Security Token
   */
  public inviteAgent: ProcedureMethod<InviteExternalAgentParams, void>;

  /**
   * Remove an external agent from this Security Token
   */
  public removeAgent: ProcedureMethod<RemoveExternalAgentParams, void>;

  /**
   * Retrieve all group permissions of the Security Token
   */
  public async getGroups(): Promise<{
    known: KnownPermissionGroup[];
    custom: CustomPermissionGroup[];
  }> {
    const {
      context: {
        polymeshApi: {
          query: { externalAgents },
        },
      },
      context,
      parent: { ticker },
    } = this;

    const known = Object.values(PermissionGroupType).map(
      type => new KnownPermissionGroup({ type, ticker }, context)
    );

    const rawCustomPermissionGroups = await externalAgents.groupPermissions.entries(
      stringToTicker(ticker, context)
    );

    const custom: CustomPermissionGroup[] = rawCustomPermissionGroups.map(
      ([storageKey]) =>
        new CustomPermissionGroup({ ticker, id: u32ToBigNumber(storageKey.args[1]) }, context)
    );

    return {
      known,
      custom,
    };
  }

  /**
   * Retrieve a list of external agents of the Security Token
   */
  public async getAgents(): Promise<AgentWithGroup[]> {
    const {
      context: {
        polymeshApi: {
          query: { externalAgents },
        },
      },
      parent: { ticker },
      context,
    } = this;

    const groups = await externalAgents.groupOfAgent.entries(stringToTicker(ticker, context));

    return groups.map(([storageKey, agentGroup]) => {
      const rawAgentGroup = agentGroup.unwrap();
      return {
        agent: new Agent({ did: identityIdToString(storageKey.args[1]), ticker }, context),
        group: agentGroupToPermissionGroup(rawAgentGroup, ticker, context),
      };
    });
  }
}
