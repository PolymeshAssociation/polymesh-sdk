import { Identity } from '~/internal';

export enum VenueType {
  /**
   * Default type
   */
  Other = 'Other',
  /**
   * Primary issuance
   */
  Distribution = 'Distribution',
  /**
   * Offering/Fundraise
   */
  Sto = 'Sto',
  Exchange = 'Exchange',
}

export interface VenueDetails {
  type: VenueType;
  owner: Identity;
  description: string;
}
