import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { stringToIdentityId, stringToTicker } from '~/utils/conversion';

/**
 * @hidden
 */
export interface Params {
  ticker: string;
}

/**
 * @hidden
 *
 * @deprecated
 */
export async function prepareRemoveCorporateActionsAgent(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { externalAgents },
      },
    },
    context,
  } = this;

  const { ticker } = args;

  const securityToken = new SecurityToken({ ticker }, context);

  const agents = await securityToken.corporateActions.getAgents();

  if (agents.length !== 1) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message:
        'We can not perform this procedure with more than one Corporate Actions Agent involved',
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawIdentityId = stringToIdentityId(agents[0].did, context);

  this.addTransaction(externalAgents.removeAgent, {}, rawTicker, rawIdentityId);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    identityRoles: [{ type: RoleType.TokenOwner, ticker }],
    signerPermissions: {
      transactions: [TxTags.corporateAction.ResetCaa],
      tokens: [new SecurityToken({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removeCorporateActionsAgent = (): Procedure<Params, void> =>
  new Procedure(prepareRemoveCorporateActionsAgent, getAuthorization);
