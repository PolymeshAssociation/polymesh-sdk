import BigNumber from 'bignumber.js';

import { SecurityToken } from '~/internal';
import { SettlementDirectionEnum, SettlementResultEnum } from '~/middleware/types';

export interface PortfolioBalance {
  token: SecurityToken;
  total: BigNumber;
  locked: BigNumber;
}

export interface SettlementLeg {
  token: SecurityToken;
  amount: BigNumber;
  direction: SettlementDirectionEnum;
}

export interface HistoryData {
  blockNumber: BigNumber;
  status: SettlementResultEnum;
  account: string;
  legs?: SettlementLeg[];
}
