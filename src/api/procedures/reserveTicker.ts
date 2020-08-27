import { ISubmittableResult } from '@polkadot/types/types';
import { Ticker } from 'polymesh-types/types';

import { TickerReservation } from '~/api/entities';
import { PolymeshError, PostTransactionValue, Procedure } from '~/base';
import { Context } from '~/context';
import { ErrorCode, Role, RoleType, TickerReservationStatus } from '~/types';
import { findEventRecord, stringToTicker, tickerToString } from '~/utils';

export interface ReserveTickerParams {
  ticker: string;
  extendPeriod?: boolean;
}

/**
 * @hidden
 * NOTE: this might seem redundant but it's done in case some mutation is done on the ticker on chain (e.g. upper case or truncating)
 */
export const createTickerReservationResolver = (context: Context) => (
  receipt: ISubmittableResult
): TickerReservation => {
  const eventRecord = findEventRecord(receipt, 'asset', 'TickerRegistered');
  const data = eventRecord.event.data;
  const newTicker = tickerToString(data[1] as Ticker);

  return new TickerReservation({ ticker: newTicker }, context);
};

/**
 * @hidden
 */
export async function prepareReserveTicker(
  this: Procedure<ReserveTickerParams, TickerReservation>,
  args: ReserveTickerParams
): Promise<PostTransactionValue<TickerReservation>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, extendPeriod = false } = args;

  if (ticker.length < 1 || ticker.length > 12 || ticker !== ticker.toUpperCase()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message:
        'The ticker must be between 1 and 12 characters long and cannot contain lower case letters',
    });
  }

  const rawTicker = stringToTicker(ticker, context);

  const reservation = new TickerReservation({ ticker }, context);

  const { expiryDate, status } = await reservation.details();

  if (status === TickerReservationStatus.TokenCreated) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `A Security Token with ticker "${ticker}" already exists`,
    });
  } else if (status === TickerReservationStatus.Reserved) {
    if (!extendPeriod) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: `Ticker "${ticker}" already reserved`,
        data: {
          expiryDate,
        },
      });
    }
  } else {
    if (extendPeriod) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Ticker not reserved or the reservation has expired',
      });
    }
  }

  const [newReservation] = this.addTransaction(
    tx.asset.registerTicker,
    {
      resolvers: [createTickerReservationResolver(context)],
    },
    rawTicker
  );

  return newReservation;
}

/**
 * @hidden
 * If extending a reservation, the user must be the ticker owner
 */
export function getRequiredRoles({ ticker, extendPeriod }: ReserveTickerParams): Role[] {
  return extendPeriod ? [{ type: RoleType.TickerOwner, ticker }] : [];
}

/**
 * @hidden
 */
export const reserveTicker = new Procedure(prepareReserveTicker, getRequiredRoles);
