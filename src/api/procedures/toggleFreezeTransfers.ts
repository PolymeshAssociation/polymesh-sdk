import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
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
      polymeshApi: {
        tx: { asset },
      },
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
        code: ErrorCode.NoDataChange,
        message: 'The Security Token is already frozen',
      });
    }

    this.addTransaction({
      transaction: asset.freeze,
      args: [rawTicker],
    });
  } else {
    if (!isFrozen) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The Security Token is already unfrozen',
      });
    }

    this.addTransaction({
      transaction: asset.unfreeze,
      args: [rawTicker],
    });
  }

  return securityToken;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, SecurityToken>,
  { ticker, freeze }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [freeze ? TxTags.asset.Freeze : TxTags.asset.Unfreeze],
      tokens: [new SecurityToken({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const toggleFreezeTransfers = (): Procedure<Params, SecurityToken> =>
  new Procedure(prepareToggleFreezeTransfers, getAuthorization);
