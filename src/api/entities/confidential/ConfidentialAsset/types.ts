import BigNumber from 'bignumber.js';

import { Identity } from '~/internal';

export interface ConfidentialAssetDetails {
  ticker?: string;
  owner: Identity;
  data: string;
  totalSupply: BigNumber;
}
