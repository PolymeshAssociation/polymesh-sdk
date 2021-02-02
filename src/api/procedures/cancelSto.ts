import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure, SecurityToken, Sto } from '~/internal';
import { ErrorCode, RoleType, StoStatus, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { numberToU64, stringToTicker } from '~/utils/conversion';

export interface CancelStoParams {
  id: BigNumber;
}

/**
 * @hidden
 */
export type Params = CancelStoParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareCancelSto(this: Procedure<Params, void>, args: Params): Promise<void> {
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

  const { status } = await sto.details();

  if (status === StoStatus.Closed) {
    throw new PolymeshError({
      code: ErrorCode.FatalError,
      message: 'The STO is already closed',
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawId = numberToU64(id, context);

  this.addTransaction(txSto.stop, {}, rawTicker, rawId);
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
    identityRoles: [{ type: RoleType.TokenPia, ticker }],
    signerPermissions: {
      transactions: [TxTags.sto.Stop],
      tokens: [new SecurityToken({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const cancelSto = new Procedure(prepareCancelSto, getAuthorization);
