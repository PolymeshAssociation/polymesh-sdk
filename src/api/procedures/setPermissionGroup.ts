import { AgentGroup, TxTags } from 'polymesh-types/types';

import { CustomPermissionGroup } from '~/api/entities/CustomPermissionGroup';
import { KnownPermissionGroup } from '~/api/entities/KnownPermissionGroup';
import {
  Agent,
  Context,
  createGroup,
  PolymeshError,
  PostTransactionValue,
  Procedure,
  SecurityToken,
} from '~/internal';
import { ErrorCode, PermissionGroupType, TransactionPermissions, TxGroup } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  permissionGroupIdentifierToAgentGroup,
  stringToIdentityId,
  stringToTicker,
} from '~/utils/conversion';

export interface SetPermissionGroupParams {
  permissions:
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
  agent: Agent
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
 const isFullGroupType = (group: KnownPermissionGroup | CustomPermissionGroup): boolean =>
 group instanceof KnownPermissionGroup && group.type === PermissionGroupType.Full;

/**
 * @hidden
 */
export async function prepareSetPermissionGroup(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { externalAgents },
      },
    },
    context,
    storage: { token },
  } = this;

  const { agent, permissions } = args;
  const { ticker, did } = agent;

  try {
    const [currentGroup, currentAgents] = await Promise.all([
      agent.getPermissionGroup(),
      token.permissions.getAgents(),
    ]);

    // mover isFullGroupType de removeExternalAgents a algo global asi lo uso aca
    if (isFullGroupType(currentGroup)) {
      const fullGroupAgents = currentAgents.filter(({ group }) => isFullGroupType(group));
      if (fullGroupAgents.length === 1) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message:
            'The target is the last agent with full permissions for this Security Token. There should always be at least one agent with full permissions',
        });
      }
    }
    
    let rawAgentGroup;

    if ('transactions' in permissions || 'transactionGroups' in permissions) {
      const group = (await this.addProcedure(createGroup(), {
        ticker,
        permissions,
      })) as PostTransactionValue<CustomPermissionGroup>;
  
      rawAgentGroup = group.transform(customPermissionGroup =>
        agentGroupResolver(customPermissionGroup, context)
      );
    } else {
      if (
        (permissions instanceof CustomPermissionGroup &&
          currentGroup instanceof CustomPermissionGroup &&
          permissions.id === currentGroup.id) ||
        (permissions instanceof KnownPermissionGroup &&
          currentGroup instanceof KnownPermissionGroup &&
          permissions.type === currentGroup.type)
      ) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'The Agent is already part of this permission group',
        });
      }

      rawAgentGroup = agentGroupResolver(permissions, context)
    }

    const rawTicker = stringToTicker(ticker, context);
    const rawIdentityId = stringToIdentityId(did, context);
  
    this.addTransaction(externalAgents.changeGroup, {}, rawTicker, rawIdentityId, rawAgentGroup);

  } catch (_) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'This Identity is no longer an Agent for this Security Token',
    });
  }
}

/**
 * @hidden
 */
export function getAuthorization(this: Procedure<Params, void, Storage>): ProcedureAuthorization {
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
  this: Procedure<Params, void, Storage>,
  { agent: {ticker} }: Params
): Storage {
  const { context } = this;

  return {
    token: new SecurityToken({ ticker }, context),
  };
}

/**
 * @hidden
 */
export const setPermissionGroup = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareSetPermissionGroup, getAuthorization, prepareStorage);
