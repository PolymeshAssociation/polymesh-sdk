import { BigNumber } from 'bignumber.js';

import { Identity } from '~/api/entities';

export interface SecurityTokenDetails {
  assetType: string;
  isDivisible: boolean;
  name: string;
  owner: Identity;
  totalSupply: BigNumber;
}

/**
 * Represents the balance of a token holder
 */
export interface IdentityBalance {
  identity: Identity;
  balance: BigNumber;
}
