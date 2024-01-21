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
   * Custom data to be associated with the confidential Asset
   */
  data: string;
  /**
   * optional ticker to be assigned to the confidential Asset
   */
  ticker?: string;
  /**
   * List of auditors for the confidential Asset
   */
  auditors: (ConfidentialAccount | string)[];
  /**
   * optional list of mediators for the confidential Asset
   */
  mediators?: (Identity | string)[];
}

export interface CreateConfidentialAccountParams {
  publicKey: string;
}
