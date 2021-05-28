import { Identity } from '~/internal';

export enum TickerReservationStatus {
  /**
   * ticker hasn't been reserved or previous reservation expired
   */
  Free = 'Free',
  /**
   * ticker is currently reserved
   */
  Reserved = 'Reserved',
  /**
   * a Security Token using this ticker has already been created
   */
  TokenCreated = 'TokenCreated',
}

export interface TickerReservationDetails {
  /**
   * identity ID of the owner of the ticker, null if it hasn't been reserved
   */
  owner: Identity | null;
  /**
   * date at which the reservation expires, null if it never expires (permanent reservation or token already launched)
   */
  expiryDate: Date | null;
  status: TickerReservationStatus;
}
