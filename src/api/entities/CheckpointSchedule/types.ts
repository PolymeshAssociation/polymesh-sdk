import { Params, UniqueIdentifiers } from '.';

export interface ScheduleDetails {
  remainingCheckpoints: number;
  nextCheckpointDate: Date;
}

export type CheckpointScheduleParams = Omit<UniqueIdentifiers & Params, 'ticker'>;
