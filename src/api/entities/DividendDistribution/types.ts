import BigNumber from 'bignumber.js';

export interface DividendDistributionDetails {
  remainingFunds: BigNumber;
  /**
   * whether the unclaimed funds have been reclaimed by the Corporate Actions Agent
   */
  fundsReclaimed: boolean;
}

export { DividendDistributionParams } from '.';
