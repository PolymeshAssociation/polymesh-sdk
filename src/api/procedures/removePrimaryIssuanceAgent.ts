import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
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
      code: ErrorCode.UnmetPrerequisite,
      message:
        'There must be one (and only one) Primary Issuance Agent assigned to this Security Token',
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
    permissions: {
      transactions: [TxTags.externalAgents.RemoveAgent],
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
