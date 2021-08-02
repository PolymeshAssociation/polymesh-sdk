import {
  Context,
  createGroup,
  CreateGroupParams,
  CustomPermissionGroup,
  Identity,
  inviteExternalAgent,
  InviteExternalAgentParams,
  Namespace,
  SecurityToken,
} from '~/internal';
import { ExternalAgent, PaginationOptions, ProcedureMethod, ResultSet } from '~/types';
import {
  agentGroupToPermissionGroup,
  identityIdToString,
  stringToTicker,
  tickerToString,
  u32ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod, requestPaginated } from '~/utils/internal';

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

    this.inviteAccount = createProcedureMethod(
      { getProcedureAndArgs: args => [inviteExternalAgent, { ticker, ...args }] },
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
  public inviteAccount: ProcedureMethod<InviteExternalAgentParams, void>;

  /**
   * Retrieve all custom group permissions of the Security Token
   *
   * @note supports pagination
   */
  public async getGroups(
    paginationOpts?: PaginationOptions
  ): Promise<ResultSet<CustomPermissionGroup>> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
      parent: { ticker },
    } = this;

    const { entries, lastKey: next } = await requestPaginated(
      query.externalAgents.groupPermissions,
      {
        arg: stringToTicker(ticker, context),
        paginationOpts,
      }
    );

    const data: CustomPermissionGroup[] = entries.map(
      ([storageKey]) =>
        new CustomPermissionGroup(
          { ticker: tickerToString(storageKey.args[0]), id: u32ToBigNumber(storageKey.args[1]) },
          context
        )
    );

    return {
      data,
      next,
    };
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
