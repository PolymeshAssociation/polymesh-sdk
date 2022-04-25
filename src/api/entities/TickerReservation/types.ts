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
   * an Asset using this ticker has already been created
   */
  AssetCreated = 'AssetCreated',
}

export interface TickerReservationDetails {
  /**
   * Identity ID of the owner of the ticker, null if it hasn't been reserved
   */
  owner: Identity | null;
  /**
   * date at which the reservation expires, null if it never expires (permanent reservation or Asset already launched)
   */
  expiryDate: Date | null;
  status: TickerReservationStatus;
}
