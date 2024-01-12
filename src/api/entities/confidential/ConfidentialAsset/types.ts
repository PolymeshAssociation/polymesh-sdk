import BigNumber from 'bignumber.js';

import { Identity } from '~/internal';

export interface ConfidentialAssetDetails {
  owner: Identity;
  totalSupply: BigNumber;
  data: string;
  /**
   * optional ticker value if provided while creating the confidential Asset
   */
  ticker?: string;
}
