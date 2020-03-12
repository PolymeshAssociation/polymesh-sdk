import { BigNumber } from 'bignumber.js';

import { Identity } from '~/api/entities';

export interface SecurityTokenDetails {
  name: string;
  totalSupply: BigNumber;
  isDivisible: boolean;
  owner: Identity;
}
