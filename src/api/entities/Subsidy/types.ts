import BigNumber from 'bignumber.js';

import { Account, Subsidy } from '~/internal';

export interface SubsidyData {
  /**
   * Account whose transactions are being paid for
   */
  beneficiary: Account;
  /**
   * Account that is paying for the transactions
   */
  subsidizer: Account;
  /**
   * amount of POLYX to be subsidized. This can be increased/decreased later on
   */
  allowance: BigNumber;
}

export interface SubsidyWithAllowance {
  subsidy: Subsidy;
  allowance: BigNumber;
}

export enum AllowanceOperation {
  Set = 'Set',
  Increase = 'Increase',
  Decrease = 'Decrease',
}
