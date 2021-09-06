import { AgentGroup, TxTags } from 'polymesh-types/types';

import { isFullGroupType } from '~/api/procedures/utils';
import {
  Context,
  createGroup,
  CustomPermissionGroup,
  KnownPermissionGroup,
  PolymeshError,
  PostTransactionValue,
  Procedure,
  SecurityToken,
} from '~/internal';
import { ErrorCode, Identity, isEntity, TransactionPermissions, TxGroup } from '~/types';
import { MaybePostTransactionValue, ProcedureAuthorization } from '~/types/internal';
import {
  permissionGroupIdentifierToAgentGroup,
  stringToIdentityId,
  stringToTicker,
} from '~/utils/conversion';
import { getToken } from '~/utils/internal';

export interface SetPermissionGroupParams {
  /**
   * Permission Group to assign to the Identity. The Security Token is inferred from the group.
   *   Optionally, transaction permissions and a Security Token can be passed directly.
   *   In that case, a new Permission Group will be created and consequently assigned to the Identity
   */
  group:
    | KnownPermissionGroup
    | CustomPermissionGroup
    | ({
        /**
         * Security Token over which the Identity will be granted permissions
         */
        token: string | SecurityToken;
      } & (
        | {
            transactions: TransactionPermissions;
          }
        | {
            transactionGroups: TxGroup[];
          }
      ));
}

/**
 * @hidden
 */
export type Params = SetPermissionGroupParams & {
  identity: Identity;
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

  const { identity, group } = args;
  const { ticker } = token;
  const { did } = identity;

  const [currentGroup, currentAgents] = await Promise.all([
    identity.tokenPermissions.getGroup({ token }),
    token.permissions.getAgents(),
  ]);

  if (isFullGroupType(currentGroup)) {
    const fullGroupAgents = currentAgents.filter(({ group: groupOfAgent }) =>
      isFullGroupType(groupOfAgent)
    );
    if (fullGroupAgents.length === 1) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message:
          'The target is the last Agent with full permissions for this Security Token. There should always be at least one Agent with full permissions',
      });
    }
  }

  if (!currentAgents.find(({ agent }) => agent.did === did)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The target must already be an Agent for the Security Token',
    });
  }

  let returnValue: MaybePostTransactionValue<CustomPermissionGroup | KnownPermissionGroup>;
  let rawAgentGroup;

  if (!isEntity(group)) {
    returnValue = await this.addProcedure(createGroup(), {
      ticker,
      permissions: group,
    });
    rawAgentGroup = (returnValue as PostTransactionValue<CustomPermissionGroup>).transform(
      customPermissionGroup => agentGroupResolver(customPermissionGroup, context)
    );
  } else {
    if (group.isEqual(currentGroup)) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The Agent is already part of this permission group',
      });
    }

    returnValue = group;
    rawAgentGroup = agentGroupResolver(group, context);
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
  { group }: Params
): Storage {
  const { context } = this;

  let token: string | SecurityToken;

  if (isEntity(group)) {
    ({ ticker: token } = group);
  } else {
    ({ token } = group);
  }

  return {
    token: getToken(token, context),
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
