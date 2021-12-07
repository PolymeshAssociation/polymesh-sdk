import { BigNumber } from 'bignumber.js';

import { Checkpoint, CheckpointSchedule } from '~/types';

export enum InputCaCheckpoint {
  Existing = 'Existing',
  Schedule = 'Schedule',
}

export type CaCheckpointTypeParams =
  | Checkpoint
  | CheckpointSchedule
  | Date
  | {
      type: InputCaCheckpoint.Existing;
      /**
       * identifier for an existing Checkpoint
       */
      id: BigNumber;
    }
  | {
      type: InputCaCheckpoint.Schedule;
      /**
       * identifier for a Checkpoint Schedule
       */
      id: BigNumber;
    };
