import { Procedure, SecurityToken } from '~/internal';
import { RoleType, TxTags } from '~/types';
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
export async function prepareCreateCheckpoint(
  this: Procedure<Params, SecurityToken>,
  args: Params
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: {
        tx: { checkpoint },
      },
    },
    context,
  } = this;
  const { ticker } = args;

  const rawTicker = stringToTicker(ticker, context);

  const securityToken = new SecurityToken({ ticker }, context);

  this.addTransaction(checkpoint.createCheckpoint, {}, rawTicker);

  return securityToken;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, SecurityToken>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    identityRoles: [{ type: RoleType.TokenOwner, ticker }],
    signerPermissions: {
      transactions: [TxTags.checkpoint.CreateCheckpoint],
      tokens: [new SecurityToken({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const createCheckpoint = new Procedure(prepareCreateCheckpoint, getAuthorization);
