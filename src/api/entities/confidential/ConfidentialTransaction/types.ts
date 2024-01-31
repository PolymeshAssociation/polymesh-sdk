import BigNumber from 'bignumber.js';

import { ConfidentialTransaction } from '~/internal';
import { ConfidentialAccount, ConfidentialAsset, Identity } from '~/types';

export interface GroupedTransactions {
  pending: ConfidentialTransaction[];
  executed: ConfidentialTransaction[];
  rejected: ConfidentialTransaction[];
}

export interface ConfidentialLeg {
  id: BigNumber;
  sender: ConfidentialAccount;
  receiver: ConfidentialAccount;
  /**
   * The auditors for the leg, grouped by asset they are auditors for. Note: the same auditor may appear for multiple assets
   */
  assetAuditors: { asset: ConfidentialAsset; auditors: ConfidentialAccount[] }[];
  mediators: Identity[];
}
