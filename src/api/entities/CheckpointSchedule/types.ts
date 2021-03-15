import BigNumber from 'bignumber.js';

export interface ScheduleWithDetails {
  remainingCheckpoints: BigNumber;
  nextCheckpointDate: Date;
}
