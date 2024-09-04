import { ISubmittableResult } from '@polkadot/types/types';

import { Context, PolymeshError, Procedure, TickerReservation } from '~/internal';
import { ErrorCode, ReserveTickerParams, RoleType, TickerReservationStatus, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { stringToTicker, tickerToString } from '~/utils/conversion';
import { filterEventRecords, isAllowedCharacters } from '~/utils/internal';

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
): Promise<TransactionSpec<TickerReservation, ExtrinsicParams<'asset', 'registerUniqueTicker'>>> {
  const {
    context: {
      polymeshApi: { tx },
      isV6,
    },
    context,
  } = this;
  const { ticker, extendPeriod = false } = args;

  if (!isAllowedCharacters(ticker)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'New Tickers can only contain alphanumeric values "_", "-", ".", and "/"',
    });
  }

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

  let transaction = tx.asset.registerUniqueTicker;
  /* istanbul ignore if: this will be removed after dual version support for v6-v7 */
  if (isV6) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction = (tx.asset as any).registerTicker; // NOSONAR
  }

  return {
    transaction,
    args: [rawTicker],
    resolver: createTickerReservationResolver(context),
  };
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
      transactions: [TxTags.asset.RegisterUniqueTicker],
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
