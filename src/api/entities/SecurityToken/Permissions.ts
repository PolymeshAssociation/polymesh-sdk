import {
  Context,
  createGroup,
  CreateGroupParams,
  CustomPermissionGroup,
  Identity,
  KnownPermissionGroup,
  Namespace,
  SecurityToken,
} from '~/internal';
import { ExternalAgent, PermissionGroupType, ProcedureMethod } from '~/types';
import { agentGroupToPermissionGroup, identityIdToString, stringToTicker, u32ToBigNumber } from '~/utils/conversion';
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
  }

  /**
   * Create a Security Token Agent Group
   */
  public createGroup: ProcedureMethod<CreateGroupParams, CustomPermissionGroup>;

  /**
   * Retrieve all group permissions of the Security Token
   */
  public async getGroups(): Promise<(CustomPermissionGroup | KnownPermissionGroup)[]> {
    const {
      context: {
        polymeshApi: {
          query: { externalAgents },
        },
      },
      context,
      parent: { ticker },
    } = this;

    const knownPermissionGroups = Object.values(PermissionGroupType).map(
      type => new KnownPermissionGroup({ type, ticker }, context)
    );

    const rawCustomPermissionGroups = await externalAgents.groupPermissions.entries(
      stringToTicker(ticker, context)
    );

    const customPermissionGroups: CustomPermissionGroup[] = rawCustomPermissionGroups.map(
      ([storageKey]) =>
        new CustomPermissionGroup({ ticker, id: u32ToBigNumber(storageKey.args[1]) }, context)
    );

    return [...knownPermissionGroups, ...customPermissionGroups];
  }

  /**
   * Retrieve a list of external agents of the Security Token
   */
  public async getAgents(): Promise<ExternalAgent[]> {
    const {
      context: {
        polymeshApi: {
          query: { externalAgents },
        },
      },
      parent: { ticker },
      context,
    } = this;

    const groupOfAgent = await externalAgents.groupOfAgent.entries(stringToTicker(ticker, context));

    const agentIdentities: ExternalAgent[] = [];

    groupOfAgent.forEach(([storageKey, agentGroup]) => {
      const rawAgentGroup = agentGroup.unwrap();
      agentIdentities.push({
        identity: new Identity({ did: identityIdToString(storageKey.args[1]) }, context),
        group: agentGroupToPermissionGroup(rawAgentGroup),
      });
    });

    return agentIdentities;
  }
}
