import { ISubmittableResult } from '@polkadot/types/types';
import { Ticker } from 'polymesh-types/types';

import { TickerReservation } from '~/api/entities';
import { PolymeshError, PostTransactionValue, Procedure } from '~/base';
import { Context } from '~/context';
import { ErrorCode, Role, RoleType, TickerReservationStatus } from '~/types';
import {
  balanceToBigNumber,
  findEventRecord,
  posRatioToBigNumber,
  stringToTicker,
  tickerToString,
} from '~/utils';

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
  const newTicker = tickerToString(data[0] as Ticker);

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
      polymeshApi: { query, tx },
    },
    context,
  } = this;
  const { ticker, extendPeriod = false } = args;

  const rawTicker = stringToTicker(ticker, context);

  const reservation = new TickerReservation({ ticker }, context);

  // TODO: queryMulti
  const [
    rawPosRatio,
    rawRegisterTickerFee,
    balance,
    { max_ticker_length: rawMaxTickerLength },
    { expiryDate, status },
  ] = await Promise.all([
    query.protocolFee.coefficient(),
    query.protocolFee.baseFees('AssetRegisterTicker'),
    context.accountBalance(),
    query.asset.tickerConfig(),
    reservation.details(),
  ]);

  if (status === TickerReservationStatus.TokenCreated) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `A Security Token with ticker "${ticker}" already exists`,
    });
  }

  if (status === TickerReservationStatus.Reserved) {
    if (!extendPeriod) {
      const isPermanent = expiryDate === null;

      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: `Ticker "${ticker}" already reserved. The current reservation will ${
          !isPermanent ? '' : 'not '
        }expire${!isPermanent ? ` at ${expiryDate}` : ''}`,
      });
    }
  }

  if (!extendPeriod) {
    const maxTickerLength = rawMaxTickerLength.toNumber();

    if (ticker.length > maxTickerLength) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: `Ticker length cannot exceed ${maxTickerLength}`,
      });
    }
  } else {
    if (status === TickerReservationStatus.Free) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Ticker not reserved or the reservation has expired',
      });
    }
  }

  const ratio = posRatioToBigNumber(rawPosRatio);
  const registerTickerFee = balanceToBigNumber(rawRegisterTickerFee);
  const fee = registerTickerFee.dividedBy(ratio);

  if (balance.lt(fee)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `Not enough POLYX balance to pay for ticker ${
        extendPeriod ? 'period extension' : 'reservation'
      }`,
    });
  }

  const [newReservation] = this.addTransaction(
    tx.asset.registerTicker,
    {
      fee,
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

export const reserveTicker = new Procedure(prepareReserveTicker, getRequiredRoles);
