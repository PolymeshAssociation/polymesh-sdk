import BigNumber from 'bignumber.js';

import { Checkpoint, CheckpointSchedule } from '~/internal';

export enum CaCheckpointType {
  Existing = 'Existing',
  Schedule = 'Schedule',
}

export type InputCaCheckpoint =
  | Checkpoint
  | CheckpointSchedule
  | Date
  | {
      type: CaCheckpointType.Existing;
      /**
       * identifier for an existing Checkpoint
       */
      id: BigNumber;
    }
  | {
      type: CaCheckpointType.Schedule;
      /**
       * identifier for a Checkpoint Schedule
       */
      id: BigNumber;
    };

export interface ScheduleNextCheckpoint {
  /**
   * identifier for the Checkpoint Schedule
   */
  id: BigNumber;
  /**
   * next Checkpoint creation date for this Schedule
   */
  nextAt: Date;
}

export interface NextCheckpoints {
  /**
   * closest upcoming Checkpoint creation date across all of the Asset's active Schedules
   */
  nextAt: Date;
  /**
   * total amount of pending Checkpoints across all of the Asset's active Schedules
   */
  totalPending: BigNumber;
  /**
   * next Checkpoint creation date for each active Schedule
   */
  schedules: ScheduleNextCheckpoint[];
}
