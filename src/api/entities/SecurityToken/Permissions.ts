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
   * Create a Permission group for this Security Token. Identities can then be assigned to said group as Agents. Agents assigned to a group have said group's permissions over this Security Token
   */
  public createGroup: ProcedureMethod<CreateGroupParams, CustomPermissionGroup>;

  /**
   * Invite an Identity to be an Agent with permissions over this Security Token
   */
  public inviteAgent: ProcedureMethod<InviteExternalAgentParams, void>;

  /**
   * Revoke an Agent's permissions for this Security Token
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
