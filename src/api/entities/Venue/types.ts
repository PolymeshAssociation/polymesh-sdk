import BigNumber from 'bignumber.js';

import { Identity } from '~/internal';
import { InstructionStatusEnum } from '~/middleware/types';
import { InstructionDetails, Leg } from '~/types';

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

export type HistoricInstruction = Omit<InstructionDetails, 'status' | 'venue'> & {
  id: BigNumber;
  status: InstructionStatusEnum;
  venueId?: BigNumber;
  blockNumber: BigNumber;
  blockHash: string;
  legs: Leg[];
};
