import BigNumber from 'bignumber.js';

import { CalendarPeriod } from '~/types';

export type ScheduleDetails = {
  remainingCheckpoints: BigNumber;
  nextCheckpointDate: Date;
};

export type ScheduleParams = {
  id: BigNumber;
  period: CalendarPeriod;
  start: Date;
  remaining: number;
  nextCheckpointDate: Date;
};
