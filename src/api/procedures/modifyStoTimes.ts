import BigNumber from 'bignumber.js';
import { Moment } from 'polymesh-types/types';

import { PolymeshError, Procedure, SecurityToken, Sto } from '~/internal';
import { ErrorCode, RoleType, StoSaleStatus, StoTimingStatus, TxTags } from '~/types';
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

  const {
    status: { sale, timing },
    end,
    start,
  } = await sto.details();

  if ([StoSaleStatus.Closed, StoSaleStatus.ClosedEarly].includes(sale)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The STO is already closed',
    });
  }

  const areSameTimes =
    (!newStart || start === newStart) && (newEnd === undefined || end === newEnd);

  if (areSameTimes) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Nothing to modify',
    });
  }

  const now = new Date();

  if (timing === StoTimingStatus.Expired) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The STO has already ended',
    });
  }

  if (timing !== StoTimingStatus.NotStarted && newStart) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Cannot modify the start time of an STO that already started',
    });
  }

  const datesAreInThePast = (newStart && now > newStart) || (newEnd && now > newEnd);

  if (datesAreInThePast) {
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
    rawEnd = end && dateToMoment(end, context);
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
export const modifyStoTimes = (): Procedure<Params, void> =>
  new Procedure(prepareModifyStoTimes, getAuthorization);
