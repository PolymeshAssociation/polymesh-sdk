import BigNumber from 'bignumber.js';

import { ConfidentialAccount, Identity } from '~/types';

export interface ConfidentialAssetDetails {
  owner: Identity;
  totalSupply: BigNumber;
  data: string;
  /**
   * optional ticker value if provided while creating the confidential Asset
   */
  ticker?: string;
}

export interface GroupedAuditors {
  auditors: ConfidentialAccount[];
  mediators: Identity[];
}
