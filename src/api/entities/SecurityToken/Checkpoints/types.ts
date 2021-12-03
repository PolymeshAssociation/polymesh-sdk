import { BigNumber } from 'bignumber.js';

import { Checkpoint, CheckpointSchedule } from '~/types';

export enum CaCheckpointType {
  Existing = 'Existing',
  Schedule = 'Schedule',
}

export type CaCheckpointTypeParams =
  | Checkpoint
  | CheckpointSchedule
  | Date
  | {
      type: CaCheckpointType.Existing;
      id: BigNumber;
    }
  | {
      type: CaCheckpointType.Schedule;
      id: BigNumber;
    };
