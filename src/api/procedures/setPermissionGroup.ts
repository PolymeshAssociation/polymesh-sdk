import { AgentGroup, TxTags } from 'polymesh-types/types';

import { isFullGroupType } from '~/api/procedures/utils';
import {
  Agent,
  Context,
  createGroup,
  CustomPermissionGroup,
  KnownPermissionGroup,
  PolymeshError,
  PostTransactionValue,
  Procedure,
  SecurityToken,
} from '~/internal';
import { ErrorCode, TransactionPermissions, TxGroup } from '~/types';
import { MaybePostTransactionValue, ProcedureAuthorization } from '~/types/internal';
import {
  permissionGroupIdentifierToAgentGroup,
  stringToIdentityId,
  stringToTicker,
} from '~/utils/conversion';

export interface SetPermissionGroupParams {
  /**
   * Permission Group to assign to the Agent. Optionally, transaction permissions can be passed directly.
   *   In that case, a new Permission Group will be created and consequently assigned to the Agent
   */
  group:
    | KnownPermissionGroup
    | CustomPermissionGroup
    | {
        transactions: TransactionPermissions;
      }
    | {
        transactionGroups: TxGroup[];
      };
}

/**
 * @hidden
 */
export type Params = SetPermissionGroupParams & {
  agent: Agent;
};

/**
 * @hidden
 */
export interface Storage {
  token: SecurityToken;
}

/**
 * @hidden
 */
const agentGroupResolver = (
  group: CustomPermissionGroup | KnownPermissionGroup,
  context: Context
): AgentGroup =>
  permissionGroupIdentifierToAgentGroup(
    group instanceof CustomPermissionGroup ? { custom: group.id } : group.type,
    context
  );

/**
 * @hidden
 */
export async function prepareSetPermissionGroup(
  this: Procedure<Params, CustomPermissionGroup | KnownPermissionGroup, Storage>,
  args: Params
): Promise<MaybePostTransactionValue<CustomPermissionGroup | KnownPermissionGroup>> {
  const {
    context: {
      polymeshApi: {
        tx: { externalAgents },
      },
    },
    context,
    storage: { token },
  } = this;

  const { agent, group } = args;
  const { ticker, did } = agent;

  const [currentGroup, currentAgents] = await Promise.all([
    agent.getPermissionGroup(),
    token.permissions.getAgents(),
  ]);

  if (isFullGroupType(currentGroup)) {
    const fullGroupAgents = currentAgents.filter(({ group: currentAgentsGroup }) =>
      isFullGroupType(currentAgentsGroup)
    );
    if (fullGroupAgents.length === 1) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message:
          'The target is the last Agent with full permissions for this Security Token. There should always be at least one agent with full permissions',
      });
    }
  }

  let rawAgentGroup;
  let returnValue: MaybePostTransactionValue<CustomPermissionGroup | KnownPermissionGroup>;

  if ('transactions' in group || 'transactionGroups' in group) {
    const postTransactionGroup = (await this.addProcedure(createGroup(), {
      ticker,
      permissions: group,
    })) as PostTransactionValue<CustomPermissionGroup>;
    rawAgentGroup = postTransactionGroup.transform(customPermissionGroup => agentGroupResolver(customPermissionGroup, context)
    );
    returnValue = postTransactionGroup;
  } else {
    if (group.isEqual(currentGroup)) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The Agent is already part of this permission group',
      });
    }

    rawAgentGroup = agentGroupResolver(group, context);
    returnValue = group;
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawIdentityId = stringToIdentityId(did, context);

  this.addTransaction(externalAgents.changeGroup, {}, rawTicker, rawIdentityId, rawAgentGroup);

  return returnValue;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, CustomPermissionGroup | KnownPermissionGroup, Storage>
): ProcedureAuthorization {
  const {
    storage: { token },
  } = this;
  return {
    permissions: {
      transactions: [TxTags.externalAgents.ChangeGroup],
      tokens: [token],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export function prepareStorage(
  this: Procedure<Params, CustomPermissionGroup | KnownPermissionGroup, Storage>,
  { agent: { ticker } }: Params
): Storage {
  const { context } = this;

  return {
    token: new SecurityToken({ ticker }, context),
  };
}

/**
 * @hidden
 */
export const setPermissionGroup = (): Procedure<
  Params,
  CustomPermissionGroup | KnownPermissionGroup,
  Storage
> => new Procedure(prepareSetPermissionGroup, getAuthorization, prepareStorage);
