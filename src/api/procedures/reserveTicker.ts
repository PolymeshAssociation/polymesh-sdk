import { ISubmittableResult } from '@polkadot/types/types';
import { Ticker, TxTags } from 'polymesh-types/types';

import {
  Context,
  PolymeshError,
  PostTransactionValue,
  Procedure,
  TickerReservation,
} from '~/internal';
import { ErrorCode, RoleType, TickerReservationStatus } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { stringToTicker, tickerToString } from '~/utils/conversion';
import { findEventRecord, isPrintableASCII } from '~/utils/internal';

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

  if (!isPrintableASCII(ticker)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Only printable ASCII is alowed as ticker name',
    });
  }

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
export function getAuthorization({
  ticker,
  extendPeriod,
}: ReserveTickerParams): ProcedureAuthorization {
  const auth: ProcedureAuthorization = {
    signerPermissions: {
      transactions: [TxTags.asset.RegisterTicker],
      tokens: [],
      portfolios: [],
    },
  };

  if (extendPeriod) {
    return { ...auth, identityRoles: [{ type: RoleType.TickerOwner, ticker }] };
  }

  return auth;
}

/**
 * @hidden
 */
export const reserveTicker = new Procedure(prepareReserveTicker, getAuthorization);
