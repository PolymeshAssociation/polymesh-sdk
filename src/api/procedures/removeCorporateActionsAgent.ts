import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { corporateActionIdentifierToCaId } from '~/utils/conversion';

export interface RemoveCorporateActionsAgentParams {
  id: BigNumber;
}

/**
 * @hidden
 */
export type Params = {
  ticker: string;
} & RemoveCorporateActionsAgentParams;

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

  const { ticker, id: localId } = args;

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

  this.addTransaction(
    corporateAction.removeCa,
    {},
    corporateActionIdentifierToCaId({ ticker, localId }, context)
  );
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
      transactions: [TxTags.corporateAction.RemoveCa],
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
