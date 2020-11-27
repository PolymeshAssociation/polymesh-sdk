import { BigNumber } from 'bignumber.js';

import { Identity } from '~/internal';

export interface SecurityTokenDetails {
  assetType: string;
  isDivisible: boolean;
  name: string;
  owner: Identity;
  totalSupply: BigNumber;
  primaryIssuanceAgent: Identity | null;
}

/**
 * Represents the balance of a token holder
 */
export interface IdentityBalance {
  identity: Identity;
  balance: BigNumber;
}

export interface TokenHolderOptions {
  canBeIssuedTo: boolean;
}

export interface TokenHolderProperties {
  canBeIssuedTo: boolean;
}
