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

export interface CreateConfidentialAssetParams {
  /**
   * custom data to be associated with the Confidential Asset
   */
  data: string;
  /**
   * optional ticker to be assigned to the Confidential Asset
   */
  ticker?: string;
  /**
   * list of auditors for the Confidential Asset
   */
  auditors: (ConfidentialAccount | string)[];
  /**
   * optional list of mediators for the Confidential Asset
   */
  mediators?: (Identity | string)[];
}

export interface CreateConfidentialAccountParams {
  publicKey: string;
}
