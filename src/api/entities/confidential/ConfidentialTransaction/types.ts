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
  assets: ConfidentialAsset[];
  auditors: ConfidentialAccount[];
  mediators: Identity[];
}
