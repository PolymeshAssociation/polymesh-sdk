import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { stringToTicker } from '~/utils/conversion';

/**
 * @hidden
 */
export interface Params {
  ticker: string;
}

/**
 * @hidden
 */
export async function prepareRemoveCorporateActionsAgent(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { corporateAction },
      },
    },
    context,
  } = this;

  const { ticker } = args;

  const securityToken = new SecurityToken({ ticker }, context);

  const [{ owner }, agent] = await Promise.all([
    securityToken.details(),
    securityToken.corporateActions.getAgent(),
  ]);

  if (owner.did === agent.did) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You cannot remove the corporate actions agent',
    });
  }

  this.addTransaction(corporateAction.resetCaa, {}, stringToTicker(ticker, context));
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
export const removeCorporateActionsAgent = new Procedure(
  prepareRemoveCorporateActionsAgent,
  getAuthorization
);
