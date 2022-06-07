import BigNumber from 'bignumber.js';

import { Identity } from '~/internal';

export interface DividendDistributionDetails {
  remainingFunds: BigNumber;
  /**
   * whether the unclaimed funds have been reclaimed
   */
  fundsReclaimed: boolean;
}

export interface DistributionParticipant {
  identity: Identity;
  amount: BigNumber;
  /**
   * percentage (0-100) of tax withholding for this participant
   */
  taxWithholdingPercentage: BigNumber;
  /**
   * amount to be paid to the participant after tax deductions
   */
  amountAfterTax: BigNumber;
  paid: boolean;
}

export { DividendDistributionParams } from '.';
