import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure, SecurityToken, Sto } from '~/internal';
import { ErrorCode, StoSaleStatus, StoTimingStatus, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { numberToU64, stringToTicker } from '~/utils/conversion';

export interface ToggleFreezeStoParams {
  id: BigNumber;
  freeze: boolean;
  ticker: string;
}

/**
 * @hidden
 */
export async function prepareToggleFreezeSto(
  this: Procedure<ToggleFreezeStoParams, Sto>,
  args: ToggleFreezeStoParams
): Promise<Sto> {
  const {
    context: {
      polymeshApi: {
        tx: { sto: txSto },
      },
    },
    context,
  } = this;
  const { ticker, id, freeze } = args;

  const rawTicker = stringToTicker(ticker, context);
  const rawId = numberToU64(id, context);

  const sto = new Sto({ ticker, id }, context);

  const {
    status: { timing, sale },
  } = await sto.details();

  if (timing === StoTimingStatus.Expired) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The STO has already ended',
    });
  }

  if (freeze) {
    if (sale === StoSaleStatus.Frozen) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The STO is already frozen',
      });
    }

    this.addTransaction({
      transaction: txSto.freezeFundraiser,
      args: [rawTicker, rawId],
    });
  } else {
    if ([StoSaleStatus.Closed, StoSaleStatus.ClosedEarly].includes(sale)) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The STO is already closed',
      });
    }

    if (sale !== StoSaleStatus.Frozen) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The STO is already unfrozen',
      });
    }

    this.addTransaction({
      transaction: txSto.unfreezeFundraiser,
      args: [rawTicker, rawId],
    });
  }

  return sto;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<ToggleFreezeStoParams, Sto>,
  { ticker, freeze }: ToggleFreezeStoParams
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [freeze ? TxTags.sto.FreezeFundraiser : TxTags.sto.UnfreezeFundraiser],
      tokens: [new SecurityToken({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const toggleFreezeSto = (): Procedure<ToggleFreezeStoParams, Sto> =>
  new Procedure(prepareToggleFreezeSto, getAuthorization);
