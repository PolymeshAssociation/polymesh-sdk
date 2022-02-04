import { BigNumber } from 'bignumber.js';

import { Checkpoint, CheckpointSchedule } from '~/types';

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
