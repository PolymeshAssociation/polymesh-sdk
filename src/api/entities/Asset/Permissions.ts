import BigNumber from 'bignumber.js';

import {
  Asset,
  AuthorizationRequest,
  Context,
  createGroup,
  CustomPermissionGroup,
  Identity,
  inviteExternalAgent,
  KnownPermissionGroup,
  Namespace,
  PolymeshError,
  removeExternalAgent,
} from '~/internal';
import {
  AgentWithGroup,
  CreateGroupParams,
  ErrorCode,
  InviteExternalAgentParams,
  PermissionGroups,
  PermissionGroupType,
  ProcedureMethod,
  RemoveExternalAgentParams,
} from '~/types';
import {
  agentGroupToPermissionGroup,
  identityIdToString,
  stringToTicker,
  u32ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Asset Permissions related functionality
 */
export class Permissions extends Namespace<Asset> {
  /**
   * @hidden
   */
  constructor(parent: Asset, context: Context) {
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
   * Create a Permission Group for this Asset. Identities can be assigned to Permission Groups as agents. Agents assigned to a Permission Group have said group's permissions over the Asset
   */
  public createGroup: ProcedureMethod<CreateGroupParams, CustomPermissionGroup>;

  /**
   * Invite an Identity to be an agent with permissions over this Asset
   *
   * @note this will create an {@link AuthorizationRequest | Authorization Request} which has to be accepted by the `target` Identity.
   *   An {@link Account} or {@link Identity} can fetch its pending Authorization Requests by calling {@link Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link Authorizations.getOne | authorizations.getOne}
   */
  public inviteAgent: ProcedureMethod<InviteExternalAgentParams, AuthorizationRequest>;

  /**
   * Revoke an agent's permissions over this Asset
   */
  public removeAgent: ProcedureMethod<RemoveExternalAgentParams, void>;

  /**
   * Retrieve a single Permission Group by its ID (or type). Passing an ID will fetch a Custom Permission Group,
   *   while passing a type will fetch a Known Permission Group
   *
   * @throws if there is no Permission Group with the passed ID
   */
  public async getGroup(args: { id: BigNumber }): Promise<CustomPermissionGroup>;
  public async getGroup(args: { type: PermissionGroupType }): Promise<KnownPermissionGroup>;

  // eslint-disable-next-line require-jsdoc
  public async getGroup(
    args: { id: BigNumber } | { type: PermissionGroupType }
  ): Promise<CustomPermissionGroup | KnownPermissionGroup> {
    const {
      parent: { ticker },
      context,
    } = this;

    if ('type' in args) {
      return new KnownPermissionGroup({ ticker, type: args.type }, context);
    }

    const customGroup = new CustomPermissionGroup({ ticker, id: args.id }, context);

    const exists = await customGroup.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Permission Group does not exist',
      });
    }

    return customGroup;
  }

  /**
   * Retrieve all Permission Groups of this Asset
   */
  public async getGroups(): Promise<PermissionGroups> {
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
   * Retrieve a list of agents (Identities which have permissions over the Asset) and
   *   their respective Permission Groups
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
        agent: new Identity({ did: identityIdToString(storageKey.args[1]) }, context),
        group: agentGroupToPermissionGroup(rawAgentGroup, ticker, context),
      };
    });
  }
}
