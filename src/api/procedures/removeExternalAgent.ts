import { TxTags } from 'polymesh-types/types';

import {
  CustomPermissionGroup,
  Identity,
  KnownPermissionGroup,
  PolymeshError,
  Procedure,
  SecurityToken,
} from '~/internal';
import { ErrorCode, PermissionGroupType } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { stringToIdentityId, stringToTicker } from '~/utils/conversion';
import { getDid } from '~/utils/internal';

export interface RemoveExternalAgentParams {
  target: string | Identity;
}

/**
 * @hidden
 */
export type Params = RemoveExternalAgentParams & {
  ticker: string;
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
const isFullGroupType = (group: KnownPermissionGroup | CustomPermissionGroup): boolean =>
  group instanceof KnownPermissionGroup && group.type === PermissionGroupType.Full;

/**
 * @hidden
 */
export async function prepareRemoveExternalAgent(
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

  const { ticker, target } = args;

  const [currentAgents, did] = await Promise.all([
    token.permissions.getAgents(),
    getDid(target, context),
  ]);

  const agentWithGroup = currentAgents.find(({ agent: { did: agentDid } }) => agentDid === did);

  if (!agentWithGroup) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The target Identity is not an External Agent',
    });
  }

  if (isFullGroupType(agentWithGroup.group)) {
    const fullGroupAgents = currentAgents.filter(({ group }) => isFullGroupType(group));
    if (fullGroupAgents.length === 1) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message:
          'The target is the last agent with full permissions for this Security Token. There should always be at least one agent with full permissions',
      });
    }
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawAgent = stringToIdentityId(did, context);

  this.addTransaction(externalAgents.removeAgent, {}, rawTicker, rawAgent);
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
      transactions: [TxTags.externalAgents.RemoveAgent],
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
  { ticker }: Params
): Storage {
  const { context } = this;

  return {
    token: new SecurityToken({ ticker }, context),
  };
}

/**
 * @hidden
 */
export const removeExternalAgent = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareRemoveExternalAgent, getAuthorization, prepareStorage);
