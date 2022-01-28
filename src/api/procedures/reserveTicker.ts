import { ISubmittableResult } from '@polkadot/types/types';
import { TxTags } from 'polymesh-types/types';

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
import { filterEventRecords } from '~/utils/internal';

export interface ReserveTickerParams {
  /**
   * ticker symbol to reserve
   */
  ticker: string;
  extendPeriod?: boolean;
}

/**
 * @hidden
 * NOTE: this might seem redundant but it's done in case some mutation is done on the ticker on chain (e.g. upper case or truncating)
 */
export const createTickerReservationResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): TickerReservation => {
    const [{ data }] = filterEventRecords(receipt, 'asset', 'TickerRegistered');
    const newTicker = tickerToString(data[1]);

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

  const rawTicker = stringToTicker(ticker, context);

  const reservation = new TickerReservation({ ticker }, context);

  const { expiryDate, status } = await reservation.details();

  if (status === TickerReservationStatus.AssetCreated) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: `An Asset with ticker "${ticker}" already exists`,
    });
  } else if (status === TickerReservationStatus.Reserved) {
    if (!extendPeriod) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: `Ticker "${ticker}" already reserved`,
        data: {
          expiryDate,
        },
      });
    }
  } else {
    if (extendPeriod) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
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
    permissions: {
      transactions: [TxTags.asset.RegisterTicker],
      assets: [],
      portfolios: [],
    },
  };

  if (extendPeriod) {
    return { ...auth, roles: [{ type: RoleType.TickerOwner, ticker }] };
  }

  return auth;
}

/**
 * @hidden
 */
export const reserveTicker = (): Procedure<ReserveTickerParams, TickerReservation> =>
  new Procedure(prepareReserveTicker, getAuthorization);
