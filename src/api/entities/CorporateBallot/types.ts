import { BallotMeta } from '~/types';

export interface CorporateBallotDetails {
  /**
   * description of the ballot
   */
  description: string;

  /**
   * declaration date of the ballot
   */
  declarationDate: Date;

  /**
   * start date of the ballot
   */
  startDate: Date;

  /**
   * end date of the ballot
   */
  endDate: Date;

  /**
   * meta data for the ballot
   */
  meta: BallotMeta;

  /**
   * whether rcv voting has been enabled
   */
  rcv: boolean;
}
