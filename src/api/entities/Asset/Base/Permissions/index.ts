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
   * @note the signing Identity must be an agent of this Asset holding `externalAgents.acceptBecomeAgent`
   *   permission — granted by `TxGroup.ExternalAgentManagement` or `PermissionGroupType.Full`. The chain
   *   checks this when the `target` accepts, against the Identity that created the Authorization Request,
   *   so an invitation sent without it can never be accepted. If no existing Permission Group matches the
   *   requested permissions, `externalAgents.createGroupAndAddAuth` permission is also required
   *
   * @note this will create an {@link AuthorizationRequest | Authorization Request} which has to be accepted by the `target` Identity.
   *   An {@link api/entities/Account!Account | Account} or {@link Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
   */
  public inviteAgent: ProcedureMethod<InviteExternalAgentParams, AuthorizationRequest>;

  /**
   * Revoke an agent's permissions over this Asset
   */
  public removeAgent: ProcedureMethod<RemoveExternalAgentParams, void>;

  /**
   * Retrieve a Custom Permission Group by its ID
   *
   * @param args.id - Permission Group identifier
   *
   * @returns Promise that resolves to the Custom Permission Group
   *
   * @throws if there is no Permission Group with the passed ID
   */
  public async getGroup(args: { id: BigNumber }): Promise<CustomPermissionGroup>;

  /**
   * Retrieve a Known Permission Group by its type
   *
   * @param args.type - The Known Permission Group type
   *
   * @returns Promise that resolves to the Known Permission Group
   */
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
