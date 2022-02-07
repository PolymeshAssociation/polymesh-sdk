import BigNumber from 'bignumber.js';

import { Params, UniqueIdentifiers } from '.';

export interface ScheduleDetails {
  remainingCheckpoints: BigNumber;
  nextCheckpointDate: Date;
}

export type CheckpointScheduleParams = Omit<UniqueIdentifiers & Params, 'ticker'>;
