import BigNumber from 'bignumber.js';

import { SecurityToken } from '~/internal';

export interface PortfolioBalance {
  token: SecurityToken;
  total: BigNumber;
  locked: BigNumber;
}
