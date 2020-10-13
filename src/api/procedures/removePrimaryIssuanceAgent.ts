import { Procedure } from '~/base';
import { Role, RoleType } from '~/types';
import { stringToTicker } from '~/utils';

/**
 * @hidden
 */
export type Params = {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareRemovePrimaryIssuanceAgent(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { asset },
      },
    },
    context,
  } = this;

  const { ticker } = args;

  const rawTicker = stringToTicker(ticker, context);

  this.addTransaction(asset.removePrimaryIssuanceAgent, {}, rawTicker);
}

/**
 * @hidden
 */
export function getRequiredRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TokenOwner, ticker }];
}

/**
 * @hidden
 */
export const removePrimaryIssuanceAgent = new Procedure(
  prepareRemovePrimaryIssuanceAgent,
  getRequiredRoles
);
