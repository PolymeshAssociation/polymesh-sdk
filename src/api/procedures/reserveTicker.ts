import { TxTags } from '@polymathnetwork/polkadot/api/types';
import { Ticker } from '@polymathnetwork/polkadot/types/interfaces';
import { ISubmittableResult } from '@polymathnetwork/polkadot/types/types';

import { TickerReservation } from '~/api/entities';
import { PolymeshError, PostTransactionValue, Procedure } from '~/base';
import { ErrorCode } from '~/types';
import {
  balanceToBigNumber,
  findEventRecord,
  momentToDate,
  stringToTicker,
  tickerToString,
} from '~/utils';

export interface ReserveTickerParams {
  ticker: string;
}

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
      currentPair,
    },
    context,
  } = this;
  const { ticker } = args;

  const rawTicker = stringToTicker(ticker, context);

  // TODO @monitz87: use accountBalance when MSDK-74 is implemented
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [
    rawFee,
    rawBalance,
    { owner, expiry: rawExpiry },
    token,
    { max_ticker_length: rawMaxTickerLength },
  ] = await Promise.all([
    query.asset.tickerRegistrationFee(),
    query.balances.freeBalance(currentPair?.address!),
    query.asset.tickers(rawTicker),
    query.asset.tokens(rawTicker),
    query.asset.tickerConfig(),
  ]);

  if (!owner.isEmpty) {
    const expiry = momentToDate(rawExpiry.unwrap());
    if (expiry > new Date()) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: `Ticker "${ticker}" already reserved. The current reservation will expire at ${expiry}`,
      });
    }
  }

  if (!token.owner_did.isEmpty) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `A Security Token with ticker "${ticker} already exists`,
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
  const balance = balanceToBigNumber(rawBalance);

  if (balance.lt(fee)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Not enough POLY balance to pay for ticker reservation',
    });
  }

  const [reservation] = this.addTransaction(
    tx.asset.registerTicker,
    {
      tag: TxTags.asset.RegisterTicker,
      fee,
      resolvers: [
        async (receipt: ISubmittableResult): Promise<TickerReservation> => {
          const eventRecord = findEventRecord(receipt, 'asset', 'TickerRegistered');
          const data = eventRecord.event.data;
          const newTicker = tickerToString(data[0] as Ticker);

          return new TickerReservation({ ticker: newTicker }, context);
        },
      ],
    },
    rawTicker
  );

  return reservation;
}

export const reserveTicker = new Procedure(prepareReserveTicker);
