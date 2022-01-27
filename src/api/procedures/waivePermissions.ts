import { Identity, PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { stringToTicker } from '~/utils/conversion';
import { getToken } from '~/utils/internal';

export interface WaivePermissionsParams {
  token: string | SecurityToken;
}

/**
 * @hidden
 */
export type Params = WaivePermissionsParams & {
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
export async function prepareWaivePermissions(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: { token },
  } = this;

  const { identity } = args;

  const agents = await token.permissions.getAgents();
  const isAgent = agents.some(agentWithGroup => agentWithGroup.agent.did === identity.did);

  if (!isAgent) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Identity is not an Agent for the Security Token',
    });
  }

  const rawTicker = stringToTicker(token.ticker, context);

  this.addTransaction({
    transaction: tx.externalAgents.abdicate,
    args: [rawTicker],
  });
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { identity: { did } }: Params
): ProcedureAuthorization {
  const {
    storage: { token },
  } = this;
  return {
    signerPermissions: {
      transactions: [TxTags.externalAgents.Abdicate],
      tokens: [token],
      portfolios: [],
    },
    roles: [{ type: RoleType.Identity, did }],
  };
}

/**
 * @hidden
 */
export function prepareStorage(this: Procedure<Params, void, Storage>, { token }: Params): Storage {
  const { context } = this;

  return {
    token: getToken(token, context),
  };
}

/**
 * @hidden
 */
export const waivePermissions = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareWaivePermissions, getAuthorization, prepareStorage);
