import BigNumber from 'bignumber.js';

import { BallotMeta, BallotMotion } from '~/types';

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

export enum CorporateBallotStatus {
  Pending = 'Pending',
  Active = 'Active',
  Closed = 'Closed',
}

type ChoiceWithVotes = {
  choice: string;
  votes: BigNumber;
};

export type CorporateBallotMotionWithResults = Pick<BallotMotion, 'title' | 'infoLink'> & {
  choices: ChoiceWithVotes[];
  total: BigNumber;
};

export type CorporateBallotMetaWithResults = Omit<BallotMeta, 'motions'> & {
  motions: CorporateBallotMotionWithResults[];
};

export type ChoiceWithParticipation = {
  choice: string;
  power: BigNumber;
  fallback?: string;
};

export type CorporateBallotMotionWithParticipation = Pick<BallotMotion, 'title' | 'infoLink'> & {
  choices: ChoiceWithParticipation[];
};

export type CorporateBallotWithParticipation = Omit<BallotMeta, 'motions'> & {
  motions: CorporateBallotMotionWithParticipation[];
};
