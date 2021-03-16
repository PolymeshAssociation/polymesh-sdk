import BigNumber from 'bignumber.js';

import { CalendarPeriod } from '~/types';

export interface ScheduleDetails {
  remainingCheckpoints: number;
  nextCheckpointDate: Date;
}

export interface ScheduleParams {
  id: BigNumber;
  period: CalendarPeriod;
  start: Date;
  remaining: number;
  nextCheckpointDate: Date;
}
