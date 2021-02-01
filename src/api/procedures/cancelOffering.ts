import BigNumber from 'bignumber.js';

import { FundraiserStatus } from '~/api/entities/Sto/types';
import { PolymeshError, Procedure, SecurityToken, Sto } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { numberToU64, stringToTicker } from '~/utils/conversion';

export interface CancelOfferingParams {
  id: BigNumber;
  ticker: string;
}

/**
 * @hidden
 */
export async function prepareCancelOffering(
  this: Procedure<CancelOfferingParams, void>,
  args: CancelOfferingParams
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: {
          sto: { stop },
        },
      },
    },
    context,
  } = this;
  const { ticker, id } = args;

  const sto = new Sto({ ticker, id }, context);

  const { status } = await sto.details();

  if (status === FundraiserStatus.Closed) {
    throw new PolymeshError({
      code: ErrorCode.FatalError,
      message: 'The offering is already closed',
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawId = numberToU64(id, context);

  this.addTransaction(stop, {}, rawTicker, rawId);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<CancelOfferingParams, void>,
  { ticker }: CancelOfferingParams
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
export const cancelOffering = new Procedure(prepareCancelOffering, getAuthorization);
