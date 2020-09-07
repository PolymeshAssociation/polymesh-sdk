import { Identity } from '~/api/entities';
import { Procedure } from '~/base';
import { Role, RoleType } from '~/types';
import { stringToIdentityId, stringToTicker, valueToDid } from '~/utils';

export type SetTreasuryDidParams = { target?: string | Identity };

/**
 * @hidden
 */
export type Params = { ticker: string } & SetTreasuryDidParams;

/**
 * @hidden
 */
export async function prepareSetTreasuryDid(
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
  const { ticker, target } = args;

  const rawTicker = stringToTicker(ticker, context);
  const rawTreasuryDid = target ? stringToIdentityId(valueToDid(target), context) : null;

  this.addTransaction(asset.setTreasuryDid, {}, rawTicker, rawTreasuryDid);
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
export const setTreasuryDid = new Procedure(prepareSetTreasuryDid, getRequiredRoles);
