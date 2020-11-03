import BigNumber from 'bignumber.js';

import { SecurityToken } from '~/api/entities';

export interface PortfolioBalance {
  token: SecurityToken;
  total: BigNumber;
  locked: BigNumber;
}

export interface PortfolioItem {
  token: string | SecurityToken;
  amount: BigNumber;
}
