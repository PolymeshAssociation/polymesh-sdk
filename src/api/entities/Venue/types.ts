import { Identity } from '~/api/entities';

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
  creator: Identity;
  description: string;
}
