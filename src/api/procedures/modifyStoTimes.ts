import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure, SecurityToken, Sto } from '~/internal';
import { Moment } from '~/polkadot';
import { ErrorCode, RoleType, StoStatus, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { dateToMoment, numberToU64, stringToTicker } from '~/utils/conversion';

export type ModifyStoTimesParams =
  | {
      start?: Date;
      end: Date | null;
    }
  | {
      start: Date;
      end?: Date | null;
    }
  | { start: Date; end: Date | null };

/**
 * @hidden
 */
export type Params = ModifyStoTimesParams & {
  id: BigNumber;
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareModifyStoTimes(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { sto: txSto },
      },
    },
    context,
  } = this;
  const { ticker, id, start: newStart, end: newEnd } = args;

  const sto = new Sto({ ticker, id }, context);

  const { status, end, start } = await sto.details();

  if (status === StoStatus.Closed) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The STO is already closed',
    });
  }

  if ((!newStart || start === newStart) && (newEnd === undefined || end === newEnd)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Nothing to modify',
    });
  }

  const now = new Date();

  if (end && now > end) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The STO has already ended',
    });
  }

  if (now > start && newStart) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Cannot modify the start time of an STO that already started',
    });
  }

  if ((newStart && now > newStart) || (newEnd && now > newEnd)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'New dates are in the past',
    });
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawId = numberToU64(id, context);
  const rawStart = newStart ? dateToMoment(newStart, context) : dateToMoment(start, context);
  let rawEnd: Moment | null;

  if (newEnd === null) {
    rawEnd = null;
  } else if (!newEnd) {
    console.log('END', end);
    rawEnd = end ? dateToMoment(end, context) : null;
  } else {
    rawEnd = dateToMoment(newEnd, context);
  }

  this.addTransaction(txSto.modifyFundraiserWindow, {}, rawTicker, rawId, rawStart, rawEnd);
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
      transactions: [TxTags.sto.ModifyFundraiserWindow],
      tokens: [new SecurityToken({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const modifyStoTimes = new Procedure(prepareModifyStoTimes, getAuthorization);
