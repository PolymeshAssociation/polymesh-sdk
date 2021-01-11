import BigNumber from 'bignumber.js';

import { Account, SecurityToken } from '~/internal';
import {
  SettlementDirectionEnum as SettlementDirection,
  SettlementResultEnum as SettlementResult,
} from '~/middleware/types';

export interface PortfolioBalance {
  token: SecurityToken;
  total: BigNumber;
  locked: BigNumber;
}

export interface SettlementLeg {
  token: SecurityToken;
  amount: BigNumber;
  direction: SettlementDirection;
}

export interface HistoricSettlement {
  blockNumber: BigNumber;
  status: SettlementResult;
  account: Account;
  legs: SettlementLeg[];
}
