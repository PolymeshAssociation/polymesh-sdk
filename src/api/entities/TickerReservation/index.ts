import { Entity } from '~/base';
import { Context } from '~/context';
import { identityIdToString, momentToDate } from '~/utils';

import { TickerReservationDetails, TickerReservationStatus } from './types';

/**
 * Properties that uniquely identify a TickerReservation
 */
export interface UniqueIdentifiers {
  ticker: string;
}

/**
 * Represents a reserved token symbol in the Polymesh chain. Ticker reservations expire
 * after a set length of time, after which they can be reserved by another identity.
 * A Ticker must be previously reserved by an identity for that identity to be able create a Security Token with it
 */
export class TickerReservation extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { ticker } = identifier as UniqueIdentifiers;

    return typeof ticker === 'string';
  }

  /**
   * reserved ticker
   */
  public ticker: string;

  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { ticker } = identifiers;

    this.ticker = ticker;
  }

  /**
   * Retrieve the reservation's owner, expiry date and status
   */
  public async details(): Promise<TickerReservationDetails> {
    const {
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      ticker,
    } = this;

    const [{ owner, expiry }, { owner_did: tokenOwner }] = await Promise.all([
      asset.tickers(ticker),
      asset.tokens(ticker),
    ]);

    const tickerOwned = !owner.isEmpty;
    const tokenOwned = !tokenOwner.isEmpty;

    let status: TickerReservationStatus;
    let expiryDate: Date | null = null;
    const ownerDid = tickerOwned ? identityIdToString(owner) : null;

    if (tokenOwned) {
      status = TickerReservationStatus.TokenCreated;
    } else if (tickerOwned) {
      status = TickerReservationStatus.Reserved;
      if (expiry.isSome) {
        expiryDate = momentToDate(expiry.unwrap());

        if (expiryDate < new Date()) {
          status = TickerReservationStatus.Free;
        }
      }
    } else {
      status = TickerReservationStatus.Free;
    }

    return {
      ownerDid,
      expiryDate,
      status,
    };
  }
}
