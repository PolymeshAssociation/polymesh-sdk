import BigNumber from 'bignumber.js';

import {
  AuthorizationRequest,
  BaseAsset,
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
  assetToMeshAssetId,
  identityIdToString,
  u32ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Asset Permissions related functionality
 */
export class Permissions extends Namespace<BaseAsset> {
  /**
   * @hidden
   */
  constructor(parent: BaseAsset, context: Context) {
    super(parent, context);

    this.createGroup = createProcedureMethod(
      { getProcedureAndArgs: args => [createGroup, { asset: parent, ...args }] },
      context
    );

    this.inviteAgent = createProcedureMethod(
      { getProcedureAndArgs: args => [inviteExternalAgent, { asset: parent, ...args }] },
      context
    );

    this.removeAgent = createProcedureMethod(
      { getProcedureAndArgs: args => [removeExternalAgent, { asset: parent, ...args }] },
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
   * @note this will create an {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Request} which has to be accepted by the `target` Identity.
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
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
    const { parent, context } = this;

    if ('type' in args) {
      return new KnownPermissionGroup({ assetId: parent.id, type: args.type }, context);
    }

    const customGroup = new CustomPermissionGroup({ assetId: parent.id, id: args.id }, context);

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
      parent,
    } = this;

    const known = Object.values(PermissionGroupType).map(
      type => new KnownPermissionGroup({ type, assetId: parent.id }, context)
    );

    const rawAssetId = assetToMeshAssetId(parent, context);

    const rawCustomPermissionGroups = await externalAgents.groupPermissions.entries(rawAssetId);

    const custom: CustomPermissionGroup[] = rawCustomPermissionGroups.map(
      ([storageKey]) =>
        new CustomPermissionGroup(
          { assetId: parent.id, id: u32ToBigNumber(storageKey.args[1]) },
          context
        )
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
      parent,
      context,
    } = this;

    const rawAssetId = assetToMeshAssetId(parent, context);

    const groups = await externalAgents.groupOfAgent.entries(rawAssetId);

    return groups.map(([storageKey, agentGroup]) => {
      const rawAgentGroup = agentGroup.unwrap();
      return {
        agent: new Identity({ did: identityIdToString(storageKey.args[1]) }, context),
        group: agentGroupToPermissionGroup(rawAgentGroup, parent.id, context),
      };
    });
  }
}
