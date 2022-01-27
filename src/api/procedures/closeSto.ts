import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure, SecurityToken, Sto } from '~/internal';
import { ErrorCode, StoSaleStatus, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { numberToU64, stringToTicker } from '~/utils/conversion';

/**
 * @hidden
 */
export interface Params {
  ticker: string;
  id: BigNumber;
}

/**
 * @hidden
 */
export async function prepareCloseSto(this: Procedure<Params, void>, args: Params): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { sto: txSto },
      },
    },
    context,
  } = this;
  const { ticker, id } = args;

  const sto = new Sto({ ticker, id }, context);

  const {
    status: { sale },
  } = await sto.details();

  if ([StoSaleStatus.Closed, StoSaleStatus.ClosedEarly].includes(sale)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The STO is already closed',
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawId = numberToU64(id, context);

  this.addTransaction({
    transaction: txSto.stop,
    args: [rawTicker, rawId],
  });
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker }: Params
): ProcedureAuthorization {
  const { context } = this;
  return {
    permissions: {
      transactions: [TxTags.sto.Stop],
      tokens: [new SecurityToken({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const closeSto = (): Procedure<Params, void> =>
  new Procedure(prepareCloseSto, getAuthorization);
