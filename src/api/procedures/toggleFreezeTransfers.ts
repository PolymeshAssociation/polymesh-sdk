import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, Role, RoleType } from '~/types';
import { stringToTicker } from '~/utils/conversion';

export interface ToggleFreezeTransfersParams {
  freeze: boolean;
}

/**
 * @hidden
 */
export type Params = ToggleFreezeTransfersParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareToggleFreezeTransfers(
  this: Procedure<Params, SecurityToken>,
  args: Params
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, freeze } = args;

  const rawTicker = stringToTicker(ticker, context);

  const securityToken = new SecurityToken({ ticker }, context);

  const isFrozen = await securityToken.isFrozen();

  if (freeze) {
    if (isFrozen) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The Security Token is already frozen',
      });
    }

    this.addTransaction(tx.asset.freeze, {}, rawTicker);
  } else {
    if (!isFrozen) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The Security Token is already unfrozen',
      });
    }

    this.addTransaction(tx.asset.unfreeze, {}, rawTicker);
  }

  return securityToken;
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
export const toggleFreezeTransfers = new Procedure(prepareToggleFreezeTransfers, getRequiredRoles);
