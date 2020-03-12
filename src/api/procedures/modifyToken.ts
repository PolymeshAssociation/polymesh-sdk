import { TxTags } from '@polymathnetwork/polkadot/api/types';
import { SecurityToken, Ticker } from '@polymathnetwork/polkadot/types/interfaces';
import { ISubmittableResult } from '@polymathnetwork/polkadot/types/types';

import { TickerReservation } from '~/api/entities';
import { PolymeshError, PostTransactionValue, Procedure } from '~/base';
import { Context } from '~/context';
import { ErrorCode, TickerReservationStatus } from '~/types';
import { balanceToBigNumber, findEventRecord, stringToTicker, tickerToString } from '~/utils';

export interface ModifyTokenParams {
  ticker: string;
  makeDivisible?: boolean;
}

/**
 * @hidden
 */
export async function prepareModifyToken(
  this: Procedure<ModifyTokenParams, SecurityToken>,
  args: ModifyTokenParams
): Promise<PostTransactionValue<TickerReservation>> {
  const {
    context: {
      polymeshApi: { query, tx },
    },
    context,
  } = this;
  const { ticker, makeDivisible } = args;

  const rawTicker = stringToTicker(ticker, context);

  const reservation = new TickerReservation({ ticker }, context);

  const [
    rawFee,
    balance,
    { max_ticker_length: rawMaxTickerLength },
    { ownerDid, expiryDate, status },
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
    if (!extendPeriod) {
      const isPermanent = expiryDate === null;

      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: `Ticker "${ticker}" already reserved. The current reservation will ${
          !isPermanent ? '' : 'not '
        }expire${!isPermanent ? ` at ${expiryDate}` : ''}`,
      });
    } else if (ownerDid !== context.currentIdentity?.did) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'You must be the owner of the ticker to extend its reservation period',
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

  const fee = balanceToBigNumber(rawFee);

  if (balance.lt(fee)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `Not enough POLY balance to pay for ticker ${
        extendPeriod ? 'period extension' : 'reservation'
      }`,
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

export const modifyToken = new Procedure(prepareModifyToken);
