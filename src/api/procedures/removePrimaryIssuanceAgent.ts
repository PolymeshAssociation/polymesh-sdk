import { Asset, PolymeshError, Procedure } from '~/internal';
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

  const asset = new Asset({ ticker }, context);

  const { primaryIssuanceAgents } = await asset.details();

  if (primaryIssuanceAgents.length !== 1) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'There must be one (and only one) Primary Issuance Agent assigned to this Asset',
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawIdentityId = stringToIdentityId(primaryIssuanceAgents[0].did, context);

  this.addTransaction({
    transaction: externalAgents.removeAgent,
    args: [rawTicker, rawIdentityId],
  });
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
      assets: [new Asset({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removePrimaryIssuanceAgent = (): Procedure<Params, void> =>
  new Procedure(prepareRemovePrimaryIssuanceAgent, getAuthorization);
