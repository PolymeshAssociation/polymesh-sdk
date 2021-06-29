import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { stringToIdentityId, stringToTicker } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = {
  ticker: string;
};

/**
 * @hidden
 *
 * @deprecated
 */
export async function prepareRemovePrimaryIssuanceAgent(
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

  const { primaryIssuanceAgents } = await securityToken.details();

  if (primaryIssuanceAgents.length !== 1) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message:
        'We can not perform this procedure with more than one Primary Issuance Agent involved',
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawIdentityId = stringToIdentityId(primaryIssuanceAgents[0].did, context);

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
      transactions: [TxTags.asset.RemovePrimaryIssuanceAgent],
      tokens: [new SecurityToken({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removePrimaryIssuanceAgent = (): Procedure<Params, void> =>
  new Procedure(prepareRemovePrimaryIssuanceAgent, getAuthorization);
