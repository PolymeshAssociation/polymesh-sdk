import { TxTags } from '@polymathnetwork/polkadot/api/types';
import { Ticker } from '@polymathnetwork/polkadot/types/interfaces';
import { ISubmittableResult } from '@polymathnetwork/polkadot/types/types';

import { TickerReservation } from '~/api/entities';
import { PolymeshError, PostTransactionValue, Procedure } from '~/base';
import { Context } from '~/context';
import { ErrorCode, TickerReservationStatus } from '~/types';
import { balanceToBigNumber, findEventRecord, stringToTicker, tickerToString } from '~/utils';

export interface ReserveTickerParams {
  ticker: string;
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
  const { ticker } = args;

  const rawTicker = stringToTicker(ticker, context);

  const reservation = new TickerReservation({ ticker }, context);

  const [
    rawFee,
    balance,
    { max_ticker_length: rawMaxTickerLength },
    { expiryDate, status },
  ] = await Promise.all([
    query.asset.tickerRegistrationFee(),
    context.accountBalance(),
    query.asset.tickerConfig(),
    reservation.details(),
  ]);

  if (status === TickerReservationStatus.TokenCreated) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `A Security Token with ticker "${ticker} already exists`,
    });
  }

  if (status === TickerReservationStatus.Reserved) {
    const isPermanent = expiryDate === null;

    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `Ticker "${ticker}" already reserved. The current reservation will ${
        !isPermanent ? '' : 'not '
      }expire${!isPermanent ? ` at ${expiryDate}` : ''}`,
    });
  }

  const maxTickerLength = rawMaxTickerLength.toNumber();

  if (ticker.length > maxTickerLength) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `Ticker length cannot exceed ${maxTickerLength}`,
    });
  }

  const fee = balanceToBigNumber(rawFee);

  if (balance.lt(fee)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Not enough POLY balance to pay for ticker reservation',
    });
  }

  const [newReservation] = this.addTransaction(
    tx.asset.registerTicker,
    {
      tag: TxTags.asset.RegisterTicker,
      fee,
      resolvers: [createTickerReservationResolver(context)],
    },
    rawTicker
  );

  return newReservation;
}

export const reserveTicker = new Procedure(prepareReserveTicker);
